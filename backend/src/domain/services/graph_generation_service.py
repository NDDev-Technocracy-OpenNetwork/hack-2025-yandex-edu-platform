from abc import ABC, abstractmethod
from typing import List, Dict, Tuple, Any


class GraphGenerationService(ABC):
    @abstractmethod
    async def generate_graph(self, text_content: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        pass

    @abstractmethod
    async def extract_concepts(self, text_content: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def generate_connections(self, concepts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def optimize_layout(self, concepts: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass