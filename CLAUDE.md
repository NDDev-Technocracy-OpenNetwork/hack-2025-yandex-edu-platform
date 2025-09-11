# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Educational AI Platform that creates interactive knowledge graphs from course materials. It's a React-based frontend application for Yandex's educational platform.

## Key Development Commands

### Running the Application
- `npm run dev` - Start development server (Vite) on port 3000
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Docker Development
- `docker-compose up` - Run frontend in development mode with hot reload
- Frontend runs on port 3000, expects backend API on port 8000

## Architecture

### Project Structure
- **Frontend-only application** using React 19 + TypeScript + Vite
- **Domain-Driven Design** with clear separation of concerns:
  - `src/domain/` - Business entities (Course, Concept) and value objects
  - `src/application/` - Use cases and business logic
  - `src/infrastructure/` - External service implementations
  - `src/presentation/` - React components, stores, and UI logic

### State Management
- **Zustand** for global state management with devtools
- Modular store with specific selectors: `useAuth()`, `useCourses()`, `useUpload()`, `useUI()`, `useGraph()`
- Main store: `src/presentation/stores/useAppStore.ts`

### Tech Stack
- React 19 with TypeScript
- Tailwind CSS for styling
- D3.js for graph visualizations
- React Router for navigation
- Zustand for state management
- Vite for build tooling

### Key Features
1. **Knowledge Graph Visualization** - Interactive D3.js-based graphs of course concepts
2. **File Upload Processing** - Supports .pdf, .docx, .txt, .md up to 20MB
3. **Role-based UI** - Separate teacher and student interfaces
4. **Real-time Processing Status** - Progress tracking for course generation

### Important Constants and Limits
- File upload: 20MB max, supports .pdf/.docx/.txt/.md
- Graph limits: 200 nodes max, 500 connections max
- Processing states: idle → uploading → processing → extracting → linking → success/error

### Component Organization
- `src/presentation/components/common/` - Shared UI components
- `src/presentation/components/features/` - Feature-specific components
- `src/presentation/components/graph/` - Graph visualization components
- `src/presentation/components/pages/` - Page-level components

### Backend Integration
- Expected API endpoint: `http://localhost:8000`
- WebSocket connection: `ws://localhost:8000/ws`
- Currently uses mock data in `src/infrastructure/repositories/MockCourseRepository.ts`

## Development Notes

- The application expects a backend API but is currently frontend-only
- Uses clean architecture principles with dependency inversion
- All text content is in Russian for the Yandex educational platform
- Graph visualization uses performance optimizations (virtualization at 50+ nodes)
- Error boundaries implemented for robust error handling