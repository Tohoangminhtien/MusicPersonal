import streamlit as st
from yt_dlp import YoutubeDL
import os

st.set_page_config(page_title="Music Personal",
                   page_icon="🎵", layout="centered")

with st.sidebar:
    st.title("Add your favorite music 🎼")
    with st.expander("Youtube Video URL"):
        name = st.text_input("Enter music name:", autocomplete="off", key="a")
        url = st.text_input("Enter URL", autocomplete="off")

    with st.expander("MP3 File"):
        name_file = st.text_input(
            "Enter music name:", autocomplete="off", key="b")
        file = st.file_uploader("Select file .mp3", type=["mp3"])

    button = st.button("Click")
    if button:
        if name and url:
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': f'data/{name}',
                'verbose': False,
                'ffmpeg_location': 'ffmpeg/bin'
            }
            with YoutubeDL(ydl_opts) as ydl:
                video_info = ydl.extract_info(url, download=False)
                print(f"Đang tải: {video_info['title']}")
                ydl.download([url])
                st.rerun()

        if name_file and file:
            st.error("Comming soon!")


count = 1
songs = list()
for file in os.listdir('data'):
    songs.append({"stt": count, "name": file[:-4], "file": f"data/{file}"})
    count += 1


player_container = st.empty()
st.write("### Danh sách bài hát:")
for song in songs:
    col1, col2, col3 = st.columns([1, 4, 2])  # Chia layout thành 3 cột
    with col1:
        st.write(song["stt"])  # Cột STT
    with col2:
        st.write(song["name"])  # Cột Tên bài hát
    with col3:
        if st.button("Play", key=song["stt"]):
            with player_container:
                st.write(f"**Đang phát:** {song['name']}")
                st.audio(song["file"], format="audio/mp3")
