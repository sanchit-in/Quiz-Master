from .database import db
from flask_security import UserMixin,RoleMixin

class User(db.Model,UserMixin):
    id = db.Column(db.Integer , primary_key = True)
    email = db.Column(db.String, unique=True,nullable=False)
    username = db.Column(db.String, unique=True,nullable=False)
    password = db.Column(db.String,nullable = False)
    full_name = db.Column(db.String , nullable = False)
    qualification = db.Column(db.String)
    dob = db.Column(db.Date)
    fs_uniquifier = db.Column(db.String,unique = True,nullable= False) #token
    active = db.Column(db.Boolean,nullable = False) # to give more access to admin to control the user 
    roles = db.relationship('Role',backref = 'bearer' , secondary = 'users_roles')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer , primary_key = True)
    name = db.Column(db.String,unique=True,nullable = False)
    description = db.Column(db.String)

# many-to-many relation
class UsersRoles(db.Model):
    id = db.Column(db.Integer , primary_key =True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', backref='subject')

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.Text)
    quizzes = db.relationship('Quiz', backref='chapter')

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    quiz_date = db.Column(db.Date, nullable=False)
    quiz_time = db.Column(db.Time, nullable= False)
    time_duration = db.Column(db.String)
    remark = db.Column(db.Text)
    questions = db.relationship('Question', backref='quiz')
    scores = db.relationship('Score', backref='quiz')

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'),nullable=False)
    question = db.Column(db.Text, nullable= False)
    option1 = db.Column(db.String,nullable= False)
    option2 = db.Column(db.String,nullable= False)
    option3 = db.Column(db.String,nullable= False)
    option4 = db.Column(db.String,nullable= False)
    answer = db.Column(db.String, nullable= False)
    
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id= db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable = False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    attempt_timing = db.Column(db.Integer)
    total_marks = db.Column(db.Integer, nullable = False)
    user = db.relationship("User" , backref ="score")