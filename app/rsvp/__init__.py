from flask import Blueprint

bp = Blueprint('rsvp', __name__)

from app.rsvp import routes 