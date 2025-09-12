import json
import asyncio
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
            parsed_response = json.loads(content)
            
            # Validate and convert to our schema (new format)
            return self._validate_and_convert_new_graph_response(parsed_response)
            
        except Exception as e:
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
1. Создай от 5 ключевых концепций
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

ЖЕСТКАЯ ЗАДАЧА: Выбери минимум 30 концептов для построения качественного графа! 

Требования:
- Концепты должны охватывать большую часть текста
- Все концепты должны быть основными и важными
- Построй очень качественные связи между концептами
- Дай четкие labels (описания) связям
- Покрой все ключевые аспекты темы
- ВАЖНО: Анализируй текст и ставь реалистичные значения strength на основе того, насколько тесно связаны концепты в исходном материале

Описание курса: {description}

Учебный материал:
{text[:settings.MAX_CONTEXT]}

ТРЕБОВАНИЯ К ГРАФУ:
1. МИНИМУМ 30 концептов (основных и важных)
2. Качественные связи с понятными labels
3. Охват большей части текста
4. Системный подход к структуре знаний

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
- 0.9-1.0: очень сильная связь (прямая зависимость, обязательная последовательность)
- 0.7-0.8: сильная связь (важная взаимосвязь, рекомендуемая последовательность)
- 0.5-0.6: средняя связь (полезная взаимосвязь, дополняющие концепты) 
- 0.3-0.4: слабая связь (косвенная связь, схожие темы)
- 0.1-0.2: очень слабая связь (отдаленная связь, контекстуальное упоминание)

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
- Связь с практикой: реальные применения, жизненные ситуации
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
    "Первая концепция: Определение + развернутое объяснение + примеры + практическое значение + связи. Всего 5-10 предложений с педагогически выверенной структурой.",
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