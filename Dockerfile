# syntax=docker/dockerfile:1

FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./

RUN pip install --upgrade pip && \
    pip wheel --wheel-dir /wheels -r requirements.txt


FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev && \
    rm -rf /var/lib/apt/lists/* && \
    python -m venv /opt/venv

COPY requirements.txt ./
COPY --from=builder /wheels /wheels

RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt

COPY . .

EXPOSE 8000

FROM base AS development

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


FROM base AS production

COPY docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
