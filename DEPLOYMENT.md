# Deployment Guide

This document describes how to deploy the Precedentum deadline & reminder application to a production environment.

## 1. Architecture Overview

- **Backend**: Django + Gunicorn container, uses Postgres for persistence and Redis for caching/sessions.
- **Frontend**: React/Vite static bundle served via Nginx container.
- **Services**: Postgres 16, Redis 7.
- **CI/CD**: GitHub Actions builds and tests application on each push. Deployment workflow builds and pushes backend/frontend images to GitHub Container Registry (GHCR).

## 2. Prerequisites

- Docker and Docker Compose installed locally for validation.
- Access to a container registry (default configuration uses `ghcr.io`).
- Infrastructure capable of running Docker containers (Kubernetes, ECS, Fly.io, Docker Swarm, etc.).
- Domain and TLS termination in front of the containers (e.g., via load balancer or Traefik).

## 3. Environment Variables

Create a production `.env` file (see `.env.production.example` for a template) based on the following variables:

```
DJANGO_SECRET_KEY=<secure-random-string>
DEBUG=False
ALLOWED_HOSTS=app.example.com
POSTGRES_DB=precedentum
POSTGRES_USER=precedentum
POSTGRES_PASSWORD=<postgres-password>
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_CONN_MAX_AGE=600
REDIS_URL=redis://redis:6379/1
CSRF_TRUSTED_ORIGINS=https://app.example.com
JWT_ACCESS_MINUTES=30
JWT_REFRESH_DAYS=7
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

Store the `.env` file securely (never commit to git). In CI, configure these values as secrets.

## 4. Local Verification (Optional)

1. Build images: `docker-compose -f docker-compose.prod.yml build`
2. Run stack: `docker-compose -f docker-compose.prod.yml up`
3. Access frontend at `http://localhost:3000`
4. Confirm backend health at `http://localhost:8000/admin/` (requires creating a superuser inside the container).
5. Static assets are collected automatically on container start via the backend entrypoint; if you need to pre-build them, run `python manage.py collectstatic --noinput --settings=config.settings.production`.

## 5. CI/CD Pipelines

- **CI (`.github/workflows/ci.yml`)**
  - Runs backend tests with Postgres/Redis services.
  - Executes `python manage.py test` using production settings.
  - Builds frontend after linting.

- **Deploy (`.github/workflows/deploy.yml`)**
  - Manual trigger via workflow dispatch with `environment` input (`staging` or `production`).
  - Builds backend and frontend images, tags them with the git SHA and environment, and pushes to `ghcr.io/<owner>/<repo>-backend` / `-frontend`.
  - Uploads metadata files (`deploy/backend-image.txt`, `deploy/frontend-image.txt`) containing pushed image tags.

### Configure GitHub Secrets

| Secret | Description |
| --- | --- |
| `POSTGRES_PASSWORD` | Database password reused across CI and deploy pipelines. |
| `DJANGO_SECRET_KEY` | Production secret key. |
| `REGISTRY_USERNAME` (optional) | If using a registry other than GHCR. |
| `REGISTRY_PASSWORD` (optional) | If using a registry other than GHCR. |
| `PRODUCTION_ENV_FILE` | (Optional) Base64 encoded production `.env` to be provided to deployment target. |

## 6. Deploying to Hosting Platform

1. Ensure target environment (Kubernetes cluster, Docker host, etc.) has access to the images pushed to registry.
2. Pull images using tags generated in the deploy workflow artifacts.
3. Provision Postgres and Redis services (managed offerings recommended). Update environment variables to point to their endpoints.
4. Configure persistent storage for Postgres.
5. Run migrations: `python manage.py migrate --settings=config.settings.production` inside the backend container.
6. Seed data if required: `python manage.py seed_demo_data --settings=config.settings.production`.
7. Start backend container (gunicorn) with environment variables mounted.
8. Start frontend container (Nginx).
9. Configure load balancer / ingress:
   - Route `https://app.example.com` to frontend container port 3000.
   - Ensure backend API requests `/api/v1/` are proxied correctly (frontend expects backend at `/api/v1/`).
   - Terminate TLS at edge and forward `X-Forwarded-Proto` header.

## 7. Rollback Strategy

- Retain previous container tags (e.g., `ghcr.io/...:production`).
- To rollback:
  1. Re-deploy infrastructure pointing to previous image tag.
  2. Restore database snapshot if schema/data changed. Utilize regular backups.

## 8. Monitoring & Maintenance

- Configure logging aggregation for backend (Gunicorn stdout/stderr) and frontend (Nginx access logs).
- Monitor database connections and performance.
- Add health checks for containers (Gunicorn `/admin/login`, Nginx `/`).
- Schedule periodic backups for Postgres.
- Rotate secrets regularly.

## 9. Future Enhancements

- Integrate infrastructure-as-code (Terraform, Pulumi).
- Add automated deployment triggers on `main` branch merges with approval gates.
- Integrate application performance monitoring (New Relic, Sentry, etc.).
- Implement blue/green or rolling deployments for zero-downtime releases.
