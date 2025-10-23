"""
Simplified HR Chatbot Backend
This version uses local text search instead of Pinecone for better compatibility
"""

import os
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleHRChatbot:
    def __init__(self):
        self.hr_policy_content = self._load_hr_policy()
        self.employee_data = self._load_employee_data()
        
    def _load_hr_policy(self) -> str:
        """Load HR policy document"""
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            policy_path = os.path.join(base_dir, "hr_policy.txt")
            with open(policy_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error loading HR policy: {e}")
            return ""
    
    def _load_employee_data(self) -> Dict[str, Any]:
        """Load employee data"""
        try:
            import pandas as pd
            base_dir = os.path.dirname(os.path.abspath(__file__))
            employee_path = os.path.join(base_dir, "employee_data.csv")
            df = pd.read_csv(employee_path)
            return df.to_dict('records')
        except Exception as e:
            print(f"Error loading employee data: {e}")
            return []
    
    def _search_policy(self, query: str) -> List[str]:
        """Search for relevant policy sections"""
        if not self.hr_policy_content:
            return []
        
        query_lower = query.lower()
        lines = self.hr_policy_content.split('\n')
        relevant_sections = []
        
        # Find sections that contain query terms
        for i, line in enumerate(lines):
            if any(term in line.lower() for term in query_lower.split()):
                # Get context around the matching line
                start = max(0, i - 2)
                end = min(len(lines), i + 5)
                section = '\n'.join(lines[start:end])
                if section not in relevant_sections:
                    relevant_sections.append(section)
        
        return relevant_sections[:3]  # Return top 3 relevant sections
    
    def _get_vacation_policy_info(self) -> str:
        """Get vacation policy information"""
        vacation_info = """
**Vacation Leave Policy:**

• **Eligibility**: All regular full-time employees
• **Accrual**: 1.25 days per month (15 days per year)
• **Application**: Submit through Employee Self Service portal at least 1 day before
• **Carryover**: Up to 30 days can be carried over to next year
• **Encashment**: Unused leave can be encashed at basic salary rate
• **Probation**: Not eligible during probation period

**Application Process:**
1. Submit request through Employee Self Service portal
2. Get approval from immediate supervisor
3. Submit at least 1 day in advance
        """
        return vacation_info
    
    def _get_sick_leave_info(self) -> str:
        """Get sick leave information"""
        sick_info = """
**Sick Leave Policy:**

• **Eligibility**: All regular full-time employees
• **Accrual**: 1.25 days per month (15 days per year)
• **Application**: Submit through Employee Self Service portal
• **Documentation**: Medical certificate required for 2+ consecutive days
• **Carryover**: Up to 30 days can be carried over
• **Encashment**: Cannot be encashed
• **Probation**: 0.625 days per month (7.5 days per year) during probation
        """
        return sick_info
    
    def _get_service_incentive_info(self) -> str:
        """Get service incentive leave information"""
        service_info = """
**Service Incentive Leave Policy:**

• **Eligibility**: Employees with at least 1 year of service
• **Entitlement**: 5 days per year
• **Application**: Submit through Employee Self Service portal at least 1 day before
• **Carryover**: Cannot be carried over (forfeited if unused)
• **Encashment**: Can be encashed at basic salary rate
• **Probation**: Not eligible during probation
        """
        return service_info
    
    def get_response(self, user_input: str) -> str:
        """Generate response based on user input"""
        user_input_lower = user_input.lower()
        
        # Greeting responses
        if any(word in user_input_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return "Hello! I'm your HR Assistant. I can help you with HR policies, leave requests, employee information, and other HR-related questions. What would you like to know?"
        
        # Vacation/Leave related queries
        if any(word in user_input_lower for word in ['vacation', 'vacation leave', 'annual leave']):
            return self._get_vacation_policy_info()
        
        if any(word in user_input_lower for word in ['sick', 'sick leave', 'medical leave']):
            return self._get_sick_leave_info()
        
        if any(word in user_input_lower for word in ['service incentive', 'incentive leave', 'sil']):
            return self._get_service_incentive_info()
        
        # General leave policy
        if any(word in user_input_lower for word in ['leave policy', 'leave policies', 'time off']):
            return """
**Available Leave Types:**

1. **Vacation Leave** - 15 days per year for regular employees
2. **Sick Leave** - 15 days per year for regular employees  
3. **Service Incentive Leave** - 5 days per year (after 1 year of service)
4. **Paternity Leave** - 7 days per childbirth (up to 4 instances)

All leave applications must be submitted through the Employee Self Service portal with supervisor approval.

Would you like detailed information about any specific leave type?
            """
        
        # Policy search
        if any(word in user_input_lower for word in ['policy', 'procedure', 'rule']):
            relevant_sections = self._search_policy(user_input)
            if relevant_sections:
                response = "Here's what I found in our HR policies:\n\n"
                for section in relevant_sections:
                    response += f"{section}\n\n"
                return response
            else:
                return "I couldn't find specific policy information for your query. Please contact HR for detailed policy information or try rephrasing your question."
        
        # Employee data queries
        if any(word in user_input_lower for word in ['employee', 'staff', 'personnel']):
            return "For employee-specific information and records, please contact your HR representative directly or access the Employee Self Service portal."
        
        # Help/capabilities
        if any(word in user_input_lower for word in ['help', 'what can you do', 'capabilities']):
            return """
**I can help you with:**

• **Leave Policies** - Vacation, sick leave, service incentive leave
• **Policy Information** - HR policies and procedures
• **Leave Applications** - How to apply for different types of leave
• **Leave Calculations** - Accrual rates and entitlements
• **General HR Questions** - Company policies and procedures

**Examples of questions you can ask:**
- "What is the vacation leave policy?"
- "How do I apply for sick leave?"
- "Can I carry over unused vacation days?"
- "What documents do I need for sick leave?"

What would you like to know about?
            """
        
        # Default response with policy search
        relevant_sections = self._search_policy(user_input)
        if relevant_sections:
            response = f"I found some relevant information about '{user_input}':\n\n"
            for section in relevant_sections:
                response += f"{section}\n\n"
            response += "Is this helpful? Feel free to ask for more specific information!"
            return response
        
        # Fallback response
        return f"""
I understand you're asking about: "{user_input}"

As your HR Assistant, I can help with:
• Leave policies (vacation, sick, service incentive)
• HR procedures and policies
• Leave application processes
• Policy clarifications

Could you please rephrase your question or ask about a specific HR topic? For example:
- "What is the vacation policy?"
- "How do I apply for leave?"
- "What are the leave entitlements?"
        """

# Create global instance
_chatbot_instance = None

def get_response(user_input: str) -> str:
    """Main function to get chatbot response"""
    global _chatbot_instance
    
    if _chatbot_instance is None:
        _chatbot_instance = SimpleHRChatbot()
    
    try:
        return _chatbot_instance.get_response(user_input)
    except Exception as e:
        print(f"Error in chatbot: {e}")
        return "I'm sorry, I encountered an error while processing your request. Please try again or contact HR for assistance."

# Test function
if __name__ == "__main__":
    print("Testing HR Chatbot...")
    test_queries = [
        "hello",
        "vacation policy",
        "sick leave",
        "how to apply for leave"
    ]
    
    for query in test_queries:
        print(f"\nQ: {query}")
        print(f"A: {get_response(query)}")
