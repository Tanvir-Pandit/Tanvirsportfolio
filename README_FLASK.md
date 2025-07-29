# Flask Portfolio Admin Panel

## Setup Instructions

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Flask Application
```bash
python app.py
```

### 3. Access Your Portfolio
- **Main Portfolio**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin

## Features

### ✅ **Project Management**
- Add, edit, and delete projects
- Upload project images
- Manage project details (title, description, technologies, etc.)
- Real-time file updates

### ✅ **Skills Management**
- Update technical skills
- Manage programming languages
- Edit tools and frameworks
- Direct JSON file updates

### ✅ **Profile Management**
- Update personal information
- Upload profile image
- Edit bio and contact details
- Instant profile updates

### ✅ **File Management**
- Automatic JSON file updates
- Image upload and management
- Proper file organization
- No manual file placement needed

## File Structure
```
Tanvirsportfolio/
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── templates/
│   └── admin.html         # Admin panel template
├── assets/
│   ├── data/
│   │   ├── projects.json  # Auto-updated by admin
│   │   ├── skills.json    # Auto-updated by admin
│   │   └── profile.json   # Auto-updated by admin
│   └── images/
│       ├── projects/      # Project images
│       └── profile.png    # Profile image
├── index.html             # Main portfolio page
└── project.html           # Projects page
```

## Admin Panel Features

### 🎯 **Easy Management**
- Intuitive web interface
- Real-time preview
- Form validation
- Success/error notifications

### 🔄 **Automatic Updates**
- Changes reflect immediately
- No manual file editing
- Automatic backups
- Error handling

### 🖼️ **Image Handling**
- Drag & drop upload
- Image preview
- Automatic resizing
- Proper file naming

### 🛡️ **Security**
- File type validation
- Secure file uploads
- Protected admin routes
- Input sanitization

## Usage

1. **Start the server**: `python app.py`
2. **Open admin panel**: http://localhost:5000/admin
3. **Make changes**: Use the intuitive interface
4. **View updates**: Changes appear instantly on your portfolio

## Production Deployment

For production deployment:

1. **Set environment variables**:
   ```bash
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key
   ```

2. **Use a production server** (e.g., Gunicorn):
   ```bash
   pip install gunicorn
   gunicorn app:app
   ```

3. **Configure your web server** (Nginx, Apache) to serve static files

## Benefits Over Client-Side Solution

- ✅ **Direct file updates** - No manual file placement
- ✅ **Real-time changes** - Updates appear immediately  
- ✅ **Better security** - Server-side validation
- ✅ **Professional workflow** - Standard web development approach
- ✅ **Easy deployment** - Works with any hosting service
- ✅ **Backup support** - Easy to implement automated backups
