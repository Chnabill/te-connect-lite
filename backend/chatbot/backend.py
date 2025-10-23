


from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA
from langchain.chains import LLMMathChain
from langgraph.graph import StateGraph, END
from langchain.tools import Tool
from langchain_experimental.tools.python.tool import PythonREPLTool
from typing import TypedDict, List, Optional, Dict, Any, Annotated
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader


import pandas as pd
import os
from io import StringIO
from dotenv import load_dotenv  
import torch


from pinecone import Pinecone, ServerlessSpec


torch.set_num_threads(1) 

load_dotenv()

# Get API keys from environment variables
pinecone_api_key = os.getenv('PINECONE_API_KEY')
if not pinecone_api_key:
    raise ValueError("PINECONE_API_KEY environment variable is required")
pc = Pinecone(pinecone_api_key)

index_name = "developer-quickstart-py"


# Only create the Pinecone index if it does not exist
if not pc.has_index(index_name):
    pc.create_index(
        name=index_name,
        dimension=384,  
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )

index = pc.Index(index_name)


groq_api_key = os.getenv('GROQ_API_KEY')
if not groq_api_key:
    raise ValueError("GROQ_API_KEY environment variable is required")


llm = ChatGroq(
    model_name="llama-3.3-70b-versatile", 
    groq_api_key=groq_api_key
)


embed = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


base_dir = os.path.dirname(os.path.abspath(__file__))
policy_path = os.path.join(base_dir, "hr_policy.txt")
loader = TextLoader(policy_path)
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)
texts = text_splitter.split_documents(documents)


vectorstore = PineconeVectorStore.from_documents(
    documents=texts,
    embedding=embed,
    index_name=index_name,
    text_key='text'
)


timekeeping_policy = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(
        search_kwargs={"k": 3}  
    ),
)


employee_data_path = os.path.join(base_dir, "employee_data.csv")
df = pd.read_csv(employee_data_path)
python = PythonREPLTool(locals={"df": df})


calculator = LLMMathChain.from_llm(llm=llm, verbose=True)


user = 'Alexander Verdad'
df_columns = df.columns.to_list()


tools = [
    Tool(
        name="Timekeeping Policies",
        func=timekeeping_policy.run,
        description="""
        Useful for when you need to answer questions about employee timekeeping policies.
        This tool has access to the company's HR policy document and can provide specific information about:
        - Vacation leave policies
        - Sick leave policies
        - Timekeeping rules
        - Leave application procedures
        - Policy exceptions and special cases
        """
    ),
    Tool(
        name="Employee Data",
        func=python.run,
        description=f"""
        Useful for when you need to answer questions about employee data stored in pandas dataframe 'df'. 
        Run python pandas operations on 'df' to help you get the right answer.
        'df' has the following columns: {df_columns}
        """
    ),
    Tool(
        name="Calculator",
        func=calculator.run,
        description="""
        Useful when you need to do math operations or arithmetic.
        """
    )
]


class AgentState(TypedDict):
    messages: List[Dict[str, str]]
    current_tool: Optional[Tool]
    tool_input: Optional[str]
    tool_output: Optional[str]
    next_step: str


def agent(state: AgentState) -> AgentState:

    user_message = state["messages"][-1]["content"]
    

    response = llm.invoke(
        f"""You are a helpful HR assistant. The user has asked: {user_message}
        
        Is this an HR-related question that I can help with? Answer with just 'yes' or 'no'."""
    )
    
    is_hr_question = response.content.strip().lower() == 'yes'
    
    if not is_hr_question:

        response = llm.invoke(
            f"""The user has asked: {user_message}
            
            This is not an HR-related question. Please provide a polite response explaining that you are an HR assistant and can only help with HR-related questions. 
            You can mention that you can help with:
            - Vacation and leave policies
            - Employee data and records
            - Timekeeping and attendance
            - HR policies and procedures
            - Other HR-related matters"""
        )
        state["messages"].append({"role": "assistant", "content": response.content})
        state["next_step"] = "end"
        return state
    

    response = llm.invoke(
        f"""You are a helpful HR assistant. You have access to the following tools:
        {[tool.name for tool in tools]}
        
        User: {user_message}
        
        Choose the most appropriate tool to answer this question. Respond with just the tool name."""
    )
    
    tool_name = response.content.strip()
    state["current_tool"] = next(tool for tool in tools if tool.name == tool_name)
    

    response = llm.invoke(
        f"""Given the user's question: {user_message}
        And the chosen tool: {tool_name}
        What should be the input to this tool? Respond with just the input."""
    )
    
    state["tool_input"] = response.content.strip()
    state["next_step"] = "execute_tool"
    return state

def execute_tool(state: AgentState) -> AgentState:
    if state["current_tool"] and state["tool_input"]:
        state["tool_output"] = state["current_tool"].func(state["tool_input"])
    state["next_step"] = "generate_response"
    return state


def generate_response(state: AgentState) -> AgentState:
    if state["tool_output"]:
        response = llm.invoke(
            f"""Given the tool output: {state['tool_output']}
            Generate a helpful response to the user's question. Make sure to:
            1. Use specific information from the policy document when available
            2. Be clear and concise
            3. Format the response in a readable way
            4. Include relevant policy details and procedures"""
        )
        state["messages"].append({"role": "assistant", "content": response.content})
    state["next_step"] = "end"
    return state


workflow = StateGraph(AgentState)


workflow.add_node("agent", agent)
workflow.add_node("execute_tool", execute_tool)
workflow.add_node("generate_response", generate_response)


workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    lambda x: x["next_step"],
    {
        "execute_tool": "execute_tool",
        "end": END
    }
)
workflow.add_conditional_edges(
    "execute_tool",
    lambda x: x["next_step"],
    {
        "generate_response": "generate_response",
        "end": END
    }
)
workflow.add_conditional_edges(
    "generate_response",
    lambda x: x["next_step"],
    {
        "end": END
    }
)


app = workflow.compile()


def get_response(user_input: str) -> str:
    state: AgentState = {
        "messages": [{"role": "user", "content": user_input}],
        "current_tool": None,
        "tool_input": None,
        "tool_output": None,
        "next_step": "agent"
    }
    result = app.invoke(state)
    return result["messages"][-1]["content"]