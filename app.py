import os
from cryptography.fernet import Fernet
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_compress import Compress

SESSION_TOKEN_ENCRYPTION_KEY = os.environ["SESSION_TOKEN_ENCRYPTION_KEY"].encode("utf-8")

fernet = Fernet(SESSION_TOKEN_ENCRYPTION_KEY)
db = SQLAlchemy()
migrate = Migrate()
compress = Compress()


def create_app():
    app = Flask(__name__)
    compress.init_app(app)
    app.config.from_mapping(
        SECRET_KEY=SESSION_TOKEN_ENCRYPTION_KEY,
        # SQLAlchemy 1.4 removed the deprecated postgres dialect name, the name postgresql must be used instead now
        # Heroku uses postgres in the DATABASE_URL
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL").replace("postgres://", "postgresql://")
        or "sqlite:///" + os.path.join(app.instance_path, "epsdemo.sqlite"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)
    migrate.init_app(app, db)

    return app


app = create_app()

from routes import *

if __name__ == "__main__":
    app.run(port=5000, debug=DEV_MODE)
