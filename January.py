import streamlit as st
import string
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# --- 1. NLTK SETUP ---
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt_tab', quiet=True)
except Exception as e:
    st.error(f"Error downloading NLTK data: {e}")

# --- 2. PAGE CONFIG ---
# We removed the CSS block here. Streamlit defaults to white/light mode.
st.set_page_config(page_title="Institute Enquiry Bot", page_icon="🎓")

st.title("🎓 Institute Enquiry Chatbot")
st.write("Ask me about fees, timings, courses, or contact info!")

# --- 3. DATA & PREPROCESSING ---
lemmatizer = WordNetLemmatizer()

qa_pairs = {
    "hello": "Hello! Welcome to the Institute Enquiry Bot. How can I help you?",
    "hi": "Hello! Welcome to the Institute Enquiry Bot. How can I help you?",
    "timing": "Our college is open Monday to Friday, 9:00 AM to 5:00 PM.",
    "fee": "The annual fee for the B.Tech program is $2,500.",
    "course": "We offer B.Tech, M.Tech, and MBA programs.",
    "contact": "You can reach us at contact@institute.edu or call 555-0199.",
    "address": "We are located at 123 Education Lane, Knowledge City.",
    "admission": "Admissions are currently open. Visit our website to apply.",
    "library": "The library is open 24/7 for students with a valid ID card.",
    "exam": "Mid-term exams start on November 15th.",
    "holiday": "The next holiday is on Friday for National Day.",
    "bye": "Goodbye! Have a great day!"
}

def preprocess_input(user_input):
    user_input = user_input.lower()
    tokens = word_tokenize(user_input)
    stop_words = set(stopwords.words('english'))
    clean_tokens = []
    
    for word in tokens:
        if word not in string.punctuation and word not in stop_words:
            root_word = lemmatizer.lemmatize(word)
            clean_tokens.append(root_word)
            
    return clean_tokens

def get_response(user_input):
    cleaned_words = preprocess_input(user_input)
    for word in cleaned_words:
        if word in qa_pairs:
            return qa_pairs[word]     
    return "I'm not sure about that. Please ask about fees, timings, or courses."


if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Type your question here..."):
    with st.chat_message("user"):
        st.markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    response = get_response(prompt)
    
    with st.chat_message("assistant"):
        st.markdown(response)
    st.session_state.messages.append({"role": "assistant", "content": response})