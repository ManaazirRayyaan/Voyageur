# Travel Planner Django Backend

This project converts the existing static travel frontend into a functional Django application with reusable templates, authentication, booking flows, reviews, dashboard pages, and MySQL-ready configuration.

## Stack

- Django 5.2.11
- MySQL via `mysqlclient`
- Django ORM
- Django built-in authentication
- Django templates + staticfiles

## Install

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

If `mysqlclient` fails to build on macOS, install MySQL client libraries first, or swap to `PyMySQL` if that matches your environment.

## Database configuration

The settings file supports two modes:

- `USE_SQLITE=1` for local bootstrapping and quick checks
- `USE_SQLITE=0` for MySQL

MySQL settings are configured in `travel_planner/settings.py` with these defaults:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "travel_planner_db",
        "USER": "root",
        "PASSWORD": "Rayman12",
        "HOST": "localhost",
        "PORT": "3306",
    }
}
```

Override them with environment variables:

```bash
export USE_SQLITE=0
export MYSQL_DATABASE=travel_planner_db
export MYSQL_USER=root
export MYSQL_PASSWORD=Rayman12
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
```

Alternative driver:

```bash
python3 -m pip install pymysql
```

Then in `travel_planner/__init__.py`:

```python
import pymysql
pymysql.install_as_MySQLdb()
```

## Run

```bash
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser
python3 manage.py runserver
```

## Seed demo data

```bash
python3 manage.py seed_travel_planner
```

## App structure

- `users`: registration, login, logout, profile management
- `packages`: destinations, packages, hotels, transports, catalog views
- `bookings`: package bookings, custom trip bookings, confirmation flow
- `reviews`: authenticated review submission and listing
- `dashboard`: homepage and signed-in dashboard

## Notes

- Existing frontend styles/scripts are served through Django staticfiles from `assets/`.
- Uploaded media such as profile and destination images are served from `media/` in debug mode.
- Password reset is wired with Django auth views and uses the console email backend by default in local development.
