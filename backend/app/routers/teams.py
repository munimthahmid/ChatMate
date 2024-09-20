from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.team import TeamCreate,TeamBase
from app.crud.team import create_team
from app.dependencies import get_db
from app.dependencies import get_current_user
from app.schemas.user import User
from app.models.team import Team
from typing import List

router = APIRouter(
    prefix="/teams",
    tags=["Teams"],
)

@router.post("/", response_model=TeamCreate)
def create_new_team(team: TeamCreate, db: Session = Depends(get_db)):
  
    return create_team(db=db, team=team)

@router.get("/names", response_model=List[str])
def get_all_team_names(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teams = db.query(Team).all()
    team_names = [team.name for team in teams]
    return team_names