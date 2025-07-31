#!/bin/bash

# Скрипт для деплою бота на Hetzner сервер
set -e

# Змінні
SERVER_IP="YOUR_SERVER_IP"
SERVER_USER="root"
BOT_DIR="/opt/telegram-bot"

echo "🚀 Починаємо деплой бота на сервер..."

# 1. Копіюємо файли на сервер
echo "📁 Копіюємо файли..."
rsync -avz --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'logs' \
  ./ ${SERVER_USER}@${SERVER_IP}:${BOT_DIR}/

# 2. Підключаємося до сервера і запускаємо
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/telegram-bot

# Створюємо директорію для логів
mkdir -p logs

# Зупиняємо старий контейнер якщо є
docker-compose down || true

# Будуємо і запускаємо новий
docker-compose up --build -d

# Показуємо статус
docker-compose ps

# Показуємо логи
docker-compose logs -f --tail=50
EOF

echo "✅ Деплой завершено!"