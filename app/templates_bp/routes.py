from flask import render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from app.templates_bp import bp
from app.models import Template, db
import json

@bp.route('/')
@login_required
def index():
    # Get all templates (system templates + user's templates)
    templates = Template.query.filter(
        (Template.is_system == True) | 
        (Template.created_by == current_user.id)
    ).all()
    
    return render_template('templates/index.html', templates=templates)

@bp.route('/create', methods=['POST'])
@login_required
def create():
    name = request.form.get('name')
    template_type = request.form.get('template_type')
    source_template_id = request.form.get('source_template_id')
    
    if not name:
        flash('Template name is required')
        return redirect(url_for('templates_bp.index'))
    
    # Create new template
    template = Template(
        name=name,
        is_system=False,
        created_by=current_user.id
    )
    
    # Set template data based on type
    if template_type == 'duplicate' and source_template_id:
        # Duplicate an existing template
        source = Template.query.get(source_template_id)
        if source:
            template.template_json = source.template_json
            template.thumbnail_url = source.thumbnail_url  # You might want to create a new thumbnail
    else:
        # Create blank template
        blank_template = {
            "version": "1.0",
            "background": {
                "type": "color",
                "color": "#ffffff"
            },
            "elements": []
        }
        template.set_template_data(blank_template)
    
    db.session.add(template)
    db.session.commit()
    
    flash(f'Template "{name}" created successfully')
    return redirect(url_for('editor.index', template_id=template.id))

@bp.route('/delete/<int:template_id>', methods=['POST'])
@login_required
def delete(template_id):
    template = Template.query.get_or_404(template_id)
    
    # Only allow deletion of user's own non-system templates
    if template.is_system or template.created_by != current_user.id:
        flash('You cannot delete this template')
        return redirect(url_for('templates_bp.index'))
    
    db.session.delete(template)
    db.session.commit()
    
    flash('Template deleted successfully')
    return redirect(url_for('templates_bp.index')) 