import os
import shutil

def copy_assets():
    """Copy existing assets to the new structure"""
    
    # Ensure directories exist
    os.makedirs('app/static/css', exist_ok=True)
    os.makedirs('app/static/js', exist_ok=True)
    os.makedirs('app/static/images', exist_ok=True)
    os.makedirs('app/static/videos', exist_ok=True)
    
    # Copy CSS
    if os.path.exists('static/css/style.css'):
        shutil.copy('static/css/style.css', 'app/static/css/style.css')
        print("Copied style.css")
    
    # Copy JS
    if os.path.exists('static/js/script.js'):
        shutil.copy('static/js/script.js', 'app/static/js/script.js')
        print("Copied script.js")
    
    # Copy images (if any)
    for img in os.listdir('static/images'):
        src = os.path.join('static/images', img)
        dst = os.path.join('app/static/images', img)
        if os.path.isfile(src):
            shutil.copy(src, dst)
            print(f"Copied image: {img}")
    
    # Copy videos (if any)
    if os.path.exists('static/videos'):
        for video in os.listdir('static/videos'):
            src = os.path.join('static/videos', video)
            dst = os.path.join('app/static/videos', video)
            if os.path.isfile(src):
                shutil.copy(src, dst)
                print(f"Copied video: {video}")

if __name__ == "__main__":
    copy_assets() 