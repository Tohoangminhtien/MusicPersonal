from pydantic import BaseModel


class AddMusicModel(BaseModel):
    name: str
    url: str


class Music(BaseModel):
    stt: int
    name: str
    path: str
