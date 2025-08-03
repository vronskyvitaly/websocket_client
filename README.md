# Chat Client

Next.js клиент для чат-приложения с WebSocket поддержкой.

## Разработка

### 1. Запуск сервера (из корневой папки проекта)
```bash
# Установка зависимостей
npm install

# Сборка TypeScript
npm run build

# Запуск сервера
npm run dev
```

Сервер будет доступен на порту 3002: http://localhost:3002

### 2. Запуск клиента
```bash
cd client
npm install
npm run dev
```

Клиент будет доступен по адресу [http://localhost:3000](http://localhost:3000).

### 3. Тестирование
1. Откройте http://localhost:3000/chat
2. Введите имя пользователя
3. Начните общение в чате

## Деплой на Vercel

### Быстрый деплой

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите ваш репозиторий
4. Выберите папку `client` как корневую директорию
5. Добавьте переменную окружения:
   ```
   NEXT_PUBLIC_SOCKETIO_URL=https://your-backend-domain.com
   ```

### Деплой через CLI

```bash
cd client
npm install -g vercel
vercel
```

## Переменные окружения

- `NEXT_PUBLIC_SOCKETIO_URL` - URL вашего WebSocket сервера

## Сборка

```bash
npm run build
```

## Технологии

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Lucide React (иконки)
