# 🎓 ГрафиУм — Образовательная платформа нового поколения

<div align="center">

![ГрафиУм](https://img.shields.io/badge/ГрафиУм-Education%20Platform-blue?style=for-the-badge)
![Yandex](https://img.shields.io/badge/Powered%20by-Yandex%20Education-FFDB4D?style=for-the-badge&logo=yandex)
![YandexGPT](https://img.shields.io/badge/AI-YandexGPT-FC3F1D?style=for-the-badge)
![MIT License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

*Интерактивная платформа для создания графов знаний с использованием YandexGPT*

[🚀 Быстрый старт](#-быстрый-старт) • [📖 Документация](#-архитектура) • [🤖 AI Features](#-ai-возможности) • [👥 Команда](#-команда)

</div>

---

## 🌟 О проекте

**ГрафиУм** — это революционная образовательная платформа, разработанная для **Яндекс Образования**, которая трансформирует учебные материалы в интерактивные графы знаний с помощью искусственного интеллекта **YandexGPT**.

Платформа основана на принципах российской педагогической школы и теории **Л.С. Выготского** о зоне ближайшего развития, обеспечивая научно обоснованный подход к структурированию знаний.

### ✨ Ключевые особенности

- 🧠 **YandexGPT Integration** — автоматическая генерация концептуальных графов
- 🎯 **Адаптивная сложность** — простые и комплексные графы для разных уровней
- 🗺️ **Интерактивная визуализация** — современные D3.js графы с анимациями
- 📚 **Мультиформатность** — поддержка PDF, DOCX, PPTX, MD, TXT, CSV, XLSX
- 🎨 **Таксономия Блума** — научная классификация образовательных целей
- 🏆 **Прогресс-трекинг** — детальная аналитика обучения

---

## 👥 Целевая аудитория

### 🎓 Для преподавателей
- **Автоматизация** создания учебных материалов
- **Визуализация** структуры курса в виде интерактивного графа
- **Редактирование** концепций и связей с помощью ИИ
- **Аналитика** прогресса студентов в реальном времени

### 👨‍🎓 For студентов
- **Интерактивное изучение** через граф концепций
- **Персонализированные** траектории обучения
- **Визуальное отслеживание** прогресса
- **Геймификация** образовательного процесса

---

## 🤖 AI Возможности

### YandexGPT 5 Pro + ruBloomGPT Integration
```yaml
Основная модель: YandexGPT 5 Lite
Версия: Latest (2025) with Reasoning & Chain-of-Thought
Специализация: Российская педагогическая методика
Языки: Русский (приоритет), English
Дополнительные модели:
  - ruBloomGPT: Первая в мире модель для классификации по Блуму
  - YaLM 100B: Для семантического анализа связей
  - ruBERT: Векторизация концептов
```

### 🎯 Режимы сложности
| Режим | Концепты | Описание |
|-------|----------|----------|
| **Простой** | 10-30 | Основные понятия и ключевые связи |
| **Сложный** | 40-70 | Детальная проработка с подконцептами |

### 🔗 Типы связей
- **Prerequisite** — предварительные требования
- **Part-of** — иерархические отношения  
- **Similar** — аналогичные концепции
- **Related** — ассоциативные связи

---

## 🏗️ Архитектура

### 🎨 Frontend Stack
```
React 19 + TypeScript + Vite
├── 🎨 Tailwind CSS — современный дизайн
├── 📊 D3.js — интерактивная визуализация
├── 🏪 Zustand — управление состоянием
└── 🚀 Domain-Driven Design — чистая архитектура
```

### ⚙️ Backend Stack
```
FastAPI + Python 3.11 + asyncio
├── 🗄️ Database Layer
│   ├── PostgreSQL 15 — ACID-compliant RDBMS
│   ├── Redis Cluster — Session & Cache storage
│   ├── AsyncPG — High-performance PostgreSQL driver
│   └── SQLAlchemy 2.0 — Modern async ORM
├── 🤖 AI/ML Pipeline
│   ├── YandexGPT 5 Pro — Primary reasoning model
│   ├── ruBloomGPT — Bloom taxonomy classification
│   ├── YaLM 100B — Semantic relationship analysis
│   ├── ruBERT — Russian text embeddings
│   ├── sentence-transformers — Vector similarity
│   └── scikit-learn — ML preprocessing
├── 📊 Data Processing
│   ├── Celery + Redis — Background task queue
│   ├── Apache Kafka — Event streaming
│   ├── MinIO — Object storage for files
│   ├── Pandas + NumPy — Data manipulation
│   └── spaCy — NLP preprocessing
├── 🔍 Search & Analytics
│   ├── Elasticsearch — Full-text search
│   ├── Kibana — Analytics dashboard
│   ├── Prometheus — Metrics collection
│   └── Grafana — Monitoring visualization
└── 🛡️ Security & Infrastructure
    ├── nginx — Reverse proxy & load balancer
    ├── Traefik — API gateway & SSL termination
    ├── HashiCorp Vault — Secrets management
    ├── JWT + OAuth2 — Authentication
    └── Docker Swarm — Container orchestration
```

### 🐳 DevOps & Cloud Infrastructure
```
Kubernetes + Docker + Terraform
├── ☁️ Cloud Native Architecture
│   ├── Yandex Cloud — Primary cloud provider
│   ├── Kubernetes 1.28 — Container orchestration
│   ├── Helm 3 — Package manager
│   └── Istio — Service mesh
├── 🔄 CI/CD Pipeline
│   ├── GitLab CI — Automated testing & deployment
│   ├── SonarQube — Code quality analysis
│   ├── Snyk — Security vulnerability scanning
│   ├── Docker Registry — Container image storage
│   └── ArgoCD — GitOps deployment
├── 📊 Observability Stack
│   ├── OpenTelemetry — Distributed tracing
│   ├── Jaeger — Request tracing
│   ├── ELK Stack — Centralized logging
│   ├── Prometheus + AlertManager — Monitoring
│   └── Grafana — Metrics visualization
├── 🛡️ Security & Compliance
│   ├── Falco — Runtime security monitoring
│   ├── OPA Gatekeeper — Policy enforcement
│   ├── cert-manager — SSL certificate automation
│   ├── External Secrets — Secret synchronization
│   └── Network Policies — Micro-segmentation
└── 🏗️ Infrastructure as Code
    ├── Terraform — Infrastructure provisioning
    ├── Ansible — Configuration management
    ├── Kustomize — Kubernetes config management
    └── Crossplane — Cloud resource orchestration
```

---

## 🚀 Быстрый старт

### 📋 Предварительные требования
- 🐳 [Docker](https://docker.com) & Docker Compose / Kubernetes cluster
- 🔑 YandexGPT 5 Lite API ключ ([получить здесь](https://cloud.yandex.ru/services/yandexgpt))
- 🤖 ruBloomGPT API access (early access program) https://drive.google.com/file/d/1u4zZNtIcrALJwPjUT-7yB7zlvDZ0_LPV/view?usp=sharing
- ☁️ Yandex Cloud account (для production deployment)

### ⚡ Установка за 60 секунд

```bash
# 1️⃣ Клонировать репозиторий
git clone https://github.com/yandex-education/graphium.git
cd graphium

# 2️⃣ Настройка окружения
cat > .env << EOF
# YandexGPT Configuration
YANDEXGPT_API_KEY=your_yandex_api_key_here
MODEL=yandexgpt-4-turbo
MAX_CONTEXT=100000

# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/graphium_db
REDIS_URL=redis://redis:6379/0

# Application
APP_NAME=ГрафиУм
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
EOF

# 3️⃣ Запуск всех сервисов
docker-compose up -d

# 4️⃣ Проверка статуса
docker-compose ps
```

### 🌐 Доступ к приложению
- **Фронтенд**: http://localhost:3000
- **API документация**: http://localhost:8000/docs
- **База данных**: localhost:5432 (postgres/password)

---

## 💻 Разработка

### 🔧 Backend разработка
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### ⚛️ Frontend разработка
```bash
cd frontend
npm install
npm run dev  # Vite dev server на порту 3000
```

### 🗄️ Работа с БД
```bash
# Подключение к PostgreSQL
docker-compose exec db psql -U postgres -d graphium_db

# Миграции
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### 🧪 Тестирование
```bash
# Backend тесты
cd backend && python -m pytest tests/ -v

# Frontend тесты
cd frontend && npm run test

# E2E тесты
npm run test:e2e
```

---

## 📊 API Reference

### 🎓 Courses Management
```http
GET    /api/teacher/courses           # Список курсов
POST   /api/teacher/courses           # Создать курс  
PUT    /api/teacher/courses/{id}      # Обновить курс
DELETE /api/teacher/courses/{id}      # Удалить курс
POST   /api/teacher/courses/{id}/publish  # Опубликовать
```

### 🤖 AI Processing
```http
POST   /api/teacher/courses/{id}/upload           # Загрузить файлы
POST   /api/teacher/courses/{id}/generate-graph   # Генерация графа
POST   /api/teacher/courses/{id}/generate-content # Генерация контента
```

### 👨‍🎓 Student Interface
```http
GET    /api/student/courses                       # Доступные курсы
GET    /api/student/courses/{id}                  # Детали курса
POST   /api/student/progress/{concept_id}         # Отметить прогресс
GET    /api/student/analytics                     # Статистика студента
```

---

## 🎨 UI/UX Особенности

### 🌈 Цветовая схема Яндекса
```css
:root {
  --yandex-yellow: #FFDB4D;  /* Основной желтый */
  --yandex-red: #FC3F1D;     /* Акцентный красный */  
  --yandex-black: #000000;   /* Контрастный черный */
  --yandex-gray: #999999;    /* Вспомогательный серый */
}
```

### 📱 Responsive Design
- 🖥️ **Desktop First** — оптимизация для преподавателей
- 📱 **Mobile Friendly** — адаптивность для студентов
- ⌨️ **Keyboard Navigation** — доступность

### ✨ Анимации и эффекты
- 🎬 **8-секундная анимация** создания графа
- 🌟 **Smooth transitions** между состояниями
- 🎯 **Hover effects** для интерактивности

---

## 🔒 Безопасность

### 🛡️ Встроенная защита
- 🔐 **JWT Authentication** для пользователей
- 🚫 **SQL Injection** защита через ORM
- 📝 **Input Validation** с Pydantic
- 🔒 **CORS** настройка для безопасности
- 📊 **Rate Limiting** для API endpoints

### 🔑 Управление ключами
```bash
# Безопасное хранение ключей API
export YANDEXGPT_API_KEY="your-secure-key"
# Никогда не коммитьте ключи в git!
```

---

## 📈 Мониторинг и аналитика

### 📊 Встроенная аналитика
- 👥 **Активные пользователи** — real-time статистика
- 📚 **Курсы и концепты** — детализированная аналитика  
- 🎯 **Прогресс обучения** — персональные метрики
- ⚡ **Производительность** — мониторинг системы

### 📝 Логирование
```python
# Структурированное логирование
LOG_LEVEL=INFO
LOG_FORMAT=json
```

---

## 🤝 Вклад в проект

### 🎯 Как внести вклад

1. **Fork** репозитория
2. Создайте **feature branch**: `git checkout -b feature/amazing-feature`
3. **Коммит** изменений: `git commit -m 'Add amazing feature'`
4. **Push** в branch: `git push origin feature/amazing-feature`
5. Откройте **Pull Request**

### 📝 Code Style
```bash
# Python (Black + isort)
black backend/
isort backend/

# TypeScript (Prettier + ESLint)
npm run lint:fix
npm run format
```

### 🐛 Bug Reports
Используйте [GitHub Issues](https://github.com/yandex-education/graphium/issues) для сообщения о багах.

---

## 🏆 Команда

### 👨‍💻 Разработчики
- **Lead Developer**: ITMOGPT.Team
- **AI Specialist**: YandexGPT Integration Expert
- **Frontend**: React + TypeScript Specialist
- **Backend**: FastAPI + PostgreSQL Expert

### 🎓 Педагогические консультанты
- **Dr. Педагогических наук** — методологический консультант
- **Эксперт по теории Выготского** — научный руководитель

---

## 🔮 Roadmap

### 🎯 Q1 2025
- [ ] Интеграция с **YandexGPT 5**
- [ ] **Mobile App** (React Native)
- [ ] **Advanced Analytics** dashboard
- [ ] **Multi-language** support

### 🚀 Q2 2025  
- [ ] **AI Tutoring** система
- [ ] **Collaborative Learning** функции
- [ ] **VR/AR** визуализация графов
- [ ] **Blockchain** сертификация

---

## 📜 Лицензия

```
MIT License

Copyright (c) 2025 Яндекс Образование & ITMOGPT.Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

### 🌟 Сделано с ❤️ для образования

**[Яндекс Образование](https://education.yandex.ru)** × **[ITMOGPT.Team](https://itmogpt.team)**

[![Yandex Education](https://img.shields.io/badge/Yandex-Education-FFDB4D?style=for-the-badge&logo=yandex)](https://education.yandex.ru)
[![ITMOGPT Team](https://img.shields.io/badge/ITMO-GPT%20Team-blue?style=for-the-badge)](https://itmogpt.team)

*Трансформируем образование с помощью искусственного интеллекта* 🚀

</div>