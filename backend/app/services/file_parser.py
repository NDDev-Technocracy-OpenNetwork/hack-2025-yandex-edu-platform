import aiofiles
from pathlib import Path

# PDF parsing
from PyPDF2 import PdfReader
import pdfplumber

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
            # Get file extension for better detection
            file_extension = FileParserService.get_file_extension(file_path)
            
            # Determine parser based on content type and file extension
            if content_type == "application/pdf" or file_extension == ".pdf":
                return await FileParserService._parse_pdf(file_path)
            elif (content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"] 
                  or file_extension in [".docx", ".doc"]):
                return await FileParserService._parse_docx(file_path)
            elif (content_type in ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/vnd.ms-powerpoint"]
                  or file_extension in [".pptx", ".ppt"]):
                return await FileParserService._parse_pptx(file_path)
            elif (content_type == "text/markdown" or file_extension == ".md" 
                  or (content_type == "application/octet-stream" and file_extension == ".md")):
                return await FileParserService._parse_markdown(file_path)
            elif (content_type == "text/plain" or file_extension == ".txt"
                  or (content_type == "application/octet-stream" and file_extension == ".txt")):
                return await FileParserService._parse_txt(file_path)
            elif (content_type in ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
                  or file_extension in [".csv", ".xlsx", ".xls"]):
                return await FileParserService._parse_excel_csv(file_path, content_type)
            else:
                raise ValueError(f"Unsupported file type: {content_type} (extension: {file_extension})")
                
        except Exception as e:
            raise Exception(f"Error parsing file: {str(e)}")
    
    @staticmethod
    async def _parse_pdf(file_path: str) -> str:
        """Parse PDF file and extract text with proper encoding handling using pdfplumber."""
        text = ""
        try:
            # Try pdfplumber first (better for complex layouts and Russian text)
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text and page_text.strip():
                            # Clean up text - remove excessive spaces but preserve structure
                            lines = page_text.split('\n')
                            cleaned_lines = []
                            for line in lines:
                                line = line.strip()
                                if line:
                                    # Remove excessive spaces within line but keep structure
                                    line = ' '.join(line.split())
                                    cleaned_lines.append(line)
                            
                            if cleaned_lines:
                                cleaned_text = '\n'.join(cleaned_lines)
                                text += f"{cleaned_text}\n\n"
                    except Exception as page_error:
                        print(f"Error extracting text from page {page_num + 1} with pdfplumber: {page_error}")
                        continue
                        
        except Exception as e:
            print(f"pdfplumber failed: {e}, trying PyPDF2...")
            # Fallback to PyPDF2 if pdfplumber fails
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PdfReader(file)
                    for page_num, page in enumerate(pdf_reader.pages):
                        try:
                            page_text = page.extract_text()
                            if page_text and page_text.strip():
                                # Clean up text - remove excessive spaces and fix encoding issues
                                cleaned_text = ' '.join(page_text.split())
                                text += f"{cleaned_text}\n\n"
                        except Exception as page_error:
                            print(f"Error extracting text from page {page_num + 1} with PyPDF2: {page_error}")
                            continue
            except Exception as fallback_error:
                raise Exception(f"Error parsing PDF with both libraries: pdfplumber: {str(e)}, PyPDF2: {str(fallback_error)}")
        
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
            
            # Convert dataframe to readable text - simple format for GPT
            text = f"Столбцы: {', '.join(df.columns.tolist())}\n\n"
            
            # Add all data in simple format
            text += df.to_string(index=False)
                
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
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/octet-stream"  # Added for files that might be misidentified
        ]
        
        supported_extensions = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".md", ".txt", ".csv", ".xlsx", ".xls"]
        
        file_ext = FileParserService.get_file_extension(filename)
        
        # Check if it's a supported content type or extension
        is_supported_content_type = content_type in supported_types
        is_supported_extension = file_ext in supported_extensions
        
        # Special case for application/octet-stream - check extension
        if content_type == "application/octet-stream":
            return is_supported_extension
        
        return is_supported_content_type or is_supported_extension