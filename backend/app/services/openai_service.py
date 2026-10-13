import json
from typing import List, Dict, Any
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.course import AIGraphResponse, AIContentResponse, AIConceptResponse, AIConnectionResponse
from app.db.models import ComplexityLevel, BloomLevel, ConnectionType

class OpenAIService:
    """Service for interacting with OpenAI GPT-5-mini model."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.MODEL  # gpt-5-mini
    
    async def generate_concept_graph(
        self, 
        extracted_text: str, 
        complexity_level: ComplexityLevel,
        course_title: str,
        course_description: str = ""
    ) -> AIGraphResponse:
        """
        Generate concept graph from extracted text using AI.
        
        Args:
            extracted_text: Text content from uploaded files
            complexity_level: Simple (fewer nodes) or Complex (more nodes)
            course_title: Title of the course
            course_description: Optional course description
            
        Returns:
            AIGraphResponse with concepts and connections
        """
        
        if complexity_level == ComplexityLevel.SIMPLE:
            prompt = self._get_simple_complexity_prompt(extracted_text, course_title, course_description)
        else:
            prompt = self._get_complex_complexity_prompt(extracted_text, course_title, course_description)
        
        try:
            # GPT-4o-mini for concept generation
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты эксперт по созданию образовательных графов знаний в русской педагогической традиции. Используй принципы Выготского о зоне ближайшего развития. Твоя задача - анализировать учебный материал и создавать структурированные концептуальные графы для эффективного обучения."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_completion_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            
            if not content or content.strip() == "":
                raise Exception("Empty response from OpenAI")
            
            # Debug: log the raw response
            print(f"Raw OpenAI response length: {len(content)}")
            print(f"Raw OpenAI response preview: {content[:200]}...")
            
            try:
                parsed_response = json.loads(content)
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Content that failed to parse: {content}")
                raise Exception(f"Invalid JSON response from OpenAI: {str(e)}")
            
            # Validate and convert to our schema (new format)
            return self._validate_and_convert_new_graph_response(parsed_response)
            
        except Exception as e:
            print(f"Full error in generate_concept_graph: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Error generating concept graph: {str(e)}")
    
    async def generate_concept_content(
        self,
        extracted_text: str,
        concepts: List[Dict[str, Any]],
        connections: List[Dict[str, Any]],
        course_title: str
    ) -> AIContentResponse:
        """
        Generate detailed content for each concept (5-10 sentences).
        
        Args:
            extracted_text: Original text from documents
            concepts: List of concepts with titles and descriptions
            connections: List of connections between concepts
            course_title: Title of the course
            
        Returns:
            AIContentResponse with content for each concept
        """
        
        prompt = self._get_content_generation_prompt(
            extracted_text, concepts, connections, course_title
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты эксперт по созданию образовательного контента в духе российской педагогической школы. Следуй принципам научности, доступности и систематичности. Создавай четкие, понятные объяснения концепций на основе исходного материала."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_completion_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            parsed_response = json.loads(content)
            
            return AIContentResponse(
                concept_contents=parsed_response.get("concept_contents", [])
            )
            
        except Exception as e:
            raise Exception(f"Error generating concept content: {str(e)}")
    
    async def generate_concept_descriptions(
        self,
        concepts: List[Dict[str, Any]],  # Active concepts from DB
        extracted_text: str,  # All uploaded materials combined
        course_title: str,
        course_description: str = ""
    ) -> Dict[str, str]:
        """
        Generate detailed descriptions for all active concepts using all uploaded materials.
        
        Args:
            concepts: List of active concepts from database
            extracted_text: All text content from uploaded files combined
            course_title: Title of the course
            course_description: Optional course description
            
        Returns:
            Dict mapping concept_id -> detailed_description
        """
        
        prompt = self._get_concept_descriptions_prompt(
            concepts, extracted_text, course_title, course_description
        )
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Ты эксперт-педагог по созданию качественного образовательного контента в традициях российской педагогической школы. Твоя задача - создать подробные, научно точные и педагогически выверенные описания концептов на основе учебных материалов. Следуй принципам Выготского о развивающем обучении."
                    },
                    {
                        "role": "user",
                        "content": prompt  
                    }
                ],
                max_completion_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
            
            if not content or content.strip() == "":
                raise Exception("Empty response from OpenAI")
            
            # Debug logging
            print(f"Generated descriptions response length: {len(content)}")
            print(f"Response preview: {content[:200]}...")
            
            try:
                parsed_response = json.loads(content)
                descriptions = parsed_response.get("descriptions", {})
                
                # Ensure we have description for each concept
                result = {}
                for concept in concepts:
                    concept_id = str(concept['id'])
                    if concept_id in descriptions:
                        result[concept_id] = descriptions[concept_id]
                    else:
                        # Fallback if OpenAI didn't provide description for this concept
                        result[concept_id] = f"Описание для концепта '{concept['title']}' будет добавлено позже."
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"JSON decode error in descriptions: {e}")
                print(f"Content that failed to parse: {content}")
                raise Exception(f"Invalid JSON response from OpenAI: {str(e)}")
                
        except Exception as e:
            print(f"Full error in generate_concept_descriptions: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Error generating concept descriptions: {str(e)}")
    
    def _get_simple_complexity_prompt(
        self, 
        text: str, 
        title: str, 
        description: str
    ) -> str:
        """Get prompt for simple complexity level (fewer concepts)."""
        return f"""
Проанализируй учебный материал и создай ПРОСТОЙ образовательный граф для курса "{title}".

ЭКОНОМЬ ТОКЕНЫ! Быстро пробеги по тексту и выбери только КЛЮЧЕВЫЕ термины, концепты, сущности, объекты.

Принципы отбора:
- Только самые важные концепты из текста
- Прямые и крепкие связи между ними  
- Фокус на основных понятиях
- Анализируй РЕАЛЬНУЮ силу связи между концептами в тексте

Описание курса: {description}

Учебный материал:
{text[:settings.MAX_CONTEXT]}

ТРЕБОВАНИЯ:
1. Создай от 10 до 30 ключевых концепций
2. Только прямые и сильные связи
3. Экономия токенов - краткость концептов!

Таксономия Блума:
- remember: основные факты
- understand: понимание связей  
- apply: применение знаний
- analyze: анализ структуры
- evaluate: критическая оценка
- create: создание нового

СТРОГО JSON формат:
{{
  "nodes": [
    {{
      "id": 1,
      "title": "Название концепта",
      "bloom_level": "understand"
    }}
  ],
  "relations": [
    {{
      "id": 1,
      "source_node": 1,
      "target_node": 2,
      "label": "тип связи",
      "directed": 0,
      "strength": 0.7
    }}
  ]
}}

ОБЯЗАТЕЛЬНО указывай strength (силу связи) от 0.1 до 1.0:
- 0.9-1.0: очень сильная связь (прямая зависимость, обязательная последовательность)
- 0.7-0.8: сильная связь (важная взаимосвязь, рекомендуемая последовательность) 
- 0.5-0.6: средняя связь (полезная взаимосвязь, дополняющие концепты)
- 0.3-0.4: слабая связь (косвенная связь, схожие темы)
- 0.1-0.2: очень слабая связь (отдаленная связь, контекстуальное упоминание)
"""

    def _get_complex_complexity_prompt(
        self, 
        text: str, 
        title: str, 
        description: str
    ) -> str:
        """Get prompt for complex complexity level (more concepts)."""
        return f"""
Проанализируй учебный материал и создай РАЗВЕРНУТЫЙ образовательный граф для курса "{title}".

🎯 ЦЕЛЬ: Создай МАКСИМАЛЬНО ПОЛНЫЙ граф знаний! Используй весь увеличенный контекст (75K токенов)!

ЗАДАЧА: Создай ДЕТАЛЬНЫЙ граф с 40-70 концептами! Не экономь концепты - создавай их много!

⚡ ИСПОЛЬЗУЙ НОВЫЕ ВОЗМОЖНОСТИ: У тебя теперь в 3 раза больше контекста (75K) и токенов ответа (24K) - используй их полностью! 

Требования:
- Концепты должны охватывать ВСЕ значимые части текста
- Создавай концепты для: основных терминов, методов, процессов, теорий, принципов, примеров
- НЕ ограничивайся только "основными" - включай важные детали и подкатегории
- Построй качественные связи между ВСЕМИ концептами
- Дай четкие labels (описания) связям
- Покрой ВСЕ ключевые аспекты темы - ничего не пропускай
- ДЕТАЛИЗАЦИЯ: Разбивай сложные темы на подконцепты
- ВАЖНО: Анализируй текст и ставь реалистичные значения strength на основе того, насколько тесно связаны концепты в исходном материале

Описание курса: {description}

Учебный материал:
{text[:settings.MAX_CONTEXT]}

ТРЕБОВАНИЯ К ГРАФУ:
1. МИНИМУМ 40 концептов, СТРЕМИСЬ к 50-70 концептам! (используй весь доступный контекст)
2. Качественные связи с понятными labels
3. Охват ВСЕХ ключевых аспектов текста - не пропускай ничего важного
4. Системный подход к структуре знаний
5. ВАЖНО: Создавай концепты для всех значимых терминов, процессов, методов, теорий из материала

Таксономия Блума:
- remember: воспроизведение фактов и терминов
- understand: интерпретация и объяснение концепций
- apply: использование в новых ситуациях
- analyze: разложение на части, анализ структур
- evaluate: критическая оценка и суждения
- create: создание новых структур и инноваций

СТРОГО JSON формат:
{{
  "nodes": [
    {{
      "id": 1,
      "title": "Название концепта",
      "bloom_level": "analyze"
    }}
  ],
  "relations": [
    {{
      "id": 1,
      "source_node": 1,
      "target_node": 2,
      "label": "четкое описание связи",
      "directed": 1,
      "strength": 0.8
    }}
  ]
}}

ОБЯЗАТЕЛЬНО указывай strength (силу связи) от 0.1 до 1.0:
- 0.90-1.00: очень сильная связь (прямая зависимость, обязательная последовательность)
- 0.70-0.80: сильная связь (важная взаимосвязь, рекомендуемая последовательность)
- 0.50-0.60: средняя связь (полезная взаимосвязь, дополняющие концепты) 
- 0.30-0.40: слабая связь (косвенная связь, схожие темы)
- 0.10-0.20: очень слабая связь (отдаленная связь, контекстуальное упоминание)

Анализируй текст и ставь реалистичные значения strength в зависимости от того, насколько тесно связаны концепты в исходном материале!
"""

    def _get_content_generation_prompt(
        self,
        text: str,
        concepts: List[Dict[str, Any]],
        connections: List[Dict[str, Any]],
        title: str
    ) -> str:
        """Get prompt for generating detailed content for concepts."""
        
        concepts_text = "\n".join([
            f"{i+1}. {c['title']} - {c.get('description', '')}" 
            for i, c in enumerate(concepts)
        ])
        
        return f"""
Создай высококачественный образовательный контент для курса "{title}" в традициях российской педагогической школы по Выготского.

ИСХОДНЫЙ УЧЕБНЫЙ МАТЕРИАЛ:
{text[:settings.MAX_CONTEXT]}

КОНЦЕПЦИИ ДЛЯ РАЗРАБОТКИ КОНТЕНТА:
{concepts_text}

ПЕДАГОГИЧЕСКИЕ ПРИНЦИПЫ:
- Научность: строгая терминология, проверенные факты
- Доступность: понятные объяснения, постепенное усложнение
- Наглядность: конкретные примеры, визуальные образы
- Связь с практикой: реальные применения, жизненные ситуации, без упоминания ID концептов.
- Систематичность: логическая последовательность, взаимосвязи
- Развивающий характер: стимулирование мышления

ТРЕБОВАНИЯ К КОНТЕНТУ:
1. Для КАЖДОЙ концепции создай 5-10 предложений
2. Начинай с четкого определения понятия
3. Объясни суть через аналогии и примеры из исходного материала
4. Покажи практическое применение
5. Используй активную форму изложения
6. Добавь проблемные вопросы для размышления

СТРУКТУРА ДЛЯ КАЖДОЙ КОНЦЕПЦИИ:
- Определение (1-2 предложения)
- Объяснение сути (2-3 предложения)
- Примеры из материала (2-3 предложения, если есть, если нет - проигнорируй)
- Практическое значение (1-2 предложения)  

ОБЯЗАТЕЛЬНЫЙ JSON формат:
{{
  "concept_contents": [
    "Первая концепция: Определение + развернутое объяснение + примеры + практическое значение + связи. Всего 3-10 предложений с педагогически выверенной структурой.",
    "Вторая концепция: ...",
    "..."
  ]
}}

КРИТИЧНО: Количество элементов = {len(concepts)} (по одному для каждой концепции).
"""

    def _validate_and_convert_graph_response(self, response: Dict[str, Any]) -> AIGraphResponse:
        """Validate and convert AI response to our schema."""
        try:
            concepts_data = response.get("concepts", [])
            connections_data = response.get("connections", [])
            
            # Convert concepts
            concepts = []
            for concept_data in concepts_data:
                # Validate Bloom level
                bloom_level = concept_data.get("bloom_level", "understand")
                if bloom_level not in [level.value for level in BloomLevel]:
                    bloom_level = "understand"
                
                concepts.append(AIConceptResponse(
                    title=concept_data.get("title", "Untitled Concept"),
                    description=concept_data.get("description", ""),
                    bloom_level=BloomLevel(bloom_level)
                ))
            
            # Convert connections
            connections = []
            for conn_data in connections_data:
                # Validate connection type
                conn_type = conn_data.get("connection_type", "related")
                if conn_type not in [ct.value for ct in ConnectionType]:
                    conn_type = "related"
                
                source_idx = conn_data.get("source_concept_index", 0)
                target_idx = conn_data.get("target_concept_index", 0)
                
                # Validate indices
                if 0 <= source_idx < len(concepts) and 0 <= target_idx < len(concepts) and source_idx != target_idx:
                    connections.append(AIConnectionResponse(
                        source_concept_index=source_idx,
                        target_concept_index=target_idx,
                        connection_type=ConnectionType(conn_type),
                        strength=max(0.1, min(1.0, conn_data.get("strength", 0.5)))
                    ))
            
            return AIGraphResponse(concepts=concepts, connections=connections)
            
        except Exception as e:
            raise Exception(f"Error validating AI response: {str(e)}")
    
    def _validate_and_convert_new_graph_response(self, response: Dict[str, Any]) -> AIGraphResponse:
        """Validate and convert new AI response format to our schema."""
        try:
            nodes_data = response.get("nodes", [])
            relations_data = response.get("relations", [])
            
            if not nodes_data:
                raise Exception("No nodes found in AI response")
            
            if not relations_data:
                raise Exception("No relations found in AI response")
            
            # Convert nodes to concepts
            concepts = []
            node_id_map = {}  # Map GPT node IDs to our indices
            
            for i, node_data in enumerate(nodes_data):
                # Validate Bloom level
                bloom_level = node_data.get("bloom_level", "understand")
                if bloom_level not in [level.value for level in BloomLevel]:
                    bloom_level = "understand"
                
                node_id = node_data.get("id", i + 1)
                node_id_map[node_id] = i
                
                concepts.append(AIConceptResponse(
                    title=node_data.get("title", f"Concept {i + 1}"),
                    description="",  # No description in new format
                    bloom_level=BloomLevel(bloom_level)
                ))
            
            # Convert relations to connections
            connections = []
            for relation_data in relations_data:
                source_node_id = relation_data.get("source_node")
                target_node_id = relation_data.get("target_node")
                
                # Map node IDs to indices
                if source_node_id in node_id_map and target_node_id in node_id_map:
                    source_idx = node_id_map[source_node_id]
                    target_idx = node_id_map[target_node_id]
                    
                    if source_idx != target_idx:
                        # Determine connection type based on label
                        label = relation_data.get("label", "").lower()
                        connection_type = self._determine_connection_type(label)
                        
                        # Use strength from AI response or default based on directed flag
                        directed = relation_data.get("directed", 0)
                        strength = relation_data.get("strength", 0.8 if directed == 1 else 0.6)
                        
                        # Ensure strength is within valid range
                        strength = max(0.1, min(1.0, strength))
                        
                        connections.append(AIConnectionResponse(
                            source_concept_index=source_idx,
                            target_concept_index=target_idx,
                            connection_type=connection_type,
                            strength=strength
                        ))
            
            if not connections:
                raise Exception("No valid connections could be created from AI response")
            
            return AIGraphResponse(concepts=concepts, connections=connections)
            
        except Exception as e:
            raise Exception(f"JSON parsing error or invalid structure: {str(e)}")
    
    def _determine_connection_type(self, label: str) -> ConnectionType:
        """Determine connection type based on relation label."""
        label = label.lower()
        
        if any(word in label for word in ["предварительное", "необходимо", "до", "prerequisite", "before"]):
            return ConnectionType.PREREQUISITE
        elif any(word in label for word in ["часть", "компонент", "входит", "part", "component"]):
            return ConnectionType.PART
        elif any(word in label for word in ["похож", "аналог", "подобн", "similar", "like"]):
            return ConnectionType.SIMILAR
        else:
            return ConnectionType.RELATED
    
    def _get_concept_descriptions_prompt(
        self,
        concepts: List[Dict[str, Any]],
        extracted_text: str,
        course_title: str,
        course_description: str
    ) -> str:
        """Get prompt for generating detailed concept descriptions."""
        
        # Prepare concept list
        concepts_list = []
        for concept in concepts:
            bloom_mapping = {
                'remember': 'запоминание',
                'understand': 'понимание', 
                'apply': 'применение',
                'analyze': 'анализ',
                'evaluate': 'оценка',
                'create': 'создание'
            }
            bloom_ru = bloom_mapping.get(concept.get('bloom_level', 'understand'), 'понимание')
            
            concepts_list.append(f"ID {concept['id']}: {concept['title']} (уровень: {bloom_ru})")
        
        concepts_text = "\n".join(concepts_list)
        
        return f"""
АНАЛИЗ И СОЗДАНИЕ ОПИСАНИЙ КОНЦЕПТОВ

КУРС: "{course_title}"
ОПИСАНИЕ КУРСА: {course_description}

ВСЕ УЧЕБНЫЕ МАТЕРИАЛЫ:
{extracted_text[:settings.MAX_CONTEXT]}

КОНЦЕПТЫ ДЛЯ ОПИСАНИЯ:
{concepts_text}

ЗАДАЧА:
Проанализируй ВСЕ учебные материалы и создай подробные, качественные описания для КАЖДОГО концепта. Учти контекст всех материалов при создании каждого описания.

ПРИНЦИПЫ СОЗДАНИЯ ОПИСАНИЙ:
1. НАУЧНОСТЬ - используй точную терминологию из материалов
2. ПОЛНОТА - покрой все важные аспекты концепта из материалов
3. СВЯЗНОСТЬ - покажи как концепт связан с другими из списка
4. ДОСТУПНОСТЬ - объясни сложные понятия через простые аналогии
5. ПРАКТИЧНОСТЬ - укажи практическое применение из материалов
6. РАЗВИВАЮЩИЙ ХАРАКТЕР - стимулируй дальнейшее изучение

СТРУКТУРА КАЖДОГО ОПИСАНИЯ (8-12 предложений):
- ОПРЕДЕЛЕНИЕ: Четкое определение концепта (1-2 предложения)
- СУТЬ: Подробное объяснение сути на основе материалов (3-4 предложения)
- ПРИМЕРЫ: Конкретные примеры и случаи из загруженных материалов (2-3 предложения)  
- СВЯЗИ: Как концепт связан с другими из списка (1-2 предложения)
- ПРАКТИКА: Практическое значение и применение (1-2 предложения)

ОСОБЕННОСТИ ПО УРОВНЯМ БЛУМА:
- ЗАПОМИНАНИЕ: акцент на фактах, определениях, терминологии
- ПОНИМАНИЕ: объяснение сути, интерпретация, сравнения
- ПРИМЕНЕНИЕ: практические примеры, алгоритмы, процедуры
- АНАЛИЗ: структура, компоненты, взаимосвязи  
- ОЦЕНКА: критерии, стандарты, сравнительный анализ
- СОЗДАНИЕ: инновации, творческие решения, новые подходы

ОБЯЗАТЕЛЬНЫЙ JSON ФОРМАТ:
{{
  "descriptions": {{
    "ID концепта": "Полное развернутое описание концепта в 8-12 предложений, созданное на основе анализа всех учебных материалов...",
    "{concepts[0]['id']}": "Описание первого концепта...",
    "{concepts[1]['id'] if len(concepts) > 1 else 'example'}": "Описание второго концепта...",
    "...": "..."
  }}
}}

КРИТИЧНО: Создай описание для КАЖДОГО концепта из списка выше ({len(concepts)} концептов). Используй ID концепта как ключ.
"""