# Використовуємо офіційний Node.js образ
FROM node:18-alpine

# Встановлюємо робочу директорію
WORKDIR /app

# Копіюємо package.json та package-lock.json (якщо є)
COPY package*.json ./

# Встановлюємо залежності
RUN npm install --only=production

# Копіюємо всі файли програми
COPY . .

# Вказуємо порт (необов'язково для бота)
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "start"]