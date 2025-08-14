from flask_restful import Api
from .resources import *
from flask import current_app as app ,render_template,send_from_directory
from flask import render_template , send_from_directory
from celery.result import AsyncResult
from application.tasks import csv_report,monthly_report

def Resource(app):
    @app.route('/',methods=['GET'])
    def home():
        return render_template('index.html')
    api = Api(app)

    api.add_resource(LoginPage,"/api/login")
    api.add_resource(AdminHome, "/api/admin")
    api.add_resource(UserHome, "/api/home")
    api.add_resource(RegisterUser, "/api/register")
    api.add_resource(AdminDashboard, "/api/admin/dashboard")
    api.add_resource(AdminUsers, "/api/admin/users")

    api.add_resource(SubjectList, "/api/admin/subjects")
    api.add_resource(SubjectManage, "/api/admin/subjects/<int:id>")


    api.add_resource(ChapterList, "/api/admin/subjects/<int:id>/chapters")
    api.add_resource(ChapterManage, "/api/admin/subject/<int:id>/chapters/<int:chapter_id>")


    api.add_resource(QuizManage, "/api/admin/subject/<int:id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>")
    api.add_resource(QuizList, "/api/admin/subject/<int:id>/chapters/<int:chapter_id>/quizzes")


    api.add_resource(QuestionManage, "/api/admin/subject/<int:id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>/questions/<int:question_id>")
    api.add_resource(QuestionList, "/api/admin/subject/<int:id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>/questions")


    api.add_resource(UserDashboard, "/api/user/dashboard")
    api.add_resource(StartQuiz, "/api/user/dashboard/quiz/<int:quiz_id>")
    api.add_resource(UserScores, '/api/user/scores')
    api.add_resource(SubmitQuizResource, "/api/user/quiz/<int:quiz_id>")
    api.add_resource(AdminSummaryResource,"/api/admin/summary")
    

    @app.route('/api/export')
    def export_csv():
        result = csv_report.delay()

        return jsonify({
            "id":result.id,
            "result" : result.result,
        })

    @app.route('/api/csv_result/<id>')
    def csv_result(id):
            res = AsyncResult(id)
            return send_from_directory('static',res.result)
    
    @app.route('/api/mail')
    def send_reports():
        res = monthly_report.delay()
        return{
             "result": res.result
        }




