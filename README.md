# Voyageur Travel Planner

Voyageur is a full-stack travel planning platform with a React frontend and a Django REST API backend. The React app handles all customer-facing UI, while Django exposes JSON endpoints, admin tooling, booking workflows, reviews, wishlist management, and PDF invoice generation.

## Architecture

- Frontend: React 18 + Vite + React Router
- Backend: Django 5 + Django REST Framework
- Auth: JWT via `djangorestframework-simplejwt`
- Database: MySQL
- Invoice rendering: Puppeteer + Node

## Repository Layout

```text
src/                  React application
travel_planner/       Django project configuration and API routing
users/                Auth, profile, wishlist, username suggestions
packages/             Destination/package catalog, import/balance commands
bookings/             Booking creation, listing, invoice download
reviews/              Review creation and listing
scripts/              Node-based invoice rendering
dist/                 Built React app served by Django
```

## Local Setup

### 1. Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

### 2. Node dependencies

```bash
npm install
```

### 3. MySQL configuration

Create a local MySQL database:

```sql
CREATE DATABASE travel_planner_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Environment variables used by Django:

```bash
export MYSQL_DATABASE=travel_planner_db
export MYSQL_USER=root
export MYSQL_PASSWORD=Rayman12
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
```

Optional environment variables:

```bash
export DJANGO_SECRET_KEY="replace-me"
export DJANGO_DEBUG=1
export DJANGO_ALLOWED_HOSTS="127.0.0.1,localhost"
export DJANGO_CORS_ALLOWED_ORIGINS="http://127.0.0.1:5173,http://localhost:5173"
export DJANGO_CSRF_TRUSTED_ORIGINS="http://127.0.0.1:5173,http://localhost:5173"
export VITE_API_BASE_URL="http://127.0.0.1:8000"
export VITE_UNSPLASH_ACCESS_KEY="your_unsplash_key"
```

## Running the Project

### Backend

```bash
python3 manage.py migrate
python3 manage.py runserver 127.0.0.1:8000
```

### Frontend development

```bash
npm run dev
```

### Frontend production build

```bash
npm run build
```

After `npm run build`, Django serves the generated SPA from `dist/`.

## Seed and Admin Utilities

Load the base travel dataset:

```bash
python3 manage.py import_travel_packages
python3 manage.py balance_package_categories
python3 manage.py seed_travel_planner
```

Bootstrap the superuser:

```bash
python3 manage.py bootstrap_superuser
```

## API Endpoints

### Authentication

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `GET /api/profile/`
- `PUT /api/profile/update/`
- `GET /api/username-suggestions/`

### Catalog

- `GET /api/packages/`
- `GET /api/packages/<id>/`

### Wishlist

- `GET /api/wishlist/`
- `POST /api/wishlist/add/`
- `DELETE /api/wishlist/remove/`

### Bookings

- `POST /api/book/`
- `GET /api/bookings/`
- `GET /api/invoice/<booking_id>/`

### Reviews

- `GET /api/reviews/`
- `POST /api/reviews/`

## Production Notes

- `DEBUG` now defaults to `False`
- add real hosts to `DJANGO_ALLOWED_HOSTS`
- run `npm run build` before deploying Django
- run `python3 manage.py collectstatic` for admin static assets
- `Procfile` is included for `gunicorn`
- secure cookie flags activate automatically when `DEBUG=0`

## Validation Commands

```bash
python3 manage.py check
python3 manage.py test
npm run build
```

## Project Audit

Detailed file-by-file documentation lives in [PROJECT_AUDIT.md](/Users/manaazirrayyaan/Documents/Django%20Project/Travel%20Planner/PROJECT_AUDIT.md).
