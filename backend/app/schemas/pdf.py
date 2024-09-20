# app/schemas/pdf.py

from pydantic import BaseModel

class PDFFile(BaseModel):
    name: str
    url: str
