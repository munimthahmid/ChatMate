from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Foreign key to the Team model
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    @property
    def team_name(self):
        return self.team.name
    # Establish a relationship to the Team model
    team = relationship("Team", back_populates="members")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', team_id={self.team_id})>"
