require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

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

// Обробник команди /time
bot.onText(/\/time/, (msg) => {
    console.log('Отримано команду /time від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    const now = new Date();
    const timeOptions = {
        timeZone: 'Europe/Kiev',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    const timeString = now.toLocaleDateString('uk-UA', timeOptions);
    
    bot.sendMessage(chatId, `🕐 Поточний час: ${timeString}`)
        .then(() => console.log('Відповідь на /time надіслано'))
        .catch(err => console.error('Помилка надсилання /time:', err));
});

// Обробник команди /joke
bot.onText(/\/joke/, (msg) => {
    console.log('Отримано команду /joke від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    
    const jokes = [
        "Чому програмісти не люблять природу? Там забагато багів! 🐛",
        "Як називається собака програміста? Коли-кодер! 🐕",
        "Чому JavaScript розплакався? Бо його зрозуміти неможливо! 😢",
        "Скільки програмістів потрібно, щоб вкрутити лампочку? Жодного - це апаратна проблема! 💡",
        "Що сказав HTML, коли побачив CSS? Ти мене красиво оформляєш! 💅"
    ];
    
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    
    bot.sendMessage(chatId, `😄 ${randomJoke}`)
        .then(() => console.log('Відповідь на /joke надіслано'))
        .catch(err => console.error('Помилка надсилання /joke:', err));
});

// Обробник команди /calc
bot.onText(/\/calc (.+)/, (msg, match) => {
    console.log('Отримано команду /calc від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    const expression = match[1];
    
    try {
        // Безпечне обчислення тільки базових операцій
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        if (sanitized !== expression) {
            throw new Error('Недозволені символи');
        }
        
        const result = eval(sanitized);
        bot.sendMessage(chatId, `🧮 ${expression} = ${result}`)
            .then(() => console.log('Відповідь на /calc надіслано'))
            .catch(err => console.error('Помилка надсилання /calc:', err));
    } catch (error) {
        bot.sendMessage(chatId, '❌ Помилка в обчисленні. Використовуйте тільки числа та операції +, -, *, /, ()')
            .then(() => console.log('Помилка calc надіслано'))
            .catch(err => console.error('Помилка надсилання помилки calc:', err));
    }
});

// Обробник команди /weather
bot.onText(/\/weather(.*)/, async (msg, match) => {
    console.log('Отримано команду /weather від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    const city = match[1] ? match[1].trim() : 'Київ';
    
    try {
        // Використовуємо безкоштовний API OpenWeatherMap
        // Замініть YOUR_API_KEY на справжній ключ з openweathermap.org
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: process.env.WEATHER_API_KEY || 'demo_key',
                units: 'metric',
                lang: 'uk'
            }
        });
        
        const weather = response.data;
        const temp = Math.round(weather.main.temp);
        const feelsLike = Math.round(weather.main.feels_like);
        const description = weather.weather[0].description;
        const humidity = weather.main.humidity;
        const windSpeed = weather.wind.speed;
        
        const weatherText = `🌤️ Погода в місті ${weather.name}:
        
🌡️ Температура: ${temp}°C (відчувається як ${feelsLike}°C)
📝 Опис: ${description}
💧 Вологість: ${humidity}%
💨 Вітер: ${windSpeed} м/с`;
        
        bot.sendMessage(chatId, weatherText)
            .then(() => console.log('Відповідь на /weather надіслано'))
            .catch(err => console.error('Помилка надсилання /weather:', err));
            
    } catch (error) {
        console.error('Помилка отримання погоди:', error.message);
        
        let errorMessage = '❌ Не вдалося отримати дані про погоду.';
        
        if (process.env.WEATHER_API_KEY === 'demo_key' || !process.env.WEATHER_API_KEY) {
            errorMessage = `❌ Для роботи з погодою потрібен API ключ від OpenWeatherMap.

📝 Інструкція:
1. Зареєструйтеся на openweathermap.org
2. Отримайте безкоштовний API ключ
3. Додайте WEATHER_API_KEY=ваш_ключ до .env файлу

🎯 Поки що можете використовувати інші команди бота!`;
        } else if (error.response && error.response.status === 404) {
            errorMessage = `❌ Місто "${city}" не знайдено. Спробуйте іншу назву.`;
        }
        
        bot.sendMessage(chatId, errorMessage)
            .then(() => console.log('Помилка weather надіслано'))
            .catch(err => console.error('Помилка надсилання помилки weather:', err));
    }
});

// Обробник команди /help
bot.onText(/\/help/, (msg) => {
    console.log('Отримано команду /help від:', msg.from.username || msg.from.first_name);
    const chatId = msg.chat.id;
    
    const inlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🕐 Час', callback_data: 'time' },
                    { text: '😄 Жарт', callback_data: 'joke' }
                ],
                [
                    { text: '🧮 Калькулятор', callback_data: 'calc_help' },
                    { text: '🌤️ Погода', callback_data: 'weather_help' }
                ]
            ]
        }
    };
    
    const helpText = `
🤖 Доступні команди:

/start - почати роботу з ботом
/help - показати це повідомлення
/time - показати поточний час
/joke - отримати випадковий жарт
/calc <вираз> - калькулятор (наприклад: /calc 2+2)
/weather [місто] - погода (наприклад: /weather Львів)

Також ви можете використовувати кнопки нижче:
    `;
    
    bot.sendMessage(chatId, helpText, inlineKeyboard)
        .then(() => console.log('Відповідь на /help надіслано'))
        .catch(err => console.error('Помилка надсилання /help:', err));
});

// Обробник callback-ів від inline кнопок
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    
    console.log('Отримано callback:', data, 'від:', callbackQuery.from.username || callbackQuery.from.first_name);
    
    switch (data) {
        case 'time':
            const now = new Date();
            const timeOptions = {
                timeZone: 'Europe/Kiev',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            const timeString = now.toLocaleDateString('uk-UA', timeOptions);
            bot.editMessageText(`🕐 Поточний час: ${timeString}`, {
                chat_id: chatId,
                message_id: msg.message_id
            });
            break;
            
        case 'joke':
            const jokes = [
                "Чому програмісти не люблять природу? Там забагато багів! 🐛",
                "Як називається собака програміста? Коли-кодер! 🐕",
                "Чому JavaScript розплакався? Бо його зрозуміти неможливо! 😢",
                "Скільки програмістів потрібно, щоб вкрутити лампочку? Жодного - це апаратна проблема! 💡",
                "Що сказав HTML, коли побачив CSS? Ти мене красиво оформляєш! 💅"
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            bot.editMessageText(`😄 ${randomJoke}`, {
                chat_id: chatId,
                message_id: msg.message_id
            });
            break;
            
        case 'calc_help':
            bot.editMessageText(`🧮 Калькулятор
            
Використання: /calc <вираз>
Приклади:
• /calc 2+2
• /calc 10*5-3
• /calc (15+5)/4

Підтримувані операції: +, -, *, /, ()`, {
                chat_id: chatId,
                message_id: msg.message_id
            });
            break;
            
        case 'weather_help':
            bot.editMessageText(`🌤️ Погода

Використання: /weather [назва міста]
Приклади:
• /weather - погода в Києві
• /weather Львів
• /weather London

💡 Для роботи потрібен API ключ від openweathermap.org`, {
                chat_id: chatId,
                message_id: msg.message_id
            });
            break;
    }
    
    // Підтверджуємо отримання callback
    bot.answerCallbackQuery(callbackQuery.id);
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