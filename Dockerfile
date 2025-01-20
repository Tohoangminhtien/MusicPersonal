FROM python:3.9.21-slim

WORKDIR /src
COPY . .

RUN apt-get update
RUN apt-get install -y ffmpeg
RUN pip install -r requirement.txt

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
