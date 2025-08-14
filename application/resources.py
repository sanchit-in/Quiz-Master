from flask import request, jsonify
from flask_restful import Resource
from flask_security import hash_password, auth_required, roles_required, current_user, verify_password
from .database import db
from .models import *
from flask import current_app as app
from datetime import datetime
from .tasks import quiz_report
from application.cache import cache
from sqlalchemy.sql import func




class LoginPage(Resource):
    def post(self):
        data = request.get_json()

        if not data or not data.get('email') or not data.get('password'):
            return {"error": "Email and password are required"}, 400
    
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return {"error": "Invalid email or password"}, 404
        
        if not verify_password(data['password'], user.password):
            return {"error": "Invalid credentials"}, 401
        
        token = user.get_auth_token()
        role = "admin" if any(role.name == "admin" for role in user.roles) else "user"
        id = user.id
        
        return {
            "message": "Login successful",
            "id" : id,
            "token": token,
            "role": role
        }, 200
    
# Authentication Routes
class AdminHome(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        return {"message": "Admin logged in successfully"}

class UserHome(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user = current_user
        return {
            "username": user.username,
            "email": user.email,
            "password": user.password
        }

class RegisterUser(Resource):
    def post(self):
        credentials = request.get_json()   

        if not app.security.datastore.find_user(email=credentials["email"]):
            app.security.datastore.create_user(
                email=credentials["email"],
                full_name =credentials["full_name"],
                username=credentials["username"],
                password=hash_password(credentials["password"]),
                roles=['user']
            )
            db.session.commit()
            return {"message": "User created successfully"}, 201

        return {"message": "User already exists"}, 400

# Admin Dashboard
class AdminUsers(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        user = User.query.all()

        return{
            "user" : [{"id":u.id ,"email": u.email, "username":u.username,"full_name":u.full_name} for u in user[1:]]
        }


class AdminDashboard(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        subjects = Subject.query.all()

        subject_data =[
            {
            "id" :subject.id,
            "name" : subject.name,
            "description" : subject.description
            }
            for subject in subjects
        ]
        return {
            "subjects": subject_data
        }

# Subject Management
class SubjectList(Resource):
 
    @auth_required("token")
    @roles_required("admin")
    def post(self):
        details = request.get_json()
        subject = Subject(name=details.get("name"), description=details.get("description"))
        db.session.add(subject)
        db.session.commit()
        return {"message": "Subject is added"}, 201
    
    @auth_required("token")
    @roles_required("admin")
    def get(self):
        subjects = Subject.query.all()
        return [{
            "id": s.id,
            "name": s.name,
            "description": s.description
        } for s in subjects]

class SubjectManage(Resource):
    @auth_required("token")
    @roles_required("admin")
    def delete(self, id):
        subject = Subject.query.get(id)
        if not subject:
            return {"error": "Subject not found"}, 404

        db.session.delete(subject)
        db.session.commit()
        return {"message": "Subject deleted successfully"}, 200
    
    @auth_required("token")
    @roles_required("admin")
    def put(self, id):
        subject = Subject.query.get(id)
        if not subject:
            return {"error": "Subject not found"}, 404
        
        data = request.get_json()

        subject.name = data.get("name" , subject.name)
        subject.description = data.get("description", subject.description)

        db.session.commit()
        return {"message": "Subject updated! "}, 200

# Chapter Management
class ChapterList(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self, id):
        chapters = Chapter.query.filter_by(subject_id=id).all()
        return [{
            "id": c.id,
            "name": c.name,
            "description": c.description
        } for c in chapters]
    
    
    @auth_required("token")
    @roles_required("admin")
    def post(self,id):
        details = request.get_json()
        chapter = Chapter(name=details.get("name"), description=details.get("description"),subject_id= id)
        db.session.add(chapter)
        db.session.commit()
        return {"message": "Chapter is added"}, 201


class ChapterManage(Resource):
    @auth_required("token")
    @roles_required("admin")
    def delete(self, id, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"error": "Chapter not found"}, 404

        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted!"}, 200
    
    @auth_required("token")
    @roles_required("admin")
    def put(self, id, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"error": "Chapter not found"}, 404
        
        data = request.get_json()

        chapter.name = data.get("name" , chapter.name)
        chapter.description = data.get("description", chapter.description)

        db.session.commit()
        return {"message": "Chapter updated! "}, 200
   

# Quiz Management
class QuizList(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self, id, chapter_id):
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()

        if not quizzes:
            return {"message": "No quizzes found"}, 404
    
        return {
            "quizzes": [{
                "id": q.id,
                "chapter_id": q.chapter_id,
                "quiz_date": str(q.quiz_date),  
                "quiz_time": q.quiz_time.strftime("%H:%M"),  
                "time_duration": q.time_duration,
                "remark": q.remark
            } for q in quizzes]
        }

    @auth_required("token")
    @roles_required("admin")
    def post(self, id, chapter_id):
        data = request.get_json()

        quiz_date = datetime.strptime(data["quiz_date"], "%Y-%m-%d").date()
        quiz_time_str = data["quiz_time"][:5]
        quiz_time = datetime.strptime(data["quiz_time"], "%H:%M").time()
        time_duration = int(data["time_duration"])

        new_quiz = Quiz(
                chapter_id=chapter_id,
                quiz_date=quiz_date,
                quiz_time=quiz_time,
                time_duration=time_duration,
                remark=data["remark"]
            )

        db.session.add(new_quiz)
        db.session.commit()

        result = quiz_report.delay(current_user.username)
        return {"message": "Quiz created successfully", "id": new_quiz.id}, 201

class QuizManage(Resource):
    @auth_required("token")
    @roles_required("admin")
    def delete(self, id,chapter_id, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted successfully"}, 200
    
    @auth_required("token")
    @roles_required("admin")
    def put(self, id, chapter_id, quiz_id):
        data = request.get_json()
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {"message": "Quiz not found"}, 404

        if "quiz_date" in data:
            quiz.quiz_date = datetime.strptime(data["quiz_date"], "%Y-%m-%d").date()
        if "quiz_time" in data:
            quiz_time_str = data["quiz_time"][:5] 
            quiz.quiz_time = datetime.strptime(data["quiz_time"], "%H:%M").time()
        if "time_duration" in data:
            quiz.time_duration = int(data["time_duration"])
        if "remark" in data:
            quiz.remark = data["remark"]

        db.session.commit()
        return {"message": "Quiz updated successfully"}, 200
    
# Question Management
class QuestionList(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self, id, chapter_id, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return {"questions": [{
            "id": q.id,
            "question": q.question,
            "option1" : q.option1,
            "option2" : q.option2,
            "option3" : q.option3,
            "option4" : q.option4,
            "answer": q.answer
        } for q in questions]}, 200

    @auth_required("token")
    @roles_required("admin")
    def post(self, id, chapter_id, quiz_id):
        details = request.get_json()

        new_question = Question(
            quiz_id=quiz_id,
            question =  details["question"],
            option1 =  details["option1"],
            option2 =  details["option2"],
            option3 =  details["option3"],
            option4 =  details["option4"],
           answer =  details["answer"]

        )
        print(new_question)

        db.session.add(new_question)
        db.session.commit()
        return { "ques_id" : new_question.id
                

    }, 201


class QuestionManage(Resource):
    @auth_required("token")
    @roles_required("admin")
    def delete(self, id, chapter_id, quiz_id, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404

        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted successfully"}, 200

    @auth_required("token")
    @roles_required("admin")
    def put(self, id, chapter_id, quiz_id, question_id):
        details = request.get_json()
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404

        required_fields = ["question", "option1", "option2", "option3", "option4", "answer"]
        if not all(field in details for field in required_fields):
            return {"message": "Missing required fields"}, 400

        if details["answer"] not in [details["option1"], details["option2"], details["option3"], details["option4"]]:
            return {"message": "Answer must be one of the provided options"}, 400

        # Update question fields
        question.question = details["question"]
        question.option1 = details["option1"]
        question.option2 = details["option2"]
        question.option3 = details["option3"]
        question.option4 = details["option4"]
        question.answer = details["answer"]

        db.session.commit()
        return {"message": "Question updated successfully"}, 200
   

# User Dashboard
class UserDashboard(Resource):
    @auth_required("token")
    @roles_required("user")
    def get(self):
        return {
            "message": "Welcome to User Page",
            "upcoming_quizzes": ["Quiz 1", "Quiz 2", "Quiz 3"],
            "scores": ["Math: 80", "Science: 75"],
            "summary_charts": "Available"
        }

# User Quizzes
class UserQuizzes(Resource):
    @auth_required("token")
    @roles_required("user")
    def get(self):
        quizzes = Quiz.query.all()
        return [{
            "id": q.id,
            "subject": q.chapter.subject.name,
            "chapter": q.chapter.name,
            "date": str(q.quiz_date)
        } for q in quizzes]

#*************USER***********


# Admin Dashboard
class UserDashboard(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        quizzes = Quiz.query.all()

        quiz_data = [
            {
                "id": quiz.id,
                "quiz_date":quiz.quiz_date.strftime('%Y-%m-%d'),
                "quiz_time": quiz.quiz_time.strftime('%H:%M:%S'),
                "time_duration":quiz.time_duration,
                "remark": quiz.remark
            }
            for quiz in quizzes
        ]

        return {
            "quizzes": quiz_data
        }
    
class StartQuiz(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self, quiz_id):
        
        quiz = Quiz.query.get(quiz_id)
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
    
        questions_data = [{
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2,
            "option3": q.option3,
            "option4": q.option4
        } for q in questions]

        return {
            "quiz_id": quiz.id,
            "questions": questions_data
        }
    
class SubmitQuizResource(Resource):
    @auth_required('token')
    def post(self, quiz_id):
        data = request.get_json()
        quiz = Quiz.query.get(quiz_id)
       
        user_score = 0
        for question in quiz.questions:
            user_answer = data.get("answers", {}).get(str(question.id))
            if user_answer is not None and user_answer == question.answer:
                user_score += 1
        
        new_score = Score(user_id=current_user.id,
                        quiz_id=quiz_id,
                         total_marks=user_score)
        db.session.add(new_score)
        db.session.commit()
        return {"message": "Quiz submitted successfully", "score": user_score},
    
class UserScores(Resource):
    @auth_required('token')
    def get(self):
        user_id = current_user.id
        scores = Score.query.filter_by(user_id=user_id).all()
        return {"scores":[{"id":s.id ,"quiz_id": s.quiz_id,"total_marks": s.total_marks}for s in scores]}


class AdminSummaryResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        # Quiz-wise Top Scores

        total_users = User.query.count()
        total_subjects = Subject.query.count()
        total_chapters = Chapter.query.count()
        total_quizzes = Quiz.query.count()

        quiz_scores = (
            db.session.query(Quiz.id, Quiz.chapter_id, Quiz.quiz_date, db.func.max(Score.total_marks))
            .join(Score)
            .group_by(Quiz.id)
            .all()
        )
        quiz_top_scores = {
            f"Quiz {quiz_id} ({quiz_date})": score for quiz_id, _, quiz_date, score in quiz_scores
        }

        # Subject-wise User Attempts
        subject_attempts = {}
        subjects = Subject.query.all()
        
        for subject in subjects:
            subject_attempts[subject.name] = (
                db.session.query(Score.user_id)
                .join(Quiz)
                .join(Chapter)
                .filter(Chapter.subject_id == subject.id)
                .distinct()
                .count()
            )

        return jsonify({
            "total_users": total_users,
            "total_subjects": total_subjects,
            "total_chapters": total_chapters,
            "total_quizzes": total_quizzes,
            "quiz_top_scores": quiz_top_scores,
            "subject_user_attempts": subject_attempts
        })