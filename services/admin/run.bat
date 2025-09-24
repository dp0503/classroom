@echo off
python -m venv .venv
call .venv\Scripts\activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
if not exist manage.py (
    django-admin startproject adminpanel .
)
python manage.py migrate
python manage.py runserver 8000


