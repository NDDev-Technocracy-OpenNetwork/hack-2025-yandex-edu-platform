import re
import math
from typing import List, Dict, Tuple, Any
from ...domain.services import GraphGenerationService

try:
    import spacy
    import networkx as nx
except ImportError:
    spacy = None
    nx = None


class GraphGenerator(GraphGenerationService):
    def __init__(self):
        self.nlp = None
        if spacy:
            try:
                self.nlp = spacy.load("ru_core_news_sm")
            except OSError:
                # Fallback to English model
                try:
                    self.nlp = spacy.load("en_core_web_sm")
                except OSError:
                    pass

    async def generate_graph(self, text_content: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        concepts = await self.extract_concepts(text_content)
        connections = await self.generate_connections(concepts)
        optimized_concepts = await self.optimize_layout(concepts, connections)
        
        return optimized_concepts, connections

    async def extract_concepts(self, text_content: str) -> List[Dict[str, Any]]:
        # Simple concept extraction - in production, this would use more sophisticated NLP
        concepts = []
        
        if self.nlp:
            doc = self.nlp(text_content)
            
            # Extract noun phrases as concepts
            noun_phrases = set()
            for chunk in doc.noun_chunks:
                if len(chunk.text) > 3 and len(chunk.text) < 50:
                    noun_phrases.add(chunk.text.strip().lower())
            
            # Extract named entities
            entities = set()
            for ent in doc.ents:
                if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "WORK_OF_ART"]:
                    entities.add(ent.text.strip().lower())
            
            all_concepts = list(noun_phrases.union(entities))[:20]  # Limit to 20 concepts
        else:
            # Fallback: simple keyword extraction
            sentences = re.split(r'[.!?]+', text_content)
            words = re.findall(r'\b[А-Яа-яA-Za-z]{4,}\b', text_content)
            word_freq = {}
            for word in words:
                word_freq[word.lower()] = word_freq.get(word.lower(), 0) + 1
            
            # Get top words as concepts
            all_concepts = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:15]
            all_concepts = [word for word, freq in all_concepts if freq > 1]

        # Convert to concept format
        bloom_levels = ["remember", "understand", "apply", "analyze", "evaluate", "create"]
        
        for i, concept_text in enumerate(all_concepts):
            concepts.append({
                "title": concept_text.title(),
                "description": f"Концепция: {concept_text}",
                "bloom_level": bloom_levels[i % len(bloom_levels)],
                "x": 0,  # Will be set in layout optimization
                "y": 0
            })
        
        return concepts

    async def generate_connections(self, concepts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        connections = []
        
        # Simple connection generation based on text similarity
        for i, concept1 in enumerate(concepts):
            for j, concept2 in enumerate(concepts[i+1:], i+1):
                # Calculate simple similarity
                similarity = self._calculate_similarity(concept1["title"], concept2["title"])
                
                if similarity > 0.3:  # Threshold for connection
                    connection_type = self._determine_connection_type(concept1, concept2)
                    connections.append({
                        "source": concept1["title"],
                        "target": concept2["title"],
                        "type": connection_type,
                        "strength": similarity
                    })
        
        return connections[:30]  # Limit connections

    async def optimize_layout(self, concepts: List[Dict[str, Any]], connections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not nx or len(concepts) < 2:
            # Simple circular layout as fallback
            for i, concept in enumerate(concepts):
                angle = 2 * math.pi * i / len(concepts)
                concept["x"] = 200 * math.cos(angle)
                concept["y"] = 200 * math.sin(angle)
            return concepts

        # Create graph
        G = nx.Graph()
        
        # Add nodes
        for concept in concepts:
            G.add_node(concept["title"])
        
        # Add edges
        for connection in connections:
            if connection["source"] in G and connection["target"] in G:
                G.add_edge(connection["source"], connection["target"], weight=connection["strength"])
        
        # Generate layout
        try:
            pos = nx.spring_layout(G, k=100, iterations=50)
            
            # Update concept positions
            for concept in concepts:
                if concept["title"] in pos:
                    concept["x"] = pos[concept["title"]][0] * 300
                    concept["y"] = pos[concept["title"]][1] * 300
        except:
            # Fallback to circular layout
            for i, concept in enumerate(concepts):
                angle = 2 * math.pi * i / len(concepts)
                concept["x"] = 200 * math.cos(angle)
                concept["y"] = 200 * math.sin(angle)
        
        return concepts

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        # Simple Jaccard similarity
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)

    def _determine_connection_type(self, concept1: Dict, concept2: Dict) -> str:
        # Simple heuristic for connection type
        bloom_order = {
            "remember": 1, "understand": 2, "apply": 3,
            "analyze": 4, "evaluate": 5, "create": 6
        }
        
        level1 = bloom_order.get(concept1["bloom_level"], 3)
        level2 = bloom_order.get(concept2["bloom_level"], 3)
        
        if abs(level1 - level2) <= 1:
            return "related"
        elif level1 < level2:
            return "prerequisite"
        else:
            return "similar"