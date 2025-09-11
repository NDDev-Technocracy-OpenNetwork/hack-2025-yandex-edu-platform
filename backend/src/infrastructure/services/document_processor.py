import io
from typing import Literal
from ...domain.services import DocumentProcessingService

try:
    import PyPDF2
    from docx import Document
except ImportError:
    PyPDF2 = None
    Document = None

FileType = Literal["pdf", "docx", "txt", "md"]


class DocumentProcessor(DocumentProcessingService):
    async def extract_text(self, file_content: bytes, file_type: FileType) -> str:
        if file_type == "txt":
            return file_content.decode('utf-8')
        
        elif file_type == "md":
            return file_content.decode('utf-8')
        
        elif file_type == "pdf":
            return await self._extract_pdf_text(file_content)
        
        elif file_type == "docx":
            return await self._extract_docx_text(file_content)
        
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    async def _extract_pdf_text(self, file_content: bytes) -> str:
        if PyPDF2 is None:
            raise ImportError("PyPDF2 is required for PDF processing")
        
        text = ""
        pdf_file = io.BytesIO(file_content)
        
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")
        
        return text.strip()

    async def _extract_docx_text(self, file_content: bytes) -> str:
        if Document is None:
            raise ImportError("python-docx is required for DOCX processing")
        
        text = ""
        docx_file = io.BytesIO(file_content)
        
        try:
            doc = Document(docx_file)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            raise ValueError(f"Failed to extract text from DOCX: {str(e)}")
        
        return text.strip()

    async def validate_document(self, text_content: str) -> bool:
        # Check if document has enough content
        if not text_content or len(text_content.strip()) < 100:
            return False
        
        # Check for minimum word count
        words = text_content.split()
        if len(words) < 50:
            return False
        
        return True