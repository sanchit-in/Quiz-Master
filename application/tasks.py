from celery import shared_task
import datetime
from .models import User , Chapter , Quiz , Score
from .utils import format_report
from .mail import send_email
import csv 
from application.database import db
import requests
import json

@shared_task(ignore_results = False, name = "download_csv_report")
def csv_report():
    data = db.session.query(
        Score.user_id,
        Score.quiz_id,
        Chapter.id,
        Quiz.quiz_date,
        Score.total_marks,
        Quiz.remark
    ).join(Quiz, Score.quiz_id == Quiz.id).join(Chapter, Quiz.chapter_id == Chapter.id).all()

    csv_file_name = f"quiz_details_{datetime.datetime.now().strftime('%f')}.csv"

    with open(f'static/{csv_file_name}','w',newline = "") as csvfile:
        sr_no = 1
        quiz_csv = csv.writer(csvfile , delimiter = ',')
        quiz_csv.writerow(['S.No.' , 'User ID' , 'Quiz ID', 'Chapter ID' , 'Date of Quiz' , 'Score' , 'Remarks' ])
        for q in data:
            this_quiz = [sr_no , q.user_id , q.quiz_id , q.id , q.quiz_date , q.total_marks , q.remark]
            quiz_csv.writerow(this_quiz)
            sr_no+=1

    return csv_file_name


@shared_task(ignore_results = False, name = "monthly_reports")
def monthly_report():
    users = User.query.all()
    start_date = datetime.date.today().replace(day=1)  
    end_date = datetime.date.today() 

    for user in users:
        user_data = {
            'username': user.username,
            'email': user.email,
            'quizzes': []
        }

        scores = Score.query.filter(
            Score.user_id == user.id,
            Score.attempt_timing.between(start_date, end_date)
        ).all()

        total_score = 0

        for score in scores:
            quiz = Quiz.query.get(score.quiz_id)
            user_data['quizzes'].append({
                'name': quiz.id,  
                'date': score.attempt_timing.strftime('%Y-%m-%d'),
                'score': score.total_marks
            })
            total_score += score.total_marks

        avg_score = total_score / len(scores) if scores else 0
        user_data['total_quizzes'] = len(scores)
        user_data['avg_score'] = round(avg_score, 2)

        message = format_report('templates/mail_details.html', user_data)
        send_email(user.email, subject="Monthly Quizzes Report", message=message)

    return "Monthly reports sent successfully."

@shared_task(ignore_results = False, name = "quiz_update")
def quiz_report(name):
    text = f"Hey {name} ,New quizzes have been added!"
    response = requests.post("https://chat.googleapis.com/v1/spaces/AAAAe4jCpdk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=r941VTSTfUPS5kCwTlr9YoneA9743Nmx7sYzMnsnJtg" , headers = {'Content-type' : 'application/json'}  , json = {"text" : text})
    
    return "Quiz detail is sent to user"
