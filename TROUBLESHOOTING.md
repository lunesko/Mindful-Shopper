# Mindful Shopper - Troubleshooting Guide

## Ошибка "Extension context invalidated"

Эта ошибка возникает когда расширение перезагружается или обновляется, но content script все еще пытается использовать старые Chrome API.

### Новые улучшения:

- ✅ **Глобальное отслеживание состояния** контекста расширения
- ✅ **Периодическая проверка** контекста каждые 30 секунд
- ✅ **Автоматическое восстановление** при восстановлении контекста
- ✅ **Предотвращение повторной инициализации**
- ✅ **Улучшенное логирование** для отладки

### Решения:

1. **Перезагрузите расширение:**
   - Откройте `chrome://extensions/`
   - Найдите "Mindful Shopper"
   - Нажмите кнопку "Обновить" (🔄)

2. **Обновите страницу:**
   - Нажмите F5 или Ctrl+R
   - Или закройте и откройте вкладку заново

3. **Проверьте консоль:**
   - Нажмите F12
   - Перейдите на вкладку "Console"
   - Выполните: `copy(debug.js)` и вставьте в консоль
   - Или выполните: `console.log(window.mindfulShopperContext)`

### Отладка:

1. **Проверьте состояние контекста:**
   ```javascript
   console.log('Context state:', window.mindfulShopperContext);
   ```

2. **Проверьте Chrome API:**
   ```javascript
   console.log('Chrome available:', typeof chrome !== 'undefined');
   ```

3. **Проверьте кнопки:**
   ```javascript
   console.log('Intercepted buttons:', document.querySelectorAll('[data-mindful-intercepted="true"]').length);
   ```

### Автоматическое восстановление:

Расширение теперь автоматически:
- ✅ Отслеживает состояние контекста
- ✅ Восстанавливается при восстановлении контекста
- ✅ Предотвращает повторную инициализацию
- ✅ Показывает предупреждения вместо ошибок

### Если проблема продолжается:

1. **Очистите кэш браузера**
2. **Перезапустите Chrome**
3. **Удалите и переустановите расширение**
4. **Проверьте консоль на предупреждения**

### Логи для разработчика:

- `Extension context invalid, skipping initialization` - нормально при перезагрузке
- `Extension context became invalid, resetting initialization` - автоматическое восстановление
- `Mindful Shopper initialized successfully` - успешная инициализация
- `Rozetka detected, using specialized selectors` - специальная обработка для Rozetka

## 🛒 **Специальная обработка для Rozetka:**

Rozetka может блокировать расширения как ботов. Для этого добавлены:

- ✅ **Специальные селекторы** для кнопок Rozetka
- ✅ **Увеличенные задержки** инициализации (5 секунд)
- ✅ **Мягкая проверка контекста** (каждые 60 секунд)
- ✅ **Умный поиск кнопок** по тексту и атрибутам

### Если на Rozetka не работает:

1. **Обновите страницу** (F5)
2. **Подождите 5-10 секунд** после загрузки
3. **Проверьте консоль** на сообщения
4. **Попробуйте другой товар** на том же сайте
5. **Очистите кэш** браузера

### Отладка на Rozetka:

```javascript
// Проверьте состояние
console.log('Context:', window.mindfulShopperContext);

// Проверьте найденные кнопки
console.log('Buttons found:', document.querySelectorAll('[data-mindful-intercepted="true"]').length);

// Проверьте все кнопки на странице
console.log('All buttons:', document.querySelectorAll('button, a, input[type="button"]').length);
```
