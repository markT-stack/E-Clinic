FROM dunglas/frankenphp:php8.4-bookworm

# Install pdo_mysql extension
RUN install-php-extensions pdo pdo_mysql mysqli mbstring

# Copy all project files into the app directory
COPY . /app

EXPOSE 80