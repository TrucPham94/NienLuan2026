# Các câu lệnh thường dùng

venv\Scripts\activate
pip freeze > requirements.txt

# Tạo project và app

django-admin startproject hrm_backend .
python manage.py startapp accounts
python manage.py startapp employees
python manage.py startapp departments
python manage.py startapp contracts
python manage.py startapp salaries
python manage.py startapp reports

# Migrate

python manage.py makemigrations
python manage.py migrate

# Tạo tài khoản admin

python manage.py createsuperuser

# Chạy backend

python manage.py runserver
