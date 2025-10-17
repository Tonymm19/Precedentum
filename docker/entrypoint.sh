#!/bin/sh
set -e

python manage.py collectstatic --noinput --settings=config.settings.production

exec "$@"
