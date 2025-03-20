from app import create_app, db
from app.models import User, Event, Template, Invitation, RSVP

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {
        'db': db, 
        'User': User, 
        'Event': Event, 
        'Template': Template, 
        'Invitation': Invitation,
        'RSVP': RSVP
    }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True) 