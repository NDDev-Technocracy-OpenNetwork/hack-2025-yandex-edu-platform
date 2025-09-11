# Educational AI Platform Backend

A FastAPI-based backend for the Educational AI Platform that generates interactive knowledge graphs from course materials.

## Architecture

This backend follows Domain-Driven Design (DDD) principles with clean architecture:

- **Domain Layer**: Business entities, value objects, and domain services
- **Application Layer**: Use cases, DTOs, and application exceptions  
- **Infrastructure Layer**: Database, repositories, external services
- **Presentation Layer**: FastAPI routes, schemas, middleware

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - ORM with async support
- **PostgreSQL** - Primary database
- **Redis** - Caching and background tasks
- **Pydantic** - Data validation and serialization
- **Spacy** - NLP for text processing
- **NetworkX** - Graph algorithms

## Getting Started

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis 6+

### Development Setup

1. **Clone and setup environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and service URLs
   ```

3. **Run the application:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

## API Endpoints

### Courses
- `POST /api/v1/courses/` - Create course
- `GET /api/v1/courses/` - Get all courses
- `GET /api/v1/courses/active` - Get active courses
- `GET /api/v1/courses/user/{user_id}` - Get courses by user
- `GET /api/v1/courses/{course_id}` - Get course by ID

### Users
- `POST /api/v1/users/` - Create user
- `GET /api/v1/users/` - Get all users
- `GET /api/v1/users/{user_id}` - Get user by ID
- `GET /api/v1/users/email/{email}` - Get user by email

### Files
- `POST /api/v1/files/upload` - Upload file
- `POST /api/v1/files/process` - Process document to course
- `GET /api/v1/files/status/{file_id}` - Get processing status

## Development Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run with hot reload
uvicorn main:app --reload

# Run tests
pytest

# Format code
black .
isort .

# Type checking
mypy .

# Linting
flake8 .
```

## Database Migrations

```bash
# Generate migration
alembic revision --autogenerate -m "Description"

# Run migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

## Project Structure

```
backend/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain entities
│   │   ├── value_objects/   # Value objects
│   │   ├── repositories/    # Repository interfaces
│   │   └── services/        # Domain services
│   ├── application/         # Application layer
│   │   ├── use_cases/       # Business use cases
│   │   ├── dto/             # Data transfer objects
│   │   └── exceptions/      # Application exceptions
│   ├── infrastructure/      # External concerns
│   │   ├── database/        # Database models
│   │   ├── repositories/    # Repository implementations
│   │   ├── services/        # External services
│   │   └── config/          # Configuration
│   └── presentation/        # Web layer
│       ├── api/             # FastAPI routes
│       ├── schemas/         # Pydantic schemas
│       └── middleware/      # HTTP middleware
├── tests/                   # Test suites
├── main.py                  # Application entry point
├── requirements.txt         # Python dependencies
└── Dockerfile              # Container configuration
```

## Key Features

### File Processing
- Supports PDF, DOCX, TXT, MD files up to 20MB
- Extracts text content using specialized processors
- Validates document quality and content

### Knowledge Graph Generation
- Uses NLP to extract concepts from text
- Generates connections between concepts
- Optimizes graph layout for visualization
- Supports Bloom's taxonomy classification

### Course Management
- Role-based access (teachers/students)
- Course lifecycle management
- Progress tracking
- Real-time processing status

## Configuration

Key environment variables:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379/0

# File Upload
MAX_FILE_SIZE_MB=20
UPLOAD_DIR=./uploads

# AI Services
OPENAI_API_KEY=your-key
SPACY_MODEL=ru_core_news_sm
```

## Production Deployment

1. **Build production image:**
   ```bash
   docker build --target production -t educational-ai-backend .
   ```

2. **Run with environment variables:**
   ```bash
   docker run -p 8000:8000 \
     -e DATABASE_URL="postgresql+asyncpg://..." \
     -e REDIS_URL="redis://..." \
     educational-ai-backend
   ```

3. **Health check endpoint:**
   ```
   GET /health
   ```

## Contributing

1. Follow DDD principles
2. Add tests for new features
3. Use type hints
4. Format code with Black
5. Update documentation