# Развертывание клиента на Vercel

## 🚀 Быстрый старт

### 1. Подготовка проекта

Убедитесь, что у вас есть:
- Node.js 18+ 
- Git репозиторий с кодом
- Аккаунт на Vercel

### 2. Создание проекта на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите ваш Git репозиторий
4. Выберите папку `client` как корневую директорию

### 3. Настройка переменных окружения

В настройках проекта добавьте:

```env
NEXT_PUBLIC_SOCKETIO_URL=https://your-backend-domain.vercel.app
```

**Важно:** Замените `your-backend-domain.vercel.app` на реальный домен вашего backend сервера.

### 4. Настройка vercel.json

Убедитесь, что файл `vercel.json` содержит:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 5. Деплой

1. Нажмите "Deploy"
2. Дождитесь завершения сборки
3. Проверьте работу приложения

## 🔧 Локальная разработка

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Переменные окружения для разработки

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SOCKETIO_URL=http://localhost:3002
```

## 🐛 Исправленные проблемы

### 1. WebSocket ошибки
- Удален конфликтующий нативный WebSocket сервер
- Оставлен только Socket.IO для совместимости

### 2. CORS проблемы
- Улучшена конфигурация CORS в Socket.IO клиенте
- Добавлена поддержка polling как fallback

### 3. Обработка ошибок
- Добавлена обработка ошибок подключения
- Улучшена обратная связь для пользователя

## 📊 Проверка работы

### Локально
1. Запустите backend сервер: `npm run dev` (в корне проекта)
2. Запустите клиент: `cd client && npm run dev`
3. Откройте http://localhost:3000

### На Vercel
1. Проверьте переменные окружения
2. Убедитесь, что backend сервер развернут и доступен
3. Проверьте логи в Vercel Dashboard

## 🔍 Отладка

### Проверка подключения
Откройте DevTools и проверьте консоль на наличие ошибок подключения.

### Проверка переменных окружения
```javascript
console.log(process.env.NEXT_PUBLIC_SOCKETIO_URL)
```

### Логи Socket.IO
В консоли браузера должны быть логи:
- 🔗 Socket.IO connected
- 👤 User connected
- 💬 New message

## 📝 Структура проекта

```
client/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── chat/         # Страница чата
│   │   └── layout.tsx    # Основной layout
│   ├── hooks/            # React хуки
│   │   └── useSocketIO.ts
│   └── types/            # TypeScript типы
├── public/               # Статические файлы
├── package.json
├── vercel.json
└── .env.local           # Локальные переменные
```

## 🚨 Частые проблемы

### 1. "Failed to connect to chat server"
- Проверьте URL в `NEXT_PUBLIC_SOCKETIO_URL`
- Убедитесь, что backend сервер запущен
- Проверьте CORS настройки

### 2. "Socket.IO connection error"
- Проверьте доступность backend сервера
- Убедитесь, что порт 3002 открыт
- Проверьте логи backend сервера

### 3. "FOREIGN KEY constraint failed"
- Эта ошибка исправлена на backend
- Пересоздайте базу данных если проблема остается

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Проверьте консоль браузера
3. Убедитесь, что backend сервер работает
4. Проверьте переменные окружения
