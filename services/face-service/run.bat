@echo off
python -m venv .venv
call .venv\Scripts\activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
uvicorn src.main:app --host 0.0.0.0 --port 5001


