# 🤝 Pentavision Team Collaboration Guide

## 🎯 **Project Overview**
Pentavision is a **group project** for CSE3 Capstone, implementing an AI-powered supermarket shelf monitoring system using hybrid AI models (YOLOv11x + Qwen2.5-VL-72B-Instruct).

## 👥 **Team Members**
- **21802548** (Project Owner)
- **21103862** (Team Member)
- **21951900** (Team Member)  
- **21976171** (Team Member)
- **21887929** (Team Member)

## 🔐 **Access Permissions**
All team members have **equal access** to the project:
- ✅ **Read & Write** access to all files
- ✅ **Create & Delete** files and directories
- ✅ **Execute** scripts and run the application
- ✅ **Collaborate** on code simultaneously

## 📁 **Project Structure**
```
pentavision/
├── Backend/                 # 🧠 AI Backend System
│   ├── api/                # Core AI modules
│   ├── .env                # Environment config
│   ├── requirements.txt    # Dependencies
│   └── .venv/              # Python environment
├── datasets/                # �� Test images
├── docs/                    # 📚 Documentation
└── README.md                # 📖 Project overview
```

## 🚀 **How to Work Together**

### **1. Starting the Backend**
```bash
# Navigate to project
cd /home/ad/21802548/pentavision

# Start the server
./start_backend.sh
```

### **2. Adding New Features**
```bash
# Create new modules
touch Backend/api/new_feature.py

# Add to requirements
echo "new_package" >> Backend/requirements.txt

# Update documentation
echo "# New Feature" >> docs/new_feature.md
```

### **3. Testing Changes**
```bash
# Test the API
curl -X POST "http://localhost:8000/analyze_shelf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@datasets/test_image.jpg"
```

### **4. Code Collaboration**
- **Edit files** directly in the shared directory
- **Create branches** if using version control
- **Test changes** before committing
- **Update documentation** for new features

## 🔧 **Development Workflow**

### **Before Making Changes**
1. Check if backend is running
2. Test current functionality
3. Create backup if needed

### **While Working**
1. Make incremental changes
2. Test frequently
3. Communicate with team members

### **After Changes**
1. Test the new functionality
2. Update relevant documentation
3. Inform team of changes

## 📊 **Current Status**
- ✅ **Backend API** fully functional
- ✅ **YOLOv11x model** loaded and working
- ✅ **Qwen2.5-VL-72B-Instruct model** loaded and working
- ✅ **Hybrid AI system** operational
- ✅ **Dashboard integration** ready

## 🎯 **Next Steps for Team**
1. **Frontend Development** - Create dashboard interface
2. **Testing & Validation** - Test with various shelf images
3. **Documentation** - Complete user and technical docs
4. **Deployment** - Prepare for production use

## 🚨 **Important Notes**
- **Don't delete** the `.venv` directory
- **Keep** the model files in `/data/shared/nobackup/`
- **Test** changes before major modifications
- **Communicate** with team before major changes

## 📞 **Team Communication**
- Use the shared directory for all project files
- Create `CHANGELOG.md` for tracking updates
- Use `TODO.md` for task management
- Coordinate on major feature additions

## 🎉 **Ready for Collaboration!**
Your team now has full access to collaborate on Pentavision!
