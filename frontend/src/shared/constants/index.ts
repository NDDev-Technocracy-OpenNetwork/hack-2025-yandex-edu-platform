// Application constants following business requirements

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 500,
  MAX_SIZE_BYTES: 500 * 1024 * 1024,
  ALLOWED_TYPES: ['.pdf', '.docx', '.txt', '.md'] as const,
  TIMEOUT_MS: 60000,
} as const;

export const GRAPH_LIMITS = {
  MAX_NODES: 200,
  MAX_CONNECTIONS: 500,
  VIRTUALIZATION_THRESHOLD: 50,
  LAZY_LOAD_DISTANCE: 2,
  RENDER_TIMEOUT_MS: 5000,
  MEMORY_LIMIT_MB: 100,
} as const;

export const CONTENT_LIMITS = {
  COURSE_TITLE_MAX: 100,
  COURSE_DESCRIPTION_MAX: 1000,
  CONCEPT_TITLE_MAX: 100,
  CONCEPT_COMMENT_MAX: 500,
} as const;

export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const PROCESSING_STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  EXTRACTING: 'extracting',
  LINKING: 'linking',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const CONNECTION_TYPES = {
  PREREQUISITE: 'prerequisite',
  PART: 'part',
  SIMILAR: 'similar',
  RELATED: 'related',
} as const;

export const BLOOM_LEVELS = {
  REMEMBER: 'remember',
  UNDERSTAND: 'understand',
  APPLY: 'apply',
  ANALYZE: 'analyze',
  EVALUATE: 'evaluate',
  CREATE: 'create',
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_BIG: 'Размер файла превышает 500 МБ',
  UNSUPPORTED_FORMAT: 'Неподдерживаемый формат файла',
  NETWORK_ERROR: 'Ошибка сети. Проверьте подключение',
  PROCESSING_FAILED: 'Не удалось обработать документ',
  SERVER_ERROR: 'Сервер временно недоступен',
  EMPTY_DOCUMENT: 'Документ содержит недостаточно текста для анализа',
  UPLOAD_TIMEOUT: 'Превышено время ожидания загрузки',
} as const;

export const UI_TEXT = {
  BUTTONS: {
    UPLOAD: 'Загрузить документ',
    SAVE: 'Сохранить курс',
    CONTINUE: 'Продолжить обучение',
    RETRY: 'Попробовать снова',
    CREATE_COURSE: 'Создать курс',
    LEARN_MORE: 'Подробнее',
    START_TOUR: 'Начать обзор',
    SKIP: 'Пропустить',
  },
  STATUS: {
    UPLOADING: 'Обработка файла...',
    GENERATING: 'Построение графа концепций...',
    COMPLETE: 'Курс готов к просмотру',
    ERROR: 'Ошибка обработки',
    IDLE: 'Выберите файл для загрузки',
  },
  PLACEHOLDERS: {
    COURSE_TITLE: 'Введите название курса',
    CONCEPT_NAME: 'Название концепции',
    SEARCH_COURSE: 'Поиск курсов',
    CONCEPT_COMMENT: 'Добавьте объяснение для студентов...',
  },
} as const;