from flask import Blueprint

bp = Blueprint('templates_bp', __name__)

from app.templates_bp import routes 