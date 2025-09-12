# ГрафиУм - Образовательная платформа Яндекса

Образовательная платформа для создания интерактивных графов знаний из учебных материалов. Open-source проект для компании Яндекс, основанный на принципах российской педагогической школы и теории Выготского о зоне ближайшего развития.

## Возможности

### Для преподавателей:
- 📁 Загрузка множественных файлов (PDF, DOCX, PPTX, MD, TXT, CSV, XLSX)
- 🤖 **Автоматическая генерация концептуальных графов с помощью GPT-5-mini** (август 2025)
- 🎛️ Выбор сложности графа (простой/сложный)
- ✏️ Редактирование концепций и связей
- 📚 Генерация образовательного контента для каждой концепции
- 🚀 Публикация курсов для студентов

### Для студентов:
- 📖 Просмотр всех опубликованных курсов
- 🗺️ Интерактивная визуализация графов знаний с D3.js
- 🎯 Отслеживание прогресса изучения
- 🏆 Статистика обучения
- 📊 Цветовое кодирование по таксономии Блума

## Архитектура

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + D3.js
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **AI**: OpenAI GPT-5-mini (2025) для анализа документов и генерации графов с российской педагогической методикой
- **Docker**: Полная контейнеризация для разработки и развертывания

## Быстрый запуск

### Предварительные требования
- Docker и Docker Compose
- OpenAI API ключ

### 1. Клонирование и настройка
```bash
git clone <repository-url>
cd yandex_final
```

### 2. Настройка OpenAI API
```bash
# Создайте файл .env в корневой папке
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

### 3. Запуск всех сервисов
```bash
docker-compose up -d
```

Это запустит:
- 🐘 PostgreSQL база данных (порт 5432)
- 🚀 Backend API (порт 8000)  
- ⚛️ Frontend React приложение (порт 3000)

### 4. Открыть приложение
- Frontend: http://localhost:3000
- API документация: http://localhost:8000/docs

## Рабочий процесс

### Teacher workflow:
1. Создать новый курс
2. Загрузить файлы с материалами
3. Выбрать сложность графа (simple/complex)
4. ИИ генерирует концепции и связи
5. Отредактировать граф при необходимости
6. Сгенерировать контент для концепций
7. Опубликовать курс

### Student workflow:
1. Просмотреть доступные курсы
2. Открыть интерактивный граф
3. Изучать концепции
4. Отмечать прогресс
5. Отслеживать статистику

## Технические детали

### AI Integration (GPT-5-mini)
- **Модель**: OpenAI GPT-5-mini с новыми параметрами `reasoning_effort` и `verbosity`
- **Педагогический подход**: Российская школа (Выготский, Давыдов, Леонтьев, Гальперин)
- **2 режима сложности**: 
  - Простой (5-8 концепций) - основные понятия
  - Сложный (12-20 концепций) - развернутая система знаний
- **Таксономия Блума**: Автоматическая классификация образовательных целей
- **Типы связей**: prerequisite, part, similar, related с педагогическим обоснованием

### База данных
- PostgreSQL с async SQLAlchemy
- Модели: Course, Concept, Connection, UploadedFile, StudentProgress
- Полная поддержка отношений и каскадных удалений

### File Processing
Поддерживаемые форматы:
- PDF - PyPDF2
- DOCX - python-docx  
- PPTX - python-pptx
- MD - markdown + BeautifulSoup
- TXT - plain text
- CSV/XLSX - pandas + openpyxl

## Разработка

### Backend разработка
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend разработка
```bash
cd frontend
npm install
npm run dev
```

### База данных
```bash
# Подключение к PostgreSQL
psql -h localhost -U postgres -d graphium_db
```

## API Endpoints

### Courses
- `GET /api/courses` - Получить курсы
- `POST /api/courses` - Создать курс
- `PUT /api/courses/{id}` - Обновить курс
- `DELETE /api/courses/{id}` - Удалить курс
- `POST /api/courses/{id}/publish` - Опубликовать курс

### Files & AI
- `POST /api/files/{course_id}/upload` - Загрузить файлы
- `POST /api/files/{course_id}/generate-graph` - Сгенерировать граф
- `POST /api/files/{course_id}/generate-content` - Сгенерировать контент

### Student
- `GET /api/student/courses` - Курсы для студентов
- `POST /api/student/courses/{id}/progress/concept/{concept_id}` - Отметить концепцию
- `GET /api/student/stats` - Статистика студента

## Лицензия

MIT License