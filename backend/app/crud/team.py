from app.models.team import Team as TeamModel
from sqlalchemy.orm import Session
from app.schemas.team import TeamCreate

def create_team(db: Session, team: TeamCreate):
    db_user = TeamModel(
        name=team.name,
        id=team.id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def get_team_name_by_id(db: Session, team_id: int):
    team = db.query(TeamModel.name).filter(TeamModel.id == team_id).first()
    return team.name if team else None
