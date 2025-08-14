from flask import Flask
from application.database import db
from application.models import User,Role
from application.config import LocalDevelopmentConfig
from application.routes import Resource
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from application.celery_init import celery_init_app
from celery.schedules import crontab
from application.cache import cache

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app,datastore)
    app.app_context().push()
    Resource(app)
    return app

app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name = "admin", description ="Superuser of app")
    app.security.datastore.find_or_create_role(name = "user", description ="Generaluser of app")
    db.session.commit()

    if not app.security.datastore.find_user(email ="user@admin.com"):
        app.security.datastore.create_user(email ="user@admin.com",
                                           username = "admin",
                                           password = hash_password("1234"),
                                           full_name = "Default",
                                           roles = ['admin'])
        
    if not app.security.datastore.find_user(email ="user@user.com"):
        app.security.datastore.create_user(email ="user@user.com",
                                           username = "user",
                                           password = hash_password("1234"),
                                           full_name = "Default",
                                           qualification = "N/A",
                                           dob = None,
                                           roles = ['user'])

    db.session.commit()

from application.routes import *


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(0, 0, day_of_month='1'),
        monthly_report.s(),
    )

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender , **kwargs):
    sender.add_periodic_task(
        crontab(minute=0, hour=20),
        quiz_report.s(),
    )

if __name__ == "__main__":
    app.run(debug=True)