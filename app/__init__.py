from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from config import Config
from app.models import db

migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
csrf = CSRFProtect()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    csrf.init_app(app)
    
    # Register blueprints
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    from app.dashboard import bp as dashboard_bp
    app.register_blueprint(dashboard_bp)
    
    from app.templates_bp import bp as templates_bp
    app.register_blueprint(templates_bp, url_prefix='/templates')
    
    from app.editor import bp as editor_bp
    app.register_blueprint(editor_bp, url_prefix='/editor')
    
    # Exempt specific routes from CSRF protection
    csrf.exempt(editor_bp)  # This will exempt all routes in the editor blueprint
    
    from app.rsvp import bp as rsvp_bp
    app.register_blueprint(rsvp_bp, url_prefix='/rsvp')
    
    @login_manager.user_loader
    def load_user(id):
        from app.models import User
        return User.query.get(int(id))
    
    return app 