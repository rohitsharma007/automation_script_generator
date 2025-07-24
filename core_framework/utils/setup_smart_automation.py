#!/usr/bin/env python3
"""
Smart Automation Model Setup Script
Automatically installs dependencies and sets up the environment
"""

import subprocess
import sys
import os
import json
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required. Current version: {version.major}.{version.minor}")
        return False
    print(f"✅ Python version {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_dependencies():
    """Install required Python packages"""
    packages = [
        "playwright>=1.40.0",
        "pytest>=7.4.0",
        "pytest-asyncio>=0.21.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install {package}", f"Installing {package}"):
            return False
    
    return True

def install_playwright_browsers():
    """Install Playwright browser binaries"""
    return run_command("playwright install", "Installing Playwright browsers")

def create_sample_config():
    """Create a sample configuration file"""
    sample_config = {
        "test_case_id": "DEMO_LOGIN_001",
        "test_steps": [
            "Step 1: Navigate to URL",
            "Step 2: fill the email",
            "Step 3: fill the password",
            "Step 4: click on Sign in",
            "Step 5: Verify dashboard loads successfully"
        ],
        "test_data": {
            "username": "Admin",
            "password": "admin123",
            "url": "https://opensource-demo.orangehrmlive.com/web/index.php/auth/login"
        },
        "headless": False,
        "language": "python"
    }
    
    try:
        with open('demo_config.json', 'w') as f:
            json.dump(sample_config, f, indent=2)
        print("✅ Created demo_config.json")
        return True
    except Exception as e:
        print(f"❌ Failed to create demo config: {e}")
        return False

def create_requirements_file():
    """Create requirements.txt file"""
    requirements = """# Smart Automation Model Requirements
playwright>=1.40.0
pytest>=7.4.0
pytest-asyncio>=0.21.0
"""
    
    try:
        with open('requirements.txt', 'w') as f:
            f.write(requirements)
        print("✅ Created requirements.txt")
        return True
    except Exception as e:
        print(f"❌ Failed to create requirements.txt: {e}")
        return False

def verify_installation():
    """Verify that everything is installed correctly"""
    print("\n🔍 Verifying installation...")
    
    # Check if smart_automation_model.py exists
    if not Path('smart_automation_model.py').exists():
        print("❌ smart_automation_model.py not found")
        return False
    
    # Try importing playwright
    try:
        import playwright
        print("✅ Playwright import successful")
    except ImportError:
        print("❌ Playwright import failed")
        return False
    
    # Check if browsers are installed
    try:
        result = subprocess.run(["playwright", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Playwright version: {result.stdout.strip()}")
        else:
            print("❌ Playwright command failed")
            return False
    except FileNotFoundError:
        print("❌ Playwright command not found")
        return False
    
    return True

def run_demo_test():
    """Run a demo test to verify everything works"""
    print("\n🚀 Running demo test...")
    
    if not Path('demo_config.json').exists():
        print("❌ Demo config not found")
        return False
    
    # Create a simple test script
    test_script = '''
import json
import asyncio
from smart_automation_model import SmartAutomationModel

async def run_demo():
    with open('demo_config.json', 'r') as f:
        config = json.load(f)
    
    model = SmartAutomationModel()
    results = await model.process_test_case(config)
    
    print(f"Demo test status: {results['status']}")
    return results['status'] == 'completed'

if __name__ == "__main__":
    success = asyncio.run(run_demo())
    exit(0 if success else 1)
'''
    
    try:
        with open('demo_test.py', 'w') as f:
            f.write(test_script)
        
        result = subprocess.run([sys.executable, 'demo_test.py'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Demo test completed successfully")
            return True
        else:
            print(f"❌ Demo test failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Demo test timed out")
        return False
    except Exception as e:
        print(f"❌ Demo test error: {e}")
        return False

def main():
    """Main setup function"""
    print("🤖 Smart Automation Model Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create requirements file
    if not create_requirements_file():
        sys.exit(1)
    
    # Install dependencies
    print("\n📦 Installing dependencies...")
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Install Playwright browsers
    print("\n🌐 Installing browsers...")
    if not install_playwright_browsers():
        print("❌ Failed to install browsers")
        sys.exit(1)
    
    # Create sample configuration
    print("\n📝 Creating sample configuration...")
    if not create_sample_config():
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        print("❌ Installation verification failed")
        sys.exit(1)
    
    # Run demo test (optional)
    print("\n🧪 Would you like to run a demo test? (y/n): ", end="")
    try:
        response = input().lower().strip()
        if response in ['y', 'yes']:
            if run_demo_test():
                print("\n🎉 Setup completed successfully!")
            else:
                print("\n⚠️ Setup completed but demo test failed")
        else:
            print("\n✅ Setup completed successfully!")
    except KeyboardInterrupt:
        print("\n\n✅ Setup completed successfully!")
    
    print("\n📚 Next steps:")
    print("1. Edit demo_config.json with your test case")
    print("2. Run: python3 smart_automation_model.py")
    print("3. Check generated files for results")
    print("\n📖 Read SMART_AUTOMATION_GUIDE.md for detailed documentation")

if __name__ == "__main__":
    main()