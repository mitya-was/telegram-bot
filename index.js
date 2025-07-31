require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Токен бота з .env файлу
const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN не встановлено');
    process.exit(1);
}

// Створюємо бота
const bot = new TelegramBot(token, { polling: true });

// Додаємо обробку помилок
bot.on('polling_error', (error) => {
    console.error('Помилка polling:', error);
});

bot.on('error', (error) => {
    console.error('Помилка бота:', error);
});

console.log('Бот підключений успішно! Username:', bot.options.username || 'невизначено');

// Обробник команди /start
bot.onText(/\/start/, (msg) => {
    console.log('Отримано команду /start від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привіт! Я Telegram бот. Як справи?')
        .then(() => console.log('Відповідь на /start надіслано'))
        .catch(err => console.error('Помилка надсилання /start:', err));
});

// Обробник команди /help
bot.onText(/\/help/, (msg) => {
    console.log('Отримано команду /help від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    const helpText = `
Доступні команди:
/start - почати роботу з ботом
/help - показати це повідомлення
    `;
    bot.sendMessage(chatId, helpText)
        .then(() => console.log('Відповідь на /help надіслано'))
        .catch(err => console.error('Помилка надсилання /help:', err));
});

// Обробник всіх повідомлень
bot.on('message', (msg) => {
    console.log('Отримано повідомлення:', {
        from: msg.from.username || msg.from.first_name,
        text: msg.text,
        chat_id: msg.chat.id
    });
    
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Ігноруємо команди (вони обробляються окремо)
    if (messageText && messageText.startsWith('/')) {
        return;
    }

    // Відповідаємо на звичайні повідомлення
    bot.sendMessage(chatId, `Ви написали: ${messageText}`)
        .then(() => console.log('Відповідь надіслано'))
        .catch(err => console.error('Помилка надсилання відповіді:', err));
});

console.log('Бот запущено...');