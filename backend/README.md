# Backend - Business MVP

FastAPI backend для Business MVP.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
```

2. Активируйте виртуальное окружение:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Установите зависимости:
```bash
pip install -r requirements.txt
```

## Запуск

```bash
uvicorn main:app --reload
```

API будет доступно по адресу: http://localhost:8000

Документация API: http://localhost:8000/docs

## Структура проекта

- `models.py` - SQLAlchemy модели
- `schemas.py` - Pydantic схемы
- `database.py` - Настройка базы данных
- `auth.py` - Аутентификация и авторизация
- `routers/` - API роутеры
  - `auth.py` - Аутентификация
  - `customer.py` - API для покупателей
  - `partner.py` - API для партнеров
  - `websocket.py` - WebSocket для real-time
- `main.py` - Главный файл приложения

## База данных

По умолчанию используется SQLite. Таблицы создаются автоматически при первом запуске.

Для использования PostgreSQL измените `DATABASE_URL` в `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
```

