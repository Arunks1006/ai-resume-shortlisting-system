import fitz  # PyMuPDF
import docx2txt
import io

def extract_text(file):
    """
    Extract text from PDF or DOCX files with improved error handling
    """
    try:
        if file.name.endswith(".pdf"):
            # Reset file pointer to beginning
            file.seek(0)
            file_bytes = file.read()
            
            # Open PDF from bytes
            pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text() + "\n"
            
            pdf_document.close()
            return text.strip()
            
        elif file.name.endswith(".docx"):
            # Reset file pointer to beginning
            file.seek(0)
            
            # Create a BytesIO object from the file
            file_bytes = io.BytesIO(file.read())
            text = docx2txt.process(file_bytes)
            return text.strip() if text else ""
            
    except Exception as e:
        print(f"Error extracting text from {file.name}: {str(e)}")
        return ""
    
    return ""
