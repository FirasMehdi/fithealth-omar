# --- Stage 1: build frontend assets (Inertia/React/Vite) ---
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: PHP application ---
FROM php:8.3-cli-bookworm
WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev libzip-dev libonig-dev unzip git \
    && docker-php-ext-install pdo_pgsql pgsql zip mbstring bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader

COPY . .
COPY --from=frontend /app/public/build ./public/build

RUN php artisan package:discover --ansi \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

# Config/route caching and migrations need real env vars, which Render only
# injects at container runtime (not during `docker build`) — so this has to
# run here in CMD, not as a RUN step above.
CMD php artisan config:cache \
    && php artisan route:cache \
    && php artisan migrate --force \
    && php artisan app:seed-if-empty \
    && php artisan serve --host 0.0.0.0 --port ${PORT:-10000}
