# Wedding RSVP Application

A beautiful, responsive wedding invitation and RSVP system built with Flask that collects guest information and stores it in a Google Sheet.

## Overview

This application provides a digital wedding invitation with RSVP functionality. It features:

- Responsive design for all devices
- Video background with sound controls
- Real-time countdown to the wedding date
- Livestream information for virtual attendees
- RSVP form that stores responses in Google Sheets
- Different video options based on URL parameters

## Prerequisites

- Python 3.7+
- A Google Cloud account with Google Sheets API enabled
- A Google service account with access to the destination spreadsheet

## Installation

1. Clone the repository or download the code

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up Google Sheets API:
   - Create a Google Cloud project
   - Enable the Google Sheets API
   - Create a service account and download the credentials JSON file
   - Place the credentials file in the project root as `credentials.json`
   - Share your Google Sheet with the service account email address (with edit permissions)

5. Set up videos:
   - Place your main video file in the `/static/videos/` directory as `video.mp4`
   - For family-specific videos, add them as:
     - `/static/videos/Bheemineni_video.mp4`
     - `/static/videos/siddana_video.mp4`

## Configuration

1. Edit `google_sheets.py` to update the `SPREADSHEET_ID` with your Google Sheet ID:
   ```python
   SPREADSHEET_ID = 'your-spreadsheet-id-here'
   SHEET_NAME = 'Sheet1'  # Change if your sheet has a different name
   ```

2. Customize the wedding details in `templates/index.html`:
   - Names
   - Date
   - Venue
   - Livestream link
   - Any text content

3. Update the countdown date in `static/js/script.js`:
   ```javascript
   const weddingDate = new Date('2025-04-13T09:00:00-05:00'); // Update with your date/time
   ```

## Running the Application

1. Start the Flask application:
   ```bash
   python app.py
   ```

2. The application will be available at:
   - Default URL: `http://localhost:5555/` 
   - Family-specific URLs:
     - `http://localhost:5555/Bheemineni` (shows Bheemineni family video)
     - `http://localhost:5555/siddana` (shows Siddana family video)

3. For production deployment, consider using Gunicorn and Nginx, or deploying to a service like Heroku.

## Features

### RSVP Form
The RSVP form collects:
- Full name
- Number of guests

This information is stored in your Google Sheet along with a timestamp.

### Family-Specific Videos
Different videos can be shown based on the URL:
- `/` - Default video
- `/Bheemineni` - Bheemineni family video
- `/siddana` - Siddana family video

### Countdown Timer
A real-time countdown to the wedding date showing days, hours, minutes, and seconds.

### Livestream Information
A section for providing livestream details for guests who cannot attend in person.

## File Structure

- `app.py` - Main Flask application
- `google_sheets.py` - Google Sheets API integration
- `templates/index.html` - HTML template for the wedding site
- `static/js/script.js` - JavaScript for interactive elements
- `static/css/style.css` - Styling for the website
- `static/videos/` - Directory for video files
- `static/images/` - Directory for image files
- `credentials.json` - Google API credentials file
- `requirements.txt` - Python dependencies

## Customization

### Colors and Styling
Edit `static/css/style.css` to change colors, fonts, and layout.

### Images
Replace the images in `static/images/` with your own while keeping the same filenames, or update the filenames in `index.html`.

### Videos
Replace the videos in `static/videos/` with your own. Make sure they're web-optimized for best performance.

## Troubleshooting

- **Google Sheets Connection Issues**: Make sure your credentials file is valid and the service account has edit access to the spreadsheet.
- **Video Not Playing**: Ensure videos are in MP4 format and properly encoded for web use.
- **RSVP Form Not Submitting**: Check browser console for errors and make sure the Flask server is running.

## License

This project is available for personal use. For commercial applications, please contact the author.

---

Customized with ❤️ for your special day!