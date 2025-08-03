# Деплой на Vercel

## Настройка переменных окружения

### 1. Создайте файл .env.local в папке client:

```bash
# Для локальной разработки
NEXT_PUBLIC_SOCKETIO_URL=http://localhost:3002

# Для production (замените на ваш реальный URL сервера)
# NEXT_PUBLIC_SOCKETIO_URL=https://your-server-domain.com
```

### 2. Настройка в Vercel Dashboard:

1. Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в Settings → Environment Variables
4. Добавьте переменную:
   - **Name**: `NEXT_PUBLIC_SOCKETIO_URL`
   - **Value**: `https://your-server-domain.com` (замените на ваш реальный URL)
   - **Environment**: Production, Preview, Development

## Деплой

### Быстрый деплой через Vercel Dashboard:

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите ваш GitHub репозиторий
4. Выберите папку `client` как корневую директорию
5. Настройте переменные окружения (см. выше)
6. Нажмите "Deploy"

### Деплой через CLI:

```bash
cd client
npm install -g vercel
vercel
```

## Решение проблем

### Ошибка WS_ERR_INVALID_CLOSE_CODE (1002)

Эта ошибка возникает при проблемах с WebSocket протоколом. Решения:

1. **Проверьте URL сервера** - убедитесь, что сервер доступен и работает по HTTPS
2. **Настройте CORS** - убедитесь, что сервер разрешает подключения с Vercel
3. **Проверьте переменные окружения** - убедитесь, что `NEXT_PUBLIC_SOCKETIO_URL` правильно настроена

### Проверка подключения

1. Откройте Developer Tools в браузере
2. Перейдите на вкладку Network
3. Попробуйте подключиться к чату
4. Проверьте, что WebSocket соединение устанавливается

### Альтернативные решения

Если WebSocket не работает, попробуйте:

1. **Использовать только polling**:

   ```typescript
   // В client/src/hooks/useSocketIO.ts
   socket.current = io(socketUrl, {
     transports: ['polling'], // Только polling
     // ... остальные настройки
   })
   ```

2. **Проверить сервер**:

   ```bash
   # Убедитесь, что сервер работает
   curl https://your-server-domain.com/health
   ```

3. **Проверить CORS на сервере**:
   ```typescript
   // В src/socketio.ts
   cors: {
     origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
     credentials: true,
   }
   ```

## Тестирование

### Локальное тестирование:

```bash
# Запустите сервер
cd .. && npm run dev

# В другом терминале запустите клиент
cd client && npm run dev
```

### Тестирование WebSocket:

```bash
# В корневой папке проекта
npm run test:websocket
```

## Структура проекта

```
express-websocket/
├── src/                    # Серверная часть
│   ├── index.ts           # Express сервер
│   ├── socketio.ts        # Socket.IO обработчик
│   └── websocket.ts       # WebSocket сервер (отключен)
├── client/                # Клиентская часть
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useSocketIO.ts  # Socket.IO хук
│   │   └── app/
│   │       └── chat/
│   │           └── page.tsx     # Страница чата
│   └── .env.local         # Переменные окружения
└── test-websocket.js      # Тест WebSocket
```

## Полезные команды

```bash
# Запуск сервера
npm run dev

# Сборка сервера
npm run build

# Запуск клиента
cd client && npm run dev

# Тест WebSocket
npm run test:websocket

# Проверка здоровья сервера
curl http://localhost:3002/health
```
