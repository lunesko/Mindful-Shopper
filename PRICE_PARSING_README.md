# Система парсинга цен Mindful Shopper

## Обзор

Расширение Mindful Shopper теперь использует реальный парсинг цен с сайтов магазинов вместо генерации случайных цен. Это позволяет пользователям видеть актуальные цены товаров в различных магазинах.

## Как это работает

### 1. Архитектура системы

- **Content Script** (`content.js`) - перехватывает кнопки покупки и отправляет запросы на парсинг цен
- **Background Script** (`background.js`) - содержит сервис парсинга цен и выполняет HTTP-запросы
- **Кэширование** - цены кэшируются на 5 минут для оптимизации производительности

### 2. Процесс парсинга

1. Пользователь нажимает на кнопку покупки
2. Content script извлекает информацию о товаре (название, текущая цена)
3. Отправляется запрос в background script для парсинга цен
4. Background script выполняет HTTP-запросы к сайтам магазинов
5. Парсятся HTML-страницы для извлечения цен
6. Результаты возвращаются в content script
7. Popup обновляется с реальными ценами

### 3. Поддерживаемые магазины

#### Украинские магазины:
- **Rozetka** - крупнейший украинский маркетплейс
- **Prom.ua** - украинский онлайн-магазин
- **Comfy** - магазин электроники
- **Foxtrot** - магазин техники
- **Allo** - магазин мобильных устройств

#### Международные магазины:
- **Amazon** - для европейского и американского рынков
- **Google Shopping** - агрегатор цен

### 4. Методы парсинга

#### JSON-LD структурированные данные
```javascript
// Поиск цены в JSON-LD
const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
```

#### Data-атрибуты
```javascript
// Поиск цены в data-атрибутах
const dataPriceMatch = html.match(/data-price="(\d+)"/);
```

#### CSS-классы
```javascript
// Поиск по классам магазина
const priceRegex = /class="[^"]*price[^"]*"[^>]*>([^<]+)</g;
```

### 5. Кэширование

```javascript
class PriceParsingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут
  }
}
```

### 6. Обработка ошибок

- **Fallback система** - если парсинг не удался, показывается примерная цена
- **Таймауты** - запросы имеют ограничения по времени
- **Валидация** - проверка разумности полученных цен

## Настройка и развертывание

### 1. Разрешения в manifest.json

```json
{
  "permissions": ["storage", "notifications", "alarms", "activeTab"],
  "host_permissions": ["<all_urls>"]
}
```

### 2. Background Script

Сервис парсинга цен работает в background script для обхода CORS ограничений:

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPrice') {
    const { storeName, productName, region } = request;
    priceService.getPrice(storeName, productName, region)
      .then(price => sendResponse({ success: true, price }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
```

### 3. Content Script

Запрос цен из content script:

```javascript
const response = await new Promise((resolve) => {
  chrome.runtime.sendMessage({
    action: 'getPrice',
    storeName: storeName,
    productName: productName,
    region: region
  }, (response) => {
    resolve(response);
  });
});
```

## Тестирование

### 1. Локальное тестирование

Откройте `test-price-parsing.html` в браузере для тестирования системы парсинга.

### 2. Тестирование расширения

1. Загрузите расширение в Chrome
2. Перейдите на страницу товара (например, Rozetka)
3. Нажмите на кнопку покупки
4. Проверьте, что отображаются реальные цены

### 3. Проверка логов

Откройте Developer Tools → Console для просмотра логов парсинга:

```javascript
console.log('Rozetka parsing error:', error);
console.log('Prom.ua parsing error:', error);
```

## Производительность

### 1. Кэширование
- Цены кэшируются на 5 минут
- Уменьшает количество HTTP-запросов
- Улучшает скорость отклика

### 2. Параллельные запросы
- Все запросы к магазинам выполняются параллельно
- Максимальная скорость загрузки цен

### 3. Fallback система
- Если парсинг не удался, показывается примерная цена
- Пользователь всегда видит результат

## Безопасность

### 1. User-Agent заголовки
```javascript
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
```

### 2. Обработка ошибок
- Graceful degradation при ошибках парсинга
- Логирование ошибок для отладки

### 3. Валидация данных
- Проверка разумности полученных цен
- Фильтрация некорректных данных

## Расширение функциональности

### 1. Добавление нового магазина

```javascript
// В background.js
case 'new-store':
  return await this.parseNewStorePrice(productName);
```

### 2. Улучшение парсеров

```javascript
async parseNewStorePrice(productName) {
  // Реализация парсера для нового магазина
}
```

### 3. Настройка кэширования

```javascript
// Изменение времени кэширования
this.cacheTimeout = 10 * 60 * 1000; // 10 минут
```

## Заключение

Новая система парсинга цен обеспечивает:

- ✅ Реальные цены с сайтов магазинов
- ✅ Быстрая загрузка благодаря кэшированию
- ✅ Надежная работа с fallback системой
- ✅ Поддержка украинских и международных магазинов
- ✅ Простота расширения и настройки

Система готова к использованию и может быть легко расширена для поддержки новых магазинов.
