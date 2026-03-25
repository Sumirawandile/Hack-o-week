import streamlit as st
import string
import nltk
import re
import pandas as pd
from datetime import datetime
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

st.set_page_config(page_title="Institute Enquiry Bot", page_icon="🎓", layout="wide")


@st.cache_resource
def download_nltk_data():
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt_tab', quiet=True)

download_nltk_data()
lemmatizer = WordNetLemmatizer()


qa_pairs = {
    "hello": "Hello! Welcome to the Institute Enquiry Bot.",
    "hi": "Hello! Welcome to the Institute Enquiry Bot.",
    "timing": "Our college is open Monday to Friday, 9:00 AM to 5:00 PM.",
    "fee": "The annual fee for the B.Tech program is $2,500.",
    "course": "We offer B.Tech, M.Tech, and MBA programs.",
    "contact": "You can reach us at contact@institute.edu.",
    "exam": "Mid-terms are in Nov, and End-terms are in Dec. Which one do you need?",
    "bye": "Goodbye!"
}


st.sidebar.title("📱 Channel Mockup (Task 9)")
channel = st.sidebar.selectbox("Simulate platform:", ["Web App", "WhatsApp", "SMS"])

def format_for_channel(text, channel):
    if channel == "WhatsApp":
        return f"🤖 *Bot Reply:*\n{text}\n\n_Type 'Menu' for options._"
    elif channel == "SMS":
        return f"Reply: {text[:100]}..."
    return text


def extract_entities(text):
    sem_match = re.search(r"(?i)(?:sem|semester)\s*(\d+)", text)
    course_match = re.search(r"(?i)\b(cs|me|ee|it|mba|b\.tech|m\.tech)\b", text)
    return (sem_match.group(1) if sem_match else None,
            course_match.group(1).upper() if course_match else None)


def get_response(raw_input):
    user_text = raw_input.lower()
    sem, course = extract_entities(user_text)
    entity_log = f"Sem: {sem or 'N/A'}, Course: {course or 'N/A'}"
    
    tokens = word_tokenize(user_text)
    stop_words = set(stopwords.words('english'))
    cleaned_words = [lemmatizer.lemmatize(w) for w in tokens if w not in string.punctuation and w not in stop_words]
    
    current_topic = None
    for w in cleaned_words:
        if w in qa_pairs:
            current_topic = w
            break
            
    is_follow_up = False
    if not current_topic and (sem or course):
        if st.session_state.context.get("last_topic"):
            current_topic = st.session_state.context["last_topic"]
            is_follow_up = True

    if current_topic:
        st.session_state.context["last_topic"] = current_topic
        base_ans = qa_pairs[current_topic]
        
        # Dynamic Overrides based on Context
        if current_topic == "exam":
            if "end" in user_text or "final" in user_text:
                base_ans = "End-term exams are scheduled to begin on December 20th."
            elif "mid" in user_text:
                base_ans = "Mid-term exams generally start on November 15th."
        
        if current_topic == "timing":
            if course == "MBA":
                base_ans = "MBA evening batches run from 5:00 PM to 9:00 PM."
            elif course:
                base_ans = f"Regular {course} classes are held from 9:00 AM to 4:00 PM."
                
        if current_topic == "fee":
            if course == "MBA":
                base_ans = "The fee for the MBA program is $4,000 per semester."
            elif course:
                base_ans = f"The fee for the {course} program is $2,500 per semester."

        prefix = f"Ah, following up on {current_topic}! " if is_follow_up else ""
        if course and sem:
            final_ans = f"{prefix}For **{course}** (Semester **{sem}**): {base_ans}"
        elif course:
            final_ans = f"{prefix}For **{course}**: {base_ans}"
        elif sem:
            final_ans = f"{prefix}For Semester **{sem}**: {base_ans}"
        else:
            final_ans = base_ans
            
        return final_ans, current_topic, entity_log

    fallback_msg = "I didn't quite catch that. Did you mean to ask about Fees, Timings, Courses, or Exams?"
    return fallback_msg, "Fallback/Unknown", entity_log


if "messages" not in st.session_state:
    st.session_state.messages = []
if "context" not in st.session_state:
    st.session_state.context = {"last_topic": None}
if "analytics_log" not in st.session_state:
    st.session_state.analytics_log = []

st.title("🎓 Smart Institute Bot")


for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

if prompt := st.chat_input("Type your question here..."):
    # Save & Show User Input
    with st.chat_message("user"):
        st.markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Generate Response & Format for Channel
    raw_response, intent, entities = get_response(prompt)
    final_response = format_for_channel(raw_response, channel)
    
    # Save & Show Bot Response
    with st.chat_message("assistant"):
        st.markdown(final_response)
    st.session_state.messages.append({"role": "assistant", "content": final_response})
    
    # Task 10: Log to Analytics
    st.session_state.analytics_log.append({
        "Timestamp": datetime.now().strftime("%H:%M:%S"),
        "Query": prompt,
        "Intent": intent,
        "Entities": entities
    })


st.sidebar.markdown("---")
st.sidebar.title("📊 Analytics (Task 10)")
if st.session_state.analytics_log:
    df = pd.DataFrame(st.session_state.analytics_log)
    st.sidebar.dataframe(df, use_container_width=True)
    failed = len(df[df["Intent"] == "Fallback/Unknown"])
    st.sidebar.caption(f"Unanswered Queries: {failed}")
else:
    st.sidebar.info("Chat with the bot to see logs here.")
