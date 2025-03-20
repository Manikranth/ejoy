from flask import render_template, request, jsonify, redirect, url_for, flash, current_app
from flask_login import login_required, current_user
from app.editor import bp
from app.models import Template, Event, Invitation, db
import json
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from uuid import uuid4
from app import csrf  # Import csrf directly from your app

@bp.route('/<int:template_id>')
@login_required
def index(template_id):
    template = Template.query.get_or_404(template_id)
    event_id = request.args.get('event_id', type=int)
    invitation_id = request.args.get('invitation_id', type=int)
    
    # Get event if event_id is provided
    event = None
    if event_id:
        event = Event.query.get_or_404(event_id)
        if event.user_id != current_user.id:
            flash('You do not have permission to access this event.')
            return redirect(url_for('dashboard.index'))
    
    # Get invitation if invitation_id is provided
    invitation = None
    if invitation_id:
        invitation = Invitation.query.get_or_404(invitation_id)
        if invitation.event.user_id != current_user.id:
            flash('You do not have permission to access this invitation.')
            return redirect(url_for('dashboard.index'))
    
    # Load template data
    template_data = {}
    try:
        if invitation and hasattr(invitation, 'template_data') and invitation.template_data:
            # If editing an existing invitation, use its template data
            template_data = json.loads(invitation.template_data)
        elif hasattr(template, 'template_data') and template.template_data:
            # Otherwise use the base template data
            template_data = json.loads(template.template_data)
        else:
            # Default template structure if no data exists
            template_data = {
                "version": "1.0",
                "background": {
                    "type": "color",
                    "color": "#ffffff"
                },
                "elements": []
            }
    except (json.JSONDecodeError, AttributeError):
        template_data = {
            "version": "1.0",
            "background": {
                "type": "color",
                "color": "#ffffff"
            },
            "elements": []
        }
    
    return render_template('editor/index.html', 
                          title=f"Editor - {template.name}",
                          template=template,
                          event=event,
                          invitation=invitation,
                          template_data=template_data)

@bp.route('/<int:template_id>/save', methods=['POST'])
@login_required
def save_template(template_id):
    template = Template.query.get_or_404(template_id)
    invitation_id = request.args.get('invitation_id', type=int)
    event_id = request.args.get('event_id', type=int)
    
    # Check permissions
    if template.created_by and template.created_by != current_user.id and not template.is_system:
        return jsonify({'success': False, 'error': 'You do not have permission to edit this template.'})
    
    # Get template data from request
    template_data = request.json
    if not template_data:
        return jsonify({'success': False, 'error': 'No template data provided.'})
    
    try:
        # If we're editing an existing invitation
        if invitation_id:
            invitation = Invitation.query.get_or_404(invitation_id)
            if invitation.event.user_id != current_user.id:
                return jsonify({'success': False, 'error': 'You do not have permission to edit this invitation.'})
            
            # Update invitation template data
            if not hasattr(invitation, 'template_data'):
                # Add this field if it doesn't exist (should be handled by migration)
                setattr(invitation, 'template_data', json.dumps(template_data))
            else:
                invitation.template_data = json.dumps(template_data)
            
            invitation.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({'success': True, 'invitation_id': invitation.id})
        
        # If we're creating a new invitation from a template
        elif event_id:
            event = Event.query.get_or_404(event_id)
            if event.user_id != current_user.id:
                return jsonify({'success': False, 'error': 'You do not have permission to create invitations for this event.'})
            
            # Create new invitation
            invitation = Invitation(
                event_id=event.id,
                template_id=template.id,
                template_data=json.dumps(template_data),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.session.add(invitation)
            db.session.commit()
            
            return jsonify({'success': True, 'invitation_id': invitation.id})
        
        # If we're updating the base template itself
        else:
            # For system templates, create a copy for the user instead of modifying the original
            if template.is_system:
                new_template = Template(
                    name=f"{template.name} (Custom)",
                    description="Customized from system template",
                    template_data=json.dumps(template_data),
                    is_system=False,
                    created_by=current_user.id,
                    created_at=datetime.utcnow()
                )
                
                db.session.add(new_template)
                db.session.commit()
                
                return jsonify({'success': True, 'template_id': new_template.id})
            else:
                # Update existing user template
                template.template_data = json.dumps(template_data)
                template.updated_at = datetime.utcnow()
                db.session.commit()
                
                return jsonify({'success': True, 'template_id': template.id})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@bp.route('/upload-image', methods=['POST'])
@login_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided.'})
    
    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'success': False, 'error': 'No image selected.'})
    
    if image_file:
        filename = secure_filename(f"{uuid4().hex}_{image_file.filename}")
        uploads_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'editor')
        
        # Ensure the uploads directory exists
        os.makedirs(uploads_dir, exist_ok=True)
        
        file_path = os.path.join(uploads_dir, filename)
        image_file.save(file_path)
        
        # Return the URL to the uploaded image
        image_url = url_for('static', filename=f'uploads/editor/{filename}')
        
        return jsonify({
            'success': True,
            'url': image_url
        })
    
    return jsonify({'success': False, 'error': 'Failed to upload image.'})

@bp.route('/invitation/<int:invitation_id>/view')
def view_invitation(invitation_id):
    invitation = Invitation.query.get_or_404(invitation_id)
    
    # Load invitation template data
    template_data = {}
    try:
        if invitation.template_data:
            template_data = json.loads(invitation.template_data)
        elif invitation.template.template_data:
            template_data = json.loads(invitation.template.template_data)
    except json.JSONDecodeError:
        template_data = {
            "version": "1.0",
            "background": {
                "type": "color",
                "color": "#ffffff"
            },
            "elements": []
        }
    
    return render_template('editor/view_invitation.html',
                          invitation=invitation,
                          event=invitation.event,
                          template_data=template_data) 