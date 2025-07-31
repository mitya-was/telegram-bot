# Деплой Telegram бота на Hetzner сервер

## 1. Підключення до сервера

### Через SSH ключ (рекомендовано):
```bash
ssh root@YOUR_SERVER_IP
```

### Через пароль:
```bash
ssh root@YOUR_SERVER_IP
# Введіть пароль
```

### Налаштування SSH ключа (якщо потрібно):
```bash
# Генеруємо ключ локально
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Копіюємо ключ на сервер
ssh-copy-id root@YOUR_SERVER_IP
```

## 2. Підготовка сервера

```bash
# Підключаємося до сервера
ssh root@YOUR_SERVER_IP

# Створюємо директорію для бота
mkdir -p /opt/telegram-bot
cd /opt/telegram-bot

# Перевіряємо чи є Docker та docker-compose
docker --version
docker-compose --version
```

## 3. Деплой бота

### Автоматичний деплой:
```bash
# Відредагуйте deploy.sh - встановіть YOUR_SERVER_IP
# Потім запустіть:
./deploy.sh
```

### Ручний деплой:
```bash
# 1. Копіюємо файли
scp -r ./* root@YOUR_SERVER_IP:/opt/telegram-bot/

# 2. Підключаємося до сервера
ssh root@YOUR_SERVER_IP

# 3. Переходимо в директорію
cd /opt/telegram-bot

# 4. Запускаємо бота
docker-compose up --build -d
```

## 4. Керування ботом на сервері

```bash
# Дивимось статус
docker-compose ps

# Дивимось логи
docker-compose logs -f telegram-bot

# Перезапуск
docker-compose restart telegram-bot

# Зупинка
docker-compose down

# Оновлення (після змін в коді)
docker-compose down
docker-compose up --build -d
```

## 5. Інтеграція з n8n

Бот буде використовувати ту ж мережу що й n8n, тому вони зможуть взаємодіяти.

### Перевірка мережі n8n:
```bash
docker network ls | grep n8n
```

### Якщо мережа називається інакше, змініть в docker-compose.yml:
```yaml
networks:
  default:
    external:
      name: ваша_мережа_n8n
```

## 6. Моніторинг

```bash
# Перевірка роботи бота
docker-compose logs telegram-bot | tail -50

# Перевірка ресурсів
docker stats was-contracts-bot

# Перевірка автозапуску
docker-compose ps
```