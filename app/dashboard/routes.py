from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from datetime import datetime
from app.dashboard import bp
from app.models import Event, Invitation, Template, db

@bp.route('/')
@bp.route('/index')
@login_required
def index():
    # Get user's events
    events = Event.query.filter_by(user_id=current_user.id).all()
    
    # Get recent invitations
    invitations = Invitation.query.join(Event).filter(
        Event.user_id == current_user.id
    ).order_by(Invitation.updated_at.desc()).limit(5).all()
    
    # Get available templates
    templates = Template.query.filter(
        (Template.is_system == True) | (Template.created_by == current_user.id)
    ).all()
    
    return render_template('dashboard/index.html', 
                          title='Dashboard',
                          events=events,
                          invitations=invitations,
                          templates=templates)

@bp.route('/events')
@login_required
def events():
    events = Event.query.filter_by(user_id=current_user.id).all()
    return render_template('dashboard/events.html', title='My Events', events=events)

@bp.route('/events/create', methods=['POST'])
@login_required
def create_event():
    title = request.form.get('title')
    event_date_str = request.form.get('event_date')
    venue = request.form.get('venue')
    
    if not title or not event_date_str:
        flash('Event title and date are required')
        return redirect(url_for('dashboard.events'))
    
    try:
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d')
    except ValueError:
        flash('Invalid date format')
        return redirect(url_for('dashboard.events'))
    
    event = Event(
        title=title,
        event_date=event_date,
        venue=venue,
        user_id=current_user.id
    )
    
    db.session.add(event)
    db.session.commit()
    
    flash(f'Event "{title}" created successfully')
    return redirect(url_for('dashboard.event_details', event_id=event.id))

@bp.route('/events/<int:event_id>')
@login_required
def event_details(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Make sure the event belongs to the current user
    if event.user_id != current_user.id:
        flash('You do not have permission to view this event')
        return redirect(url_for('dashboard.events'))
    
    # Get invitations for this event
    invitations = Invitation.query.filter_by(event_id=event_id).all()
    
    # Get available templates for creating new invitations
    templates = Template.query.filter(
        (Template.is_system == True) | (Template.created_by == current_user.id)
    ).all()
    
    return render_template('dashboard/event_details.html', 
                          title=event.title,
                          event=event,
                          invitations=invitations,
                          templates=templates)

@bp.route('/events/<int:event_id>/update', methods=['POST'])
@login_required
def update_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Make sure the event belongs to the current user
    if event.user_id != current_user.id:
        flash('You do not have permission to edit this event')
        return redirect(url_for('dashboard.events'))
    
    title = request.form.get('title')
    event_date_str = request.form.get('event_date')
    venue = request.form.get('venue')
    
    if not title or not event_date_str:
        flash('Event title and date are required')
        return redirect(url_for('dashboard.event_details', event_id=event_id))
    
    try:
        event_date = datetime.strptime(event_date_str, '%Y-%m-%d')
    except ValueError:
        flash('Invalid date format')
        return redirect(url_for('dashboard.event_details', event_id=event_id))
    
    event.title = title
    event.event_date = event_date
    event.venue = venue
    
    db.session.commit()
    
    flash('Event updated successfully')
    return redirect(url_for('dashboard.event_details', event_id=event_id))

@bp.route('/events/<int:event_id>/delete', methods=['POST'])
@login_required
def delete_event(event_id):
    event = Event.query.get_or_404(event_id)
    
    # Make sure the event belongs to the current user
    if event.user_id != current_user.id:
        flash('You do not have permission to delete this event')
        return redirect(url_for('dashboard.events'))
    
    # Get all invitations for this event
    invitations = Invitation.query.filter_by(event_id=event_id).all()
    
    # Delete all RSVPs for each invitation
    for invitation in invitations:
        # This assumes you have a relationship set up with cascade delete
        # If not, you'd need to explicitly delete RSVPs here
        db.session.delete(invitation)
    
    # Delete the event
    db.session.delete(event)
    db.session.commit()
    
    flash(f'Event "{event.title}" and all associated data has been deleted')
    return redirect(url_for('dashboard.events')) 