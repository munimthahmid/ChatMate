# app/routers/team_pdfs.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models.team import Team
from app.schemas.user import User
import os
import base64

router = APIRouter(
    prefix="/team-pdfs",
    tags=["Team PDFs"],
)

TEAM_PDFS_DIR = "team_pdfs"

def get_team_pdf_directory(team_id: int):
    return os.path.join(TEAM_PDFS_DIR, f"team_{team_id}")

@router.get("/", response_model=List[dict])
def get_pdfs_by_team_name(
    team_name: str = Query(..., description="Name of the team"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get the team by name
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    # Access Control: Only allow if user is a member of the team
   

    team_dir = get_team_pdf_directory(team.id)
    if not os.path.exists(team_dir):
        return []

    pdf_files = [f for f in os.listdir(team_dir) if f.endswith('.pdf')]

    pdf_list = []
    for filename in pdf_files:
        file_path = os.path.join(team_dir, filename)
        with open(file_path, "rb") as f:
            pdf_content = f.read()
            encoded_pdf = base64.b64encode(pdf_content).decode('utf-8')
            pdf_list.append({
                "name": filename,
                "content": encoded_pdf
            })

    return pdf_list
