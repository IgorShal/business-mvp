# Быстрый старт

## Запуск проекта

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend будет доступен на http://localhost:8000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на http://localhost:3000

## Первые шаги

1. Откройте http://localhost:3000
2. Зарегистрируйтесь как покупатель или партнер
3. Если вы партнер, после регистрации выберите местоположение на карте
4. Начните использовать систему!

## Тестовые данные

После первого запуска база данных будет пустой. Вы можете:
- Создать аккаунт партнера и добавить товары/акции
- Создать аккаунт покупателя и делать заказы

## API Документация

После запуска backend, документация доступна на:
http://localhost:8000/docs

