import streamlit as st
import random
from streamlit_chat import message

from backend import get_response


def process_input(user_input):
    response = get_response(user_input)
    return response

st.header("HR Chatbot")
st.markdown("Ask your HR-related questions here.")


if "messages" not in st.session_state:
    st.session_state.messages = []


chat_container = st.container()


with chat_container:
    for message in st.session_state.messages:
        if message["role"] == "user":
            st.chat_message("user").write(message["content"])
        else:
            st.chat_message("assistant").write(message["content"])


user_input = st.chat_input("Type your message here...")

if user_input:
    
    st.session_state.messages.append({"role": "user", "content": user_input})
    
    
    response = process_input(user_input)
    st.session_state.messages.append({"role": "assistant", "content": response})
    
    
    st.rerun()