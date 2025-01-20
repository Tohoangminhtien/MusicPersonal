from fastapi import FastAPI, Request
from fastapi.requests import HTTPConnection
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from yt_dlp import YoutubeDL
from fastapi.templating import Jinja2Templates
from model.model import *
from typing import List
import os
from pathlib import Path


app = FastAPI()
templates = Jinja2Templates(directory='templates')
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def home_page(request: Request):
    return templates.TemplateResponse("home.html", {"request": request})


@app.get("/music", response_model=List[Music])
async def get_music():
    songs = os.listdir("data")
    songs_name = [s[:-4] for s in songs]
    songs_path = [f"data/{s}" for s in songs]
    songs_stt = range(1, len(songs)+1)

    music_list = []
    for s, n, p in zip(songs_stt, songs_name, songs_path):
        music_list.append(Music(stt=s, name=n, path=p))

    return music_list


@app.post("/music", response_class=JSONResponse)
async def add_music(model: AddMusicModel):
    if model.name and model.url:
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': f'data/{model.name}',
            'verbose': False,
            'ffmpeg_location': 'ffmpeg/bin'
        }
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([model.url])
            return JSONResponse({"message": "Successfully add music"})
    else:
        return JSONResponse({"message": "Fields 'name' and 'url' must not be empty"}, status_code=400)


@app.delete("/music", response_class=JSONResponse)
async def delete_music(model: DeleMusic):
    file_path = f"data/{model.name}.mp3"
    if os.path.exists(file_path):
        os.remove(file_path)
        return JSONResponse({"message": "Successfully add music"})
    else:
        return JSONResponse({"message": "File not exists"})
