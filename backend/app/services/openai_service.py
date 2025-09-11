import json
import asyncio
from typing import List, Dict, Any
from openai import AsyncOpenAI
from app.core.config import settings
from app.schemas.course import AIGraphResponse, AIContentResponse, AIConceptResponse, AIConnectionResponse
from app.db.models import ComplexityLevel, BloomLevel, ConnectionType

class OpenAIService:
    """Service for interacting with OpenAI GPT-4o-mini model."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o-mini"
    
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
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Ты эксперт по созданию образовательных графов знаний. Твоя задача - анализировать учебный материал и создавать структурированные концептуальные графы для изучения."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=4000,
                response_format={"type": "json_object"}
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
                        "content": "Ты эксперт по созданию образовательного контента. Твоя задача - создавать подробные объяснения концепций на основе исходного материала."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.6,
                max_tokens=6000,
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
Проанализируй следующий учебный материал и создай ПРОСТОЙ граф концепций для курса "{title}".

Описание курса: {description}

Учебный материал:
{text[:8000]}

ВАЖНЫЕ ТРЕБОВАНИЯ:
1. Создай 5-8 ключевых концепций (не больше!)
2. Концепции должны быть четкими и фундаментальными
3. Каждая концепция должна иметь уровень по таксономии Блума
4. Связи между концепциями должны быть логичными
5. Фокусируйся на основных идеях, а не деталях

Уровни таксономии Блума:
- remember: запоминание фактов
- understand: понимание концепций 
- apply: применение знаний
- analyze: анализ информации
- evaluate: оценка и критическое мышление
- create: создание нового

Типы связей:
- prerequisite: одна концепция является предпосылкой для другой
- part: одна концепция является частью другой
- similar: концепции похожи или связаны
- related: общая связь между концепциями

Ответь ТОЛЬКО в JSON формате:
{{
  "concepts": [
    {{
      "title": "Название концепции",
      "description": "Краткое описание (1-2 предложения)",
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
Проанализируй следующий учебный материал и создай ПОДРОБНЫЙ граф концепций для курса "{title}".

Описание курса: {description}

Учебный материал:
{text[:8000]}

ВАЖНЫЕ ТРЕБОВАНИЯ:
1. Создай 12-20 концепций для детального изучения
2. Включи как основные, так и дополнительные концепции
3. Каждая концепция должна иметь уровень по таксономии Блума
4. Создай множественные связи между концепциями
5. Покрой все важные аспекты материала

Уровни таксономии Блума:
- remember: запоминание фактов и терминов
- understand: понимание концепций и идей
- apply: применение знаний на практике
- analyze: анализ и разбор информации
- evaluate: оценка и критическое мышление
- create: создание нового контента

Типы связей:
- prerequisite: одна концепция обязательна для понимания другой
- part: одна концепция является частью другой (композиция)
- similar: концепции имеют сходства
- related: общая тематическая связь

Ответь ТОЛЬКО в JSON формате:
{{
  "concepts": [
    {{
      "title": "Название концепции",
      "description": "Подробное описание концепции (2-3 предложения)",
      "bloom_level": "apply"
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
            f"{i}. {c['title']} - {c.get('description', '')}" 
            for i, c in enumerate(concepts)
        ])
        
        return f"""
На основе исходного учебного материала создай подробный контент для каждой концепции курса "{title}".

ИСХОДНЫЙ МАТЕРИАЛ:
{text[:10000]}

КОНЦЕПЦИИ ДЛЯ КОТОРЫХ НУЖНО СОЗДАТЬ КОНТЕНТ:
{concepts_text}

ТРЕБОВАНИЯ К КОНТЕНТУ:
1. Для каждой концепции напиши 5-10 предложений
2. Контент должен основываться на исходном материале
3. Объясни концепцию простым и понятным языком
4. Включи примеры если они есть в материале
5. Сделай контент образовательным и интересным
6. Учти связи между концепциями

Ответь ТОЛЬКО в JSON формате:
{{
  "concept_contents": [
    "Подробное объяснение первой концепции с примерами и деталями из материала. Должно быть 5-10 предложений...",
    "Подробное объяснение второй концепции...",
    "..."
  ]
}}

ВАЖНО: Количество элементов в concept_contents должно точно соответствовать количеству концепций ({len(concepts)}).
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