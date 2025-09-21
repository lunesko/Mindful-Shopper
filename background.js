chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.storage.local.set({ decisionDelayHours: 24 });
  } catch (error) {
    console.warn('Storage initialization error:', error);
  }
});

// Сервис для парсинга цен с сайтов магазинов
class PriceParsingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут кэш
  }

  // Получение цены с кэшированием
  async getPrice(storeName, productName, region = 'ukraine') {
    const cacheKey = `${storeName}-${productName}-${region}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.price;
    }

    try {
      const price = await this.fetchPriceFromStore(storeName, productName, region);
      
      // Дополнительная валидация цены
      if (price && this.isValidPrice(price)) {
        this.cache.set(cacheKey, { price, timestamp: Date.now() });
        return price;
      } else {
        console.warn(`Invalid price detected for ${storeName}: ${price}`);
        return null;
      }
    } catch (error) {
      console.warn(`Failed to fetch price from ${storeName}:`, error);
      return null;
    }
  }

  // Валидация цены
  isValidPrice(priceString) {
    if (!priceString || typeof priceString !== 'string') {
      return false;
    }
    
    // Извлекаем числовое значение цены
    const numericPrice = parseFloat(priceString.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    // Проверяем разумные пределы для украинских товаров
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return false;
    }
    
    // Максимальная цена 50,000₴ для большинства товаров
    if (numericPrice > 50000) {
      return false;
    }
    
    // Минимальная цена 10₴
    if (numericPrice < 10) {
      return false;
    }
    
    return true;
  }

  // Основная функция для получения цены с магазина
  async fetchPriceFromStore(storeName, productName, region) {
    switch (storeName.toLowerCase()) {
      case 'rozetka':
        return await this.parseRozetkaPrice(productName);
      case 'prom.ua':
        return await this.parsePromUaPrice(productName);
      case 'comfy':
        return await this.parseComfyPrice(productName);
      case 'foxtrot':
        return await this.parseFoxtrotPrice(productName);
      case 'allo':
        return await this.parseAlloPrice(productName);
      case 'amazon':
        return await this.parseAmazonPrice(productName, region);
      case 'google shopping':
        return await this.parseGoogleShoppingPrice(productName, region);
      default:
        return null;
    }
  }

  // Парсер для Rozetka
  async parseRozetkaPrice(productName) {
    try {
      const searchUrl = `https://rozetka.com.ua/search/?text=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Поиск цены в JSON-LD структурированных данных
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatch) {
        for (const jsonLd of jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLd.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
            if (jsonData.offers && jsonData.offers.price) {
              const price = parseInt(jsonData.offers.price);
              return `${price.toLocaleString('uk-UA')}₴`;
            }
          } catch (e) {
            // Игнорируем ошибки парсинга JSON
          }
        }
      }

      // Поиск цены в data-атрибутах
      const dataPriceMatch = html.match(/data-price="(\d+)"/);
      if (dataPriceMatch) {
        const price = parseInt(dataPriceMatch[1]);
        return `${price.toLocaleString('uk-UA')}₴`;
      }

      // Поиск цены в JSON данных
      const priceMatch = html.match(/"price":\s*(\d+)/);
      if (priceMatch) {
        const price = parseInt(priceMatch[1]);
        return `${price.toLocaleString('uk-UA')}₴`;
      }

      // Поиск по классам Rozetka
      const rozetkaPriceSelectors = [
        /class="[^"]*product-price[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*price[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*cost[^"]*"[^>]*>([^<]+)</g
      ];

      for (const regex of rozetkaPriceSelectors) {
        let match;
        while ((match = regex.exec(html)) !== null) {
          const priceText = match[1].replace(/[^\d]/g, '');
          if (priceText && priceText.length >= 2 && priceText.length <= 6) {
            const price = parseInt(priceText);
            if (price > 0 && price < 50000) { // Более строгие пределы цены
              return `${price.toLocaleString('uk-UA')}₴`;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Rozetka parsing error:', error);
      return null;
    }
  }

  // Парсер для Prom.ua
  async parsePromUaPrice(productName) {
    try {
      const searchUrl = `https://prom.ua/search?search_term=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Поиск цены в JSON-LD структурированных данных
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatch) {
        for (const jsonLd of jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLd.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
            if (jsonData.offers && jsonData.offers.price) {
              const price = parseInt(jsonData.offers.price);
              if (price > 0 && price < 50000) { // Более строгие пределы
                return `${price.toLocaleString('uk-UA')}₴`;
              }
            }
          } catch (e) {
            // Игнорируем ошибки парсинга JSON
          }
        }
      }

      // Поиск цены в data-атрибутах
      const dataPriceMatch = html.match(/data-price="(\d+)"/);
      if (dataPriceMatch) {
        const price = parseInt(dataPriceMatch[1]);
        if (price > 0 && price < 100000) {
          return `${price.toLocaleString('uk-UA')}₴`;
        }
      }

      // Поиск цены в JSON данных с более строгой валидацией
      const priceMatches = html.match(/"price":\s*(\d+)/g);
      if (priceMatches) {
        for (const priceMatch of priceMatches) {
          const price = parseInt(priceMatch.match(/(\d+)/)[1]);
          if (price > 0 && price < 50000) { // Более строгие пределы для товаров
            return `${price.toLocaleString('uk-UA')}₴`;
          }
        }
      }

      // Поиск по специфичным селекторам Prom.ua
      const promPriceSelectors = [
        /class="[^"]*price[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*cost[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*value[^"]*"[^>]*>([^<]+)</g,
        /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/g
      ];

      for (const regex of promPriceSelectors) {
        let match;
        while ((match = regex.exec(html)) !== null) {
          const priceText = match[1].replace(/[^\d]/g, '');
          if (priceText && priceText.length >= 2 && priceText.length <= 6) {
            const price = parseInt(priceText);
            if (price > 0 && price < 50000) { // Более строгие пределы цены
              return `${price.toLocaleString('uk-UA')}₴`;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Prom.ua parsing error:', error);
      return null;
    }
  }

  // Парсер для Comfy
  async parseComfyPrice(productName) {
    try {
      const searchUrl = `https://comfy.ua/search/?text=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Поиск цены в JSON-LD структурированных данных
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatch) {
        for (const jsonLd of jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLd.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
            if (jsonData.offers && jsonData.offers.price) {
              const price = parseInt(jsonData.offers.price);
              if (price > 0 && price < 50000) { // Более строгие пределы
                return `${price.toLocaleString('uk-UA')}₴`;
              }
            }
          } catch (e) {
            // Игнорируем ошибки парсинга JSON
          }
        }
      }

      // Поиск цены в data-атрибутах
      const dataPriceMatch = html.match(/data-price="(\d+)"/);
      if (dataPriceMatch) {
        const price = parseInt(dataPriceMatch[1]);
        if (price > 0 && price < 100000) {
          return `${price.toLocaleString('uk-UA')}₴`;
        }
      }

      // Поиск цены в JSON данных с валидацией
      const priceMatches = html.match(/"price":\s*(\d+)/g);
      if (priceMatches) {
        for (const priceMatch of priceMatches) {
          const price = parseInt(priceMatch.match(/(\d+)/)[1]);
          if (price > 0 && price < 50000) { // Более строгие пределы для товаров
            return `${price.toLocaleString('uk-UA')}₴`;
          }
        }
      }

      // Поиск по специфичным селекторам Comfy
      const comfyPriceSelectors = [
        /class="[^"]*price[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*cost[^"]*"[^>]*>([^<]+)</g,
        /class="[^"]*value[^"]*"[^>]*>([^<]+)</g,
        /<span[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/span>/g,
        /<div[^>]*class="[^"]*price[^"]*"[^>]*>([^<]+)<\/div>/g
      ];

      for (const regex of comfyPriceSelectors) {
        let match;
        while ((match = regex.exec(html)) !== null) {
          const priceText = match[1].replace(/[^\d]/g, '');
          if (priceText && priceText.length >= 2 && priceText.length <= 6) {
            const price = parseInt(priceText);
            if (price > 0 && price < 50000) { // Более строгие пределы цены
              return `${price.toLocaleString('uk-UA')}₴`;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Comfy parsing error:', error);
      return null;
    }
  }

  // Парсер для Foxtrot
  async parseFoxtrotPrice(productName) {
    try {
      const searchUrl = `https://www.foxtrot.com.ua/uk/search?query=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Поиск цены в JSON-LD структурированных данных
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatch) {
        for (const jsonLd of jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLd.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
            if (jsonData.offers && jsonData.offers.price) {
              const price = parseInt(jsonData.offers.price);
              if (price > 0 && price < 50000) {
                return `${price.toLocaleString('uk-UA')}₴`;
              }
            }
          } catch (e) {
            // Игнорируем ошибки парсинга JSON
          }
        }
      }

      // Поиск цены в data-атрибутах
      const dataPriceMatch = html.match(/data-price="(\d+)"/);
      if (dataPriceMatch) {
        const price = parseInt(dataPriceMatch[1]);
        if (price > 0 && price < 100000) {
          return `${price.toLocaleString('uk-UA')}₴`;
        }
      }

      // Поиск цены в JSON данных с валидацией
      const priceMatches = html.match(/"price":\s*(\d+)/g);
      if (priceMatches) {
        for (const priceMatch of priceMatches) {
          const price = parseInt(priceMatch.match(/(\d+)/)[1]);
          if (price > 0 && price < 100000) {
            return `${price.toLocaleString('uk-UA')}₴`;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Foxtrot parsing error:', error);
      return null;
    }
  }

  // Парсер для Allo
  async parseAlloPrice(productName) {
    try {
      const searchUrl = `https://allo.ua/ua/search/?text=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Поиск цены в JSON-LD структурированных данных
      const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
      if (jsonLdMatch) {
        for (const jsonLd of jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLd.replace(/<script[^>]*>/, '').replace(/<\/script>/, ''));
            if (jsonData.offers && jsonData.offers.price) {
              const price = parseInt(jsonData.offers.price);
              if (price > 0 && price < 50000) {
                return `${price.toLocaleString('uk-UA')}₴`;
              }
            }
          } catch (e) {
            // Игнорируем ошибки парсинга JSON
          }
        }
      }

      // Поиск цены в data-атрибутах
      const dataPriceMatch = html.match(/data-price="(\d+)"/);
      if (dataPriceMatch) {
        const price = parseInt(dataPriceMatch[1]);
        if (price > 0 && price < 100000) {
          return `${price.toLocaleString('uk-UA')}₴`;
        }
      }

      // Поиск цены в JSON данных с валидацией
      const priceMatches = html.match(/"price":\s*(\d+)/g);
      if (priceMatches) {
        for (const priceMatch of priceMatches) {
          const price = parseInt(priceMatch.match(/(\d+)/)[1]);
          if (price > 0 && price < 100000) {
            return `${price.toLocaleString('uk-UA')}₴`;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Allo parsing error:', error);
      return null;
    }
  }

  // Парсер для Amazon
  async parseAmazonPrice(productName, region) {
    try {
      const domain = region === 'europe' ? 'amazon.de' : 'amazon.com';
      const searchUrl = `https://${domain}/s?k=${encodeURIComponent(productName)}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      const priceMatch = html.match(/"price":\s*(\d+\.?\d*)/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[1]);
        return region === 'europe' ? `€${price.toFixed(2)}` : `$${price.toFixed(2)}`;
      }

      return null;
    } catch (error) {
      console.warn('Amazon parsing error:', error);
      return null;
    }
  }

  // Парсер для Google Shopping
  async parseGoogleShoppingPrice(productName, region) {
    try {
      const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}&hl=${region === 'ukraine' ? 'uk' : 'en'}`;
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      
      // Google Shopping использует специфичные селекторы
      const priceMatch = html.match(/data-price="([^"]+)"/);
      if (priceMatch) {
        return priceMatch[1];
      }

      return null;
    } catch (error) {
      console.warn('Google Shopping parsing error:', error);
      return null;
    }
  }
}

// Создаем экземпляр сервиса
const priceService = new PriceParsingService();

// Обработчик сообщений от content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPrice') {
    const { storeName, productName, region } = request;
    priceService.getPrice(storeName, productName, region)
      .then(price => sendResponse({ success: true, price }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Указываем, что ответ будет асинхронным
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  try {
    if (alarm.name.startsWith("reminder-")) {
      const itemName = alarm.name.replace("reminder-", "");
      
      // Безопасное получение локализованного сообщения
      let title = 'Mindful Shopper';
      let removeText = 'Remove';
      
      try {
        title = chrome.i18n.getMessage('extension_name') || title;
        removeText = chrome.i18n.getMessage('remove') || removeText;
      } catch (error) {
        console.warn('Localization error:', error);
      }
      
      chrome.notifications.create(`notif-${itemName}`, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: title,
        message: `"${itemName}" is now ready for purchase.`,
        buttons: [{ title: removeText }]
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.warn('Notification creation error:', chrome.runtime.lastError);
        }
      });
    }
  } catch (error) {
    console.warn('Alarm handler error:', error);
  }
});

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
  try {
    if (notifId.startsWith("notif-") && btnIdx === 0) {
      const itemName = notifId.replace("notif-", "");
      chrome.storage.local.get({ wishlist: [] }, (data) => {
        if (chrome.runtime.lastError) {
          console.warn('Storage read error:', chrome.runtime.lastError);
          return;
        }
        
        const updated = data.wishlist.filter(item => item.name !== itemName);
        chrome.storage.local.set({ wishlist: updated }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Storage write error:', chrome.runtime.lastError);
          }
        });
      });
      chrome.notifications.clear(notifId);
    }
  } catch (error) {
    console.warn('Notification button handler error:', error);
  }
});