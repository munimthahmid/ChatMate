from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Establish a relationship to the User model
    members = relationship("User", back_populates="team", cascade="all, delete")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}')>"