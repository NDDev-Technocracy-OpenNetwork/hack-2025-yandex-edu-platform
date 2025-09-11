#!/usr/bin/env python3
"""
Development script for running the Educational AI Platform backend.
"""

import os
import sys
import subprocess
from pathlib import Path

# Add src to Python path
backend_dir = Path(__file__).parent.parent
src_dir = backend_dir / "src"
sys.path.insert(0, str(src_dir))


def run_command(command: str, description: str = None) -> int:
    """Run a shell command and return exit code."""
    if description:
        print(f"🔧 {description}")
    
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, cwd=backend_dir)
    return result.returncode


def setup_development():
    """Setup development environment."""
    print("🚀 Setting up development environment...")
    
    # Create virtual environment if it doesn't exist
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        run_command("python -m venv venv", "Creating virtual environment")
    
    # Install dependencies
    if os.name == "nt":  # Windows
        pip_path = "venv\\Scripts\\pip"
    else:  # Unix/Linux/Mac
        pip_path = "venv/bin/pip"
    
    run_command(f"{pip_path} install -r requirements.txt", "Installing dependencies")
    
    # Copy environment file if it doesn't exist
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"
    
    if not env_file.exists() and env_example.exists():
        run_command(f"cp {env_example} {env_file}", "Creating .env file")
        print("⚠️  Please edit .env file with your configuration")


def run_server():
    """Run the development server."""
    print("🌐 Starting development server...")
    
    # Set Python path
    os.environ["PYTHONPATH"] = str(backend_dir)
    
    # Run uvicorn with reload
    return run_command(
        "uvicorn main:app --reload --host 0.0.0.0 --port 8000",
        "Starting FastAPI server"
    )


def run_tests():
    """Run the test suite."""
    print("🧪 Running tests...")
    return run_command("pytest tests/ -v", "Running pytest")


def format_code():
    """Format code with black and isort."""
    print("🎨 Formatting code...")
    
    run_command("black .", "Formatting with Black")
    run_command("isort .", "Sorting imports with isort")


def lint_code():
    """Lint code with flake8 and mypy."""
    print("🔍 Linting code...")
    
    run_command("flake8 .", "Linting with flake8")
    run_command("mypy .", "Type checking with mypy")


def main():
    """Main CLI interface."""
    if len(sys.argv) < 2:
        print("Usage: python scripts/dev.py <command>")
        print("\nCommands:")
        print("  setup    - Setup development environment")
        print("  run      - Run development server")
        print("  test     - Run tests")
        print("  format   - Format code")
        print("  lint     - Lint code")
        print("  all      - Format, lint, and test")
        return 1
    
    command = sys.argv[1]
    
    if command == "setup":
        setup_development()
    elif command == "run":
        return run_server()
    elif command == "test":
        return run_tests()
    elif command == "format":
        format_code()
    elif command == "lint":
        lint_code()
    elif command == "all":
        format_code()
        lint_code()
        return run_tests()
    else:
        print(f"Unknown command: {command}")
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())