from app import create_app, db
from app.models import Template, User
import json
import os
import shutil
from bs4 import BeautifulSoup
import sys

def init_db():
    app = create_app()
    with app.app_context():
        # Create admin user if needed
        admin = User.query.filter_by(email='admin@example.com').first()
        if not admin:
            admin = User(
                email='admin@example.com',
                first_name='Admin',
                last_name='User'
            )
            admin.set_password('adminpassword')
            db.session.add(admin)
            db.session.commit()
            print("Created admin user (admin@example.com / adminpassword)")
        
        # Check if we already have templates
        if Template.query.count() > 0:
            print("Templates already exist in database. Skipping template initialization.")
            return
        
        # Convert existing template
        try:
            # Read the existing template HTML
            with open('templates/index.html', 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            # Parse HTML to extract key elements
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Create template data structure for our canvas editor
            template_data = {
                "version": "1.0",
                "background": {
                    "type": "video",
                    "src": "video.mp4"
                },
                "elements": [
                    {
                        "type": "text",
                        "content": "Save the Date",
                        "position": {"x": 50, "y": 30},
                        "style": {
                            "fontFamily": "Playfair Display",
                            "fontSize": 48,
                            "color": "#863A3A"
                        }
                    },
                    {
                        "type": "text",
                        "content": "April 13th, 2025",
                        "position": {"x": 50, "y": 15},
                        "style": {
                            "fontFamily": "Poppins",
                            "fontSize": 24,
                            "color": "#333"
                        }
                    },
                    {
                        "type": "countdown",
                        "targetDate": "2025-04-13T09:00:00-05:00",
                        "position": {"x": 50, "y": 70},
                        "style": {
                            "fontFamily": "Poppins",
                            "fontSize": 18,
                            "color": "#333"
                        }
                    }
                ]
            }
            
            # Create a thumbnail of the template by copying one of our static images
            thumbnail_path = 'app/static/uploads/template1_thumb.jpg'
            
            # Ensure uploads directory exists
            os.makedirs('app/static/uploads', exist_ok=True)
            
            # Create a simple template thumbnail if we don't have one
            if not os.path.exists(thumbnail_path):
                # Create a basic thumbnail (this is a placeholder, in a real app you'd generate this)
                with open(thumbnail_path, 'wb') as f:
                    # Get sample image if available
                    sample_image = 'static/images/stamp.PNG'
                    if os.path.exists(sample_image):
                        shutil.copy(sample_image, thumbnail_path)
                    else:
                        # Just create an empty file as placeholder
                        f.write(b'')
            
            # Create the template in the database
            template = Template(
                name="Wedding RSVP with Video",
                thumbnail_url="/static/uploads/template1_thumb.jpg",
                is_system=True,
                created_by=admin.id
            )
            template.set_template_data(template_data)
            
            db.session.add(template)
            db.session.commit()
            
            print(f"Created template: {template.name}")
            
        except Exception as e:
            print(f"Error creating template: {str(e)}")
            db.session.rollback()
            raise
            
if __name__ == "__main__":
    init_db() 