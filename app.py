from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, flash
import json
import os
from datetime import datetime
import shutil
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-super-secret-key-change-in-production'
app.config['UPLOAD_FOLDER'] = 'assets/images'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Admin credentials (in production, use a database)
ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password': generate_password_hash('admin123')  # Change this password!
}

# Allowed file extensions for images
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_json_file(filename):
    """Load JSON data from file"""
    try:
        file_path = os.path.join('assets', 'data', filename)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        # Return appropriate default based on filename
        if filename == 'skills.json':
            return []
        elif filename == 'projects.json':
            return []
        elif filename == 'profile.json':
            return {
                "personalInfo": {
                    "fullName": "Md Tanvir Ahmmed Rasel",
                    "title": "AI, ML and IoT Specialist",
                    "tagline": "AI, ML and IoT Specialist",
                    "bio": "I am an experienced AI and IoT expert with a strong background in software development, machine learning, and embedded systems. With a passion for automation, computer vision, and large language models, I specialize in developing cutting-edge solutions that bridge artificial intelligence with real-world applications. Currently working as an Associate Developer (AI) at iBOS Limited, a concern of Akij Group, I focus on AI-driven software development, automation, and SaaS-based solutions.",
                    "bioParagraph2": "My interest in research extends to RPA (Robotic Process Automation), Large Language Models (LLM), and Forecasting.",
                    "profileImage": "assets/images/profile.png"
                },
                "contactInfo": {
                    "location": "Dhaka, Bangladesh",
                    "email": "tanvirrcse@gmail.com",
                    "website": "http://www.website.com",
                    "phone": ""
                },
                "socialLinks": {
                    "github": "https://github.com/yourusername",
                    "linkedin": "https://linkedin.com/in/yourusername",
                    "googleplus": "",
                    "twitter": "",
                    "hackerNews": ""
                },
                "siteInfo": {
                    "pageTitle": "Tanvir's Portfolio | ML | AI | IoT",
                    "metaDescription": "Responsive HTML5 Website landing Page for Developers",
                    "metaAuthor": "Tanvir",
                    "copyrightText": "Designed with <i class=\"fa fa-heart\"></i> by <a href=\"#\">Tanvir</a>",
                    "ctaButtonText": "Contact Me",
                    "ctaButtonLink": "#"
                },
                "sections": {
                    "aboutTitle": "About Me",
                    "projectsTitle": "Latest Projects",
                    "githubTitle": "My GitHub",
                    "skillsTitle": "Skills",
                    "showMoreButtonText": "Show More",
                    "showLessButtonText": "Show Less"
                }
            }
        return []
    except json.JSONDecodeError:
        # Return appropriate default based on filename
        if filename == 'skills.json':
            return []
        elif filename == 'projects.json':
            return []
        elif filename == 'profile.json':
            return {
                "personalInfo": {
                    "fullName": "Md Tanvir Ahmmed Rasel",
                    "title": "AI, ML and IoT Specialist",
                    "tagline": "AI, ML and IoT Specialist",
                    "bio": "I am an experienced AI and IoT expert with a strong background in software development, machine learning, and embedded systems. With a passion for automation, computer vision, and large language models, I specialize in developing cutting-edge solutions that bridge artificial intelligence with real-world applications. Currently working as an Associate Developer (AI) at iBOS Limited, a concern of Akij Group, I focus on AI-driven software development, automation, and SaaS-based solutions.",
                    "bioParagraph2": "My interest in research extends to RPA (Robotic Process Automation), Large Language Models (LLM), and Forecasting.",
                    "profileImage": "assets/images/profile.png"
                },
                "contactInfo": {
                    "location": "Dhaka, Bangladesh",
                    "email": "tanvirrcse@gmail.com",
                    "website": "http://www.website.com",
                    "phone": ""
                },
                "socialLinks": {
                    "github": "https://github.com/yourusername",
                    "linkedin": "https://linkedin.com/in/yourusername",
                    "googleplus": "",
                    "twitter": "",
                    "hackerNews": ""
                },
                "siteInfo": {
                    "pageTitle": "Tanvir's Portfolio | ML | AI | IoT",
                    "metaDescription": "Responsive HTML5 Website landing Page for Developers",
                    "metaAuthor": "Tanvir",
                    "copyrightText": "Designed with <i class=\"fa fa-heart\"></i> by <a href=\"#\">Tanvir</a>",
                    "ctaButtonText": "Contact Me",
                    "ctaButtonLink": "#"
                },
                "sections": {
                    "aboutTitle": "About Me",
                    "projectsTitle": "Latest Projects",
                    "githubTitle": "My GitHub",
                    "skillsTitle": "Skills",
                    "showMoreButtonText": "Show More",
                    "showLessButtonText": "Show Less"
                }
            }
        return []

def save_json_file(filename, data):
    """Save JSON data to file"""
    file_path = os.path.join('assets', 'data', filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def load_site_settings():
    """Load site settings"""
    try:
        file_path = os.path.join('assets', 'data', 'settings.json')
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default settings if file doesn't exist
        default_settings = {
            'site_title': 'My Portfolio',
            'site_description': 'Professional Portfolio Website',
            'author_name': 'Your Name',
            'contact_email': 'your.email@example.com',
            'social_links': {
                'github': '',
                'linkedin': '',
                'twitter': '',
                'facebook': ''
            },
            'analytics': {
                'google_analytics_id': '',
                'enable_analytics': False
            },
            'seo': {
                'meta_keywords': 'portfolio, developer, web development',
                'meta_description': 'Professional portfolio showcasing my work and skills'
            }
        }
        save_json_file('settings.json', default_settings)
        return default_settings

def require_login(f):
    """Decorator to require login for admin routes"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    """Redirect to admin dashboard (main entry point)"""
    return redirect(url_for('admin_dashboard'))

@app.route('/portfolio')
def portfolio():
    """Serve the main portfolio page"""
    return send_from_directory('.', 'index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if (username == ADMIN_CREDENTIALS['username'] and 
            check_password_hash(ADMIN_CREDENTIALS['password'], password)):
            session['logged_in'] = True
            session['username'] = username
            flash('Login successful!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid credentials!', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    """Admin logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/admin')
@require_login
def admin_dashboard():
    """Admin dashboard - main entry point"""
    # Get statistics for dashboard
    projects = load_json_file('projects.json')
    skills = load_json_file('skills.json')
    settings = load_site_settings()
    
    # Calculate total skills - handle your existing skills.json format
    total_skills = 0
    if isinstance(skills, list):
        # Count total subskills across all skill categories
        for skill in skills:
            if isinstance(skill, dict) and 'subSkills' in skill:
                total_skills += len(skill['subSkills'])
    
    stats = {
        'total_projects': len(projects) if isinstance(projects, list) else 0,
        'total_skills': total_skills,
        'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M'),
        'project_types': {}
    }
    
    # Count project types
    if isinstance(projects, list):
        for project in projects:
            if isinstance(project, dict):
                ptype = project.get('type', 'Other')
                stats['project_types'][ptype] = stats['project_types'].get(ptype, 0) + 1
    
    return render_template('admin_dashboard.html', stats=stats, username=session.get('username'))

@app.route('/admin/projects')
@require_login
def admin_projects():
    """Projects management page"""
    projects = load_json_file('projects.json')
    return render_template('admin_projects.html', projects=projects)

@app.route('/admin/skills')
@require_login
def admin_skills():
    """Skills management page"""
    skills = load_json_file('skills.json')
    return render_template('admin_skills.html', skills=skills)

@app.route('/admin/profile')
@require_login
def admin_profile():
    """Profile management page"""
    profile = load_json_file('profile.json')
    return render_template('admin_profile.html', profile=profile)

@app.route('/admin/settings')
@require_login
def admin_settings():
    """Site settings management page"""
    settings = load_site_settings()
    return render_template('admin_settings.html', settings=settings)

@app.route('/project.html')
def project():
    """Serve the project page"""
    return send_from_directory('.', 'project.html')

# Static files
@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory('assets', filename)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('.', 'favicon.ico')

# API Routes
@app.route('/api/projects', methods=['GET'])
@require_login
def get_projects():
    """Get all projects"""
    projects = load_json_file('projects.json')
    return jsonify(projects)

@app.route('/api/projects', methods=['POST'])
@require_login
def add_project():
    """Add a new project"""
    try:
        projects = load_json_file('projects.json')
        new_project = request.json
        
        # Generate new ID
        max_id = max([int(p['id']) for p in projects], default=0)
        new_project['id'] = str(max_id + 1)
        
        # Add timestamp
        new_project['date'] = datetime.now().strftime('%Y-%m-%d')
        
        projects.append(new_project)
        save_json_file('projects.json', projects)
        
        return jsonify({'success': True, 'message': 'Project added successfully', 'project': new_project})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['PUT'])
@require_login
def update_project(project_id):
    """Update a project"""
    try:
        projects = load_json_file('projects.json')
        updated_project = request.json
        
        for i, project in enumerate(projects):
            if project['id'] == project_id:
                # Keep original ID and update other fields
                updated_project['id'] = project_id
                projects[i] = updated_project
                break
        else:
            return jsonify({'success': False, 'message': 'Project not found'}), 404
            
        save_json_file('projects.json', projects)
        return jsonify({'success': True, 'message': 'Project updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/projects/<project_id>', methods=['DELETE'])
@require_login
def delete_project(project_id):
    """Delete a project"""
    try:
        projects = load_json_file('projects.json')
        projects = [p for p in projects if p['id'] != project_id]
        save_json_file('projects.json', projects)
        
        return jsonify({'success': True, 'message': 'Project deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/skills', methods=['GET'])
@require_login
def get_skills():
    """Get all skills"""
    skills = load_json_file('skills.json')
    return jsonify(skills)

@app.route('/api/skills', methods=['POST'])
@require_login
def update_skills():
    """Update skills"""
    try:
        skills_data = request.json
        save_json_file('skills.json', skills_data)
        return jsonify({'success': True, 'message': 'Skills updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@require_login
def get_profile():
    """Get profile data"""
    profile = load_json_file('profile.json')
    return jsonify(profile)

@app.route('/api/profile', methods=['POST'])
@require_login
def update_profile():
    """Update profile"""
    try:
        profile_data = request.json
        save_json_file('profile.json', profile_data)
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/settings', methods=['GET'])
@require_login
def get_settings():
    """Get site settings"""
    settings = load_site_settings()
    return jsonify(settings)

@app.route('/api/settings', methods=['POST'])
@require_login
def update_settings():
    """Update site settings"""
    try:
        settings_data = request.json
        save_json_file('settings.json', settings_data)
        return jsonify({'success': True, 'message': 'Settings updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/upload', methods=['POST'])
@require_login
def upload_file():
    """Upload image files"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
            
        file = request.files['file']
        file_type = request.form.get('type', 'project')  # project or profile
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
            
        if file and allowed_file(file.filename):
            # Generate unique filename
            filename = secure_filename(file.filename)
            name, ext = os.path.splitext(filename)
            unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
            
            # Determine upload path
            if file_type == 'profile':
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'])
                file_path = os.path.join(upload_path, unique_filename)
                web_path = f"assets/images/{unique_filename}"
            else:  # project
                upload_path = os.path.join(app.config['UPLOAD_FOLDER'], 'projects')
                file_path = os.path.join(upload_path, unique_filename)
                web_path = f"assets/images/projects/{unique_filename}"
            
            # Create directory if it doesn't exist
            os.makedirs(upload_path, exist_ok=True)
            
            # Save file
            file.save(file_path)
            
            return jsonify({
                'success': True, 
                'message': 'File uploaded successfully',
                'filename': unique_filename,
                'path': web_path
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid file type'}), 400
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
