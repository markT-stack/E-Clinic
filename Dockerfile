FROM dunglas/frankenphp:php8.4-bookworm

# Install pdo_mysql and other required extensions
RUN install-php-extensions \
    pdo \
    pdo_mysql \
    mysqli \
    mbstring

COPY . /app

EXPOSE 80