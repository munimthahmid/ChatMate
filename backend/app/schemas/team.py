from pydantic import BaseModel, EmailStr

class TeamBase(BaseModel):
    id:int
    class Config:
        from_attributes = True


class TeamCreate(TeamBase):
    name:str