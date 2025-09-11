import os
import io
from typing import List
import aiofiles
from pathlib import Path

# PDF parsing
from PyPDF2 import PdfReader

# Word document parsing
from docx import Document

# PowerPoint parsing  
from pptx import Presentation

# Excel/CSV parsing
import pandas as pd

# Markdown parsing
import markdown
from bs4 import BeautifulSoup

class FileParserService:
    """Service for parsing various file formats and extracting text content."""
    
    @staticmethod
    async def parse_file(file_path: str, content_type: str) -> str:
        """
        Parse a file and extract text content based on file type.
        
        Args:
            file_path: Path to the uploaded file
            content_type: MIME type of the file
            
        Returns:
            Extracted text content
        """
        try:
            if content_type == "application/pdf":
                return await FileParserService._parse_pdf(file_path)
            elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
                return await FileParserService._parse_docx(file_path)
            elif content_type in ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"]:
                return await FileParserService._parse_pptx(file_path)
            elif content_type == "text/markdown":
                return await FileParserService._parse_markdown(file_path)
            elif content_type == "text/plain":
                return await FileParserService._parse_txt(file_path)
            elif content_type in ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]:
                return await FileParserService._parse_excel_csv(file_path, content_type)
            else:
                raise ValueError(f"Unsupported file type: {content_type}")
                
        except Exception as e:
            raise Exception(f"Error parsing file: {str(e)}")
    
    @staticmethod
    async def _parse_pdf(file_path: str) -> str:
        """Parse PDF file and extract text."""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
        except Exception as e:
            raise Exception(f"Error parsing PDF: {str(e)}")
        
        return text.strip()
    
    @staticmethod
    async def _parse_docx(file_path: str) -> str:
        """Parse DOCX file and extract text."""
        text = ""
        try:
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n\n"
                    
            # Extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    row_text = []
                    for cell in row.cells:
                        if cell.text.strip():
                            row_text.append(cell.text.strip())
                    if row_text:
                        text += " | ".join(row_text) + "\n"
                        
        except Exception as e:
            raise Exception(f"Error parsing DOCX: {str(e)}")
        
        return text.strip()
    
    @staticmethod 
    async def _parse_pptx(file_path: str) -> str:
        """Parse PPTX file and extract text from slides."""
        text = ""
        try:
            prs = Presentation(file_path)
            
            for slide_num, slide in enumerate(prs.slides, 1):
                text += f"--- Слайд {slide_num} ---\n"
                
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        text += shape.text + "\n"
                        
                text += "\n"
                        
        except Exception as e:
            raise Exception(f"Error parsing PPTX: {str(e)}")
            
        return text.strip()
    
    @staticmethod
    async def _parse_markdown(file_path: str) -> str:
        """Parse Markdown file and extract text."""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
                md_content = await file.read()
                
            # Convert markdown to HTML then extract text
            html = markdown.markdown(md_content)
            soup = BeautifulSoup(html, 'html.parser')
            text = soup.get_text()
            
            return text.strip()
            
        except Exception as e:
            raise Exception(f"Error parsing Markdown: {str(e)}")
    
    @staticmethod
    async def _parse_txt(file_path: str) -> str:
        """Parse plain text file."""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
                text = await file.read()
            return text.strip()
            
        except Exception as e:
            raise Exception(f"Error parsing TXT: {str(e)}")
    
    @staticmethod
    async def _parse_excel_csv(file_path: str, content_type: str) -> str:
        """Parse Excel or CSV file and extract text content."""
        text = ""
        try:
            if content_type == "text/csv":
                df = pd.read_csv(file_path)
            else:
                # Excel files
                df = pd.read_excel(file_path)
            
            # Convert dataframe to readable text
            text = f"Файл содержит {len(df)} строк и {len(df.columns)} столбцов.\n\n"
            text += f"Столбцы: {', '.join(df.columns.tolist())}\n\n"
            
            # Add first few rows as sample
            sample_rows = min(10, len(df))
            text += f"Первые {sample_rows} строк данных:\n"
            text += df.head(sample_rows).to_string(index=False)
            
            # Add summary statistics for numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns
            if len(numeric_cols) > 0:
                text += "\n\nСтатистика по числовым столбцам:\n"
                text += df[numeric_cols].describe().to_string()
                
        except Exception as e:
            raise Exception(f"Error parsing Excel/CSV: {str(e)}")
            
        return text.strip()
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """Get file extension from filename."""
        return Path(filename).suffix.lower()
    
    @staticmethod
    def is_supported_file_type(content_type: str, filename: str) -> bool:
        """Check if file type is supported for parsing."""
        supported_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", 
            "application/vnd.ms-powerpoint",
            "text/markdown",
            "text/plain",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
        
        supported_extensions = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".md", ".txt", ".csv", ".xlsx", ".xls"]
        
        file_ext = FileParserService.get_file_extension(filename)
        
        return content_type in supported_types or file_ext in supported_extensions