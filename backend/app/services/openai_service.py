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
            # GPT-5-mini with new parameters
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
                temperature=settings.TEMPERATURE_GRAPH,
                max_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"},
                reasoning_effort=settings.REASONING_EFFORT,
                verbosity=settings.VERBOSITY_GRAPH
            )
            
            content = response.choices[0].message.content
            parsed_response = json.loads(content)
            
            # Validate and convert to our schema
            return self._validate_and_convert_graph_response(parsed_response)
            
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
                temperature=settings.TEMPERATURE_CONTENT,
                max_tokens=settings.MAX_TOKENS,
                response_format={"type": "json_object"},
                reasoning_effort=settings.REASONING_EFFORT,
                verbosity=settings.VERBOSITY_CONTENT
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

Используй принципы российской педагогической школы:
- Научность и систематичность изложения 
- Доступность и последовательность
- Связь с жизненным опытом
- Зона ближайшего развития (по Выготскому)

Описание курса: {description}

Учебный материал:
{text[:settings.MAX_CONTEXT]}

ТРЕБОВАНИЯ К ГРАФУ:
1. Создай 5-8 КЛЮЧЕВЫХ концепций (фундаментальные понятия)
2. Используй принцип "от простого к сложному"
3. Обеспечь логическую последовательность изучения
4. Каждая концепция = четко определенное понятие с практическим применением
5. Связи должны отражать педагогическую логику изучения

Таксономия Блума (образовательные цели):
- remember: запоминание основных фактов и определений
- understand: понимание смысла и связей между понятиями  
- apply: применение знаний в стандартных ситуациях
- analyze: анализ структуры, причинно-следственных связей
- evaluate: критическая оценка, сравнение подходов
- create: синтез новых знаний, творческие задачи

Типы педагогических связей:
- prerequisite: необходимо изучить ДО данной концепции
- part: является составной частью более общего понятия
- similar: схожие понятия, можно изучать параллельно
- related: дополняют друг друга, расширяют понимание

СТРОГО JSON формат:
{{
  "concepts": [
    {{
      "title": "Точное название концепции",
      "description": "Педагогически грамотное описание сути (1-2 предложения)",
      "bloom_level": "understand"
    }}
  ],
  "connections": [
    {{
      "source_concept_index": 0,
      "target_concept_index": 1,
      "connection_type": "prerequisite",
      "strength": 0.8
    }}
  ]
}}
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

Применяй передовые принципы российской педагогики и психологии обучения:
- Системность и целостность знания (Давыдов)
- Деятельностный подход (Леонтьев)
- Развивающее обучение (Эльконин-Давыдов)
- Зона ближайшего развития с детализацией уровней (Выготский)
- Поэтапное формирование умственных действий (Гальперин)

Описание курса: {description}

Учебный материал:
{text[:settings.MAX_CONTEXT]}

ТРЕБОВАНИЯ К РАЗВЕРНУТОМУ ГРАФУ:
1. Создай 12-20 концепций для глубокого освоения предмета
2. Представь многоуровневую систему: базовые → промежуточные → продвинутые
3. Включи теоретические основы И практические применения
4. Покрой все ключевые аспекты с детализацией подтем
5. Создай сеть взаимосвязей для системного понимания
6. Учти различные типы learner'ов (визуалы, кинестетики, аудиалы)

Расширенная таксономия Блума:
- remember: воспроизведение фактов, терминов, основных идей
- understand: интерпретация, объяснение, резюмирование концепций
- apply: использование в новых ситуациях, решение задач
- analyze: разложение на части, выявление структур и отношений
- evaluate: критическая оценка, обоснование суждений
- create: объединение элементов в новые структуры, инновации

Типы образовательных связей:
- prerequisite: строгая последовательность (А необходимо ДО Б)
- part: иерархическая структура (А входит в Б как компонент)
- similar: аналогии и параллели (можно изучать совместно)
- related: междисциплинарные связи, контекстуальные отношения

ОБЯЗАТЕЛЬНО JSON формат:
{{
  "concepts": [
    {{
      "title": "Точное научное название концепции",
      "description": "Развернутое педагогическое описание с акцентом на практическое значение (2-3 предложения)",
      "bloom_level": "analyze"
    }}
  ],
  "connections": [
    {{
      "source_concept_index": 0,
      "target_concept_index": 1,
      "connection_type": "prerequisite",
      "strength": 0.9
    }}
  ]
}}
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
Создай высококачественный образовательный контент для курса "{title}" в традициях российской педагогической школы.

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
1. Для КАЖДОЙ концепции создай 7-12 предложений
2. Начинай с четкого определения понятия
3. Объясни суть через аналогии и примеры из исходного материала
4. Покажи практическое применение
5. Укажи связи с другими концепциями курса
6. Используй активную форму изложения
7. Добавь проблемные вопросы для размышления

СТРУКТУРА ДЛЯ КАЖДОЙ КОНЦЕПЦИИ:
- Определение (1-2 предложения)
- Объяснение сути (2-3 предложения)
- Примеры из материала (2-3 предложения)
- Практическое значение (1-2 предложения)  
- Связи с другими темами (1-2 предложения)

ОБЯЗАТЕЛЬНЫЙ JSON формат:
{{
  "concept_contents": [
    "Первая концепция: Определение + развернутое объяснение + примеры + практическое значение + связи. Всего 7-12 предложений с педагогически выверенной структурой.",
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