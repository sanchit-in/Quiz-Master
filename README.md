# 🎯 Quiz Master

**Live Demo:** [View on Render](https://quiz-master-25ix.onrender.com)

**Quiz Master** is a Flask-based web application for managing and playing quizzes.  
It allows administrators to create, update, and delete quiz questions, while users can participate in quizzes, track scores, and view results.

---

## 🚀 Features

### 👨‍💼 Admin
- Add, edit, and delete quiz questions.
- Categorize questions by topic/difficulty.
- Manage users and view scores.

### 👤 User
- Register and log in to take quizzes.
- Choose quiz topics and attempt timed quizzes.
- View score and feedback after completion.

---

## 🛠 Tech Stack
**Backend:** Python, Flask, Flask-RESTful, Flask-SQLAlchemy  
**Frontend:** HTML5, CSS3, JavaScript, Jinja2 Templates  
**Database:** SQLite  
**Other Libraries:** Flask-Security-Too, Flask-WTF, Flask-Caching

---

## 📂 Project Structure
project/
│
├── app.py # Flask application entry point
├── application/ # Contains routes, resources, caching
├── templates/ # HTML templates
├── static/ # CSS, JS, images
├── requirements.txt # Dependencies
├── Procfile # For Render deployment
└── README.md # Project documentation


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/yourusername/Quiz-Master.git
cd Quiz-Master

2️⃣ Create a virtual environment
python -m venv venv

3️⃣ Activate the environment

Windows PowerShell:

venv\Scripts\activate


Mac/Linux:

source venv/bin/activate

4️⃣ Install dependencies
pip install -r requirements.txt

5️⃣ Run the application
python app.py


or

flask run


The app will start at:

http://127.0.0.1:5000/
