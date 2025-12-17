# Business MVP

Полноценный веб-сайт для заказа еды и товаров с функционалом для покупателей и партнеров (заведений).

## Технологии

- **Frontend**: React, React Router, Leaflet (карты), Vite
- **Backend**: FastAPI, SQLAlchemy, WebSocket (real-time обновления)
- **База данных**: SQLite (по умолчанию)

## Установка и запуск

### Backend

1. Перейдите в папку backend:
```bash
cd backend
```

2. Создайте виртуальное окружение:
```bash
python -m venv venv
```

3. Активируйте виртуальное окружение:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

4. Установите зависимости:
```bash
pip install -r requirements.txt
```

5. Создайте файл `.env` (опционально):
```
DATABASE_URL=sqlite:///./business_mvp.db
SECRET_KEY=your-secret-key-change-in-production
```

6. Запустите сервер:
```bash
uvicorn main:app --reload
```

Backend будет доступен по адресу: http://localhost:8000

### Frontend

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev-сервер:
```bash
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

## Функционал

### Для покупателей

- Главная страница с акциями и товарами
- Просмотр всех акций
- Интерактивная карта заведений
- Корзина и оформление заказов
- Профиль с историей заказов
- Страница "Как это работает"

### Для партнеров

- Управление заказами (статусы: в очереди, в процессе, готов)
- Создание, редактирование и удаление товаров
- Создание и управление акциями
- Статистика заведений
- Редактирование профиля
- Регистрация заведения на карте

## Особенности

- Real-time обновление статусов заказов через WebSocket
- Интеграция с реальной картой (OpenStreetMap/Leaflet)
- QR-коды для заказов
- Разделение интерфейсов для покупателей и партнеров
- Современный дизайн с заданной цветовой палитрой

## Цветовая палитра

- Основной фон: белый
- Шрифт: черный, большой
- Дополнительные цвета:
  - #54F094 (основной)
  - #54E3F0
  - #54F0C9
  - #54F05F
  - #54B2F0
  - #A4F0DD

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `POST /api/auth/register-partner` - Регистрация партнера

### Покупатели
- `GET /api/customer/partners` - Список заведений
- `GET /api/customer/products` - Список товаров
- `GET /api/customer/promotions` - Список акций
- `POST /api/customer/orders` - Создать заказ
- `GET /api/customer/orders` - Мои заказы

### Партнеры
- `GET /api/partner/profile` - Профиль партнера
- `PUT /api/partner/profile` - Обновить профиль
- `GET /api/partner/orders` - Заказы партнера
- `PUT /api/partner/orders/{id}` - Обновить статус заказа
- `GET /api/partner/products` - Товары партнера
- `POST /api/partner/products` - Создать товар
- `GET /api/partner/promotions` - Акции партнера
- `POST /api/partner/promotions` - Создать акцию
- `GET /api/partner/statistics` - Статистика

### WebSocket
- `WS /api/ws/orders/{user_id}` - Real-time обновления заказов

