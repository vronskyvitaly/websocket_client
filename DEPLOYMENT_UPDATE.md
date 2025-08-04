# Обновление клиента для работы с Vercel сервером

## ✅ Что уже сделано:

1. **Обновлен локальный .env.local**:
   ```
   NEXT_PUBLIC_SOCKETIO_URL=https://websocket-server-khaki.vercel.app
   ```

## 🔧 Следующие шаги:

### 1. Обновить переменные окружения на Vercel для клиента:

Зайдите в [Vercel Dashboard](https://vercel.com/dashboard) для вашего клиента и добавьте переменную окружения:

**Переменная окружения:**

```
NEXT_PUBLIC_SOCKETIO_URL=https://websocket-server-khaki.vercel.app
```

### 2. Перезапустить клиент локально для тестирования:

```bash
cd client
npm run dev
```

### 3. Проверить подключение:

1. Откройте http://localhost:3000
2. Попробуйте подключиться к чату
3. Проверьте, что сообщения отправляются и получаются

### 4. Деплой клиента на Vercel:

```bash
# Если используете Vercel CLI
vercel --prod

# Или через GitHub (автоматический деплой)
git add .
git commit -m "Update server URL to Vercel"
git push
```

## 🔍 Проверка работы:

### Локально:

- Клиент: http://localhost:3000
- Сервер: https://websocket-server-khaki.vercel.app

### Продакшн:

- Клиент: https://websocket-client-eight.vercel.app/
- Сервер: https://websocket-server-khaki.vercel.app/

## 🚨 Возможные проблемы:

### 1. CORS ошибки:

Убедитесь, что в настройках сервера на Vercel добавлена переменная:

```
CORS_ORIGIN=https://websocket-client-eight.vercel.app
```

### 2. WebSocket подключение не работает:

Проверьте, что сервер поддерживает WebSocket на Vercel. Возможно, нужно использовать Socket.IO с polling fallback.

### 3. Переменные окружения не обновились:

- Перезапустите клиент локально
- Передеплойте клиент на Vercel
- Проверьте переменные окружения в Vercel Dashboard

## 📝 Структура URL:

```
Клиент (Next.js):
├── Локально: http://localhost:3000
└── Продакшн: https://websocket-client-eight.vercel.app/

Сервер (Express.js):
├── Локально: http://localhost:3002
└── Продакшн: https://websocket-server-khaki.vercel.app/
```

## ✅ Проверка подключения:

1. Откройте консоль браузера
2. Подключитесь к чату
3. Проверьте логи:
   - ✅ "🔗 Socket.IO connected"
   - ✅ "👤 User connected: {userId, username}"
   - ❌ "❌ Socket.IO connection error" (если есть проблемы)
