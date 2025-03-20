from flask import render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_required, current_user
from app.rsvp import bp
from app.models import RSVP, Invitation, Event, db
from datetime import datetime

@bp.route('/')
@login_required
def index():
    # Get user's events
    events = Event.query.filter_by(user_id=current_user.id).all()
    
    # Get event_id from query param if present
    event_id = request.args.get('event_id', type=int)
    
    # Get RSVPs for the selected event, or first event if none selected
    if event_id:
        event = Event.query.get_or_404(event_id)
        if event.user_id != current_user.id:
            return redirect(url_for('dashboard.index'))
    elif events:
        event = events[0]
        event_id = event.id
    else:
        event = None
    
    # Get RSVPs if we have an event
    rsvps = []
    if event:
        rsvps = RSVP.query.join(Invitation).join(Event).filter(
            Event.id == event_id,
            Event.user_id == current_user.id
        ).all()
    
    return render_template('rsvp/index.html', 
                           events=events,
                           selected_event=event,
                           rsvps=rsvps)

@bp.route('/<invitation_custom_url>', methods=['GET', 'POST'])
def public_rsvp(invitation_custom_url):
    # Find invitation by custom URL
    invitation = Invitation.query.filter_by(custom_url=invitation_custom_url).first_or_404()
    
    if request.method == 'POST':
        # Process RSVP submission
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        guest_count = request.form.get('guest_count', type=int, default=1)
        attending = request.form.get('attending') == 'yes'
        
        if not first_name or not last_name:
            return render_template('rsvp/public.html', 
                                  invitation=invitation,
                                  error="Please provide your name")
        
        # Create new RSVP
        rsvp = RSVP(
            invitation_id=invitation.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            guest_count=guest_count,
            attending=attending
        )
        
        db.session.add(rsvp)
        db.session.commit()
        
        return render_template('rsvp/thank_you.html', 
                              invitation=invitation,
                              event=invitation.event)
    
    # Display RSVP form
    return render_template('rsvp/public.html', invitation=invitation)

@bp.route('/submit/<int:invitation_id>', methods=['POST'])
def submit(invitation_id):
    invitation = Invitation.query.get_or_404(invitation_id)
    
    # Get form data
    guest_name = request.form.get('guest_name')
    email = request.form.get('email')
    attending = request.form.get('attending') == 'yes'
    guest_count = request.form.get('guest_count', type=int, default=1)
    message = request.form.get('message', '')
    
    if not guest_name or not email:
        flash('Please fill out all required fields.')
        return redirect(url_for('editor.view_invitation', invitation_id=invitation_id))
    
    # Create RSVP entry
    rsvp = RSVP(
        invitation_id=invitation.id,
        guest_name=guest_name,
        email=email,
        attending=attending,
        guest_count=guest_count,
        message=message,
        created_at=datetime.utcnow()
    )
    
    db.session.add(rsvp)
    db.session.commit()
    
    return render_template('rsvp/thank_you.html', 
                          event=invitation.event,
                          attending=attending) 