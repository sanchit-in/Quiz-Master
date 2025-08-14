class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATION = True

class LocalDevelopmentConfig(Config):
    #configuration
    SQLALCHEMY_DATABASE_URI = "sqlite:///qm.sqlite3"
    DEBUG = True

    #config for security 
    SECRET_KEY = "this-is-a-hidden-key" # hash user credential in the session
    SECURITY_PASSWORD_HASH = "bcrypt" #mechanism for hashing password
    SECURITY_PASSWORD_SALT = "this-is-a-hidden-password-salt" #helps in hashing password
    WTF_CSRF_ENABLED = False # 
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"