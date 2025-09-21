// Глобальная переменная для отслеживания состояния расширения
window.mindfulShopperContext = {
  isValid: false,
  initialized: false
};

// Функция для проверки контекста расширения
function isExtensionContextValid() {
  try {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      return false;
    }
    
    // Проверяем, что нет ошибок в последней операции
    if (chrome.runtime.lastError) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Функция для обновления состояния контекста
function updateContextState() {
  window.mindfulShopperContext.isValid = isExtensionContextValid();
}

// Инициализируем состояние контекста
updateContextState();

// Функция для создания кастомного popup
async function createMindfulPopup() {
  // Обновляем состояние контекста
  updateContextState();
  
  // Проверяем контекст перед созданием popup
  if (!window.mindfulShopperContext.isValid) {
    console.warn('Extension context invalid, cannot create popup');
    showNotification('Extension context invalid - please reload the page', 'warning');
    return;
  }

  // Удаляем существующий popup если есть
  const existingPopup = document.getElementById('mindful-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  const popup = document.createElement('div');
  popup.id = 'mindful-popup';
  popup.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 2147483647 !important;
    background: white !important;
    border-radius: 12px !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
    padding: 24px !important;
    max-width: 600px !important;
    width: 90% !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    border: 1px solid #e0e0e0 !important;
  `;

  const itemName = document.title;
  const productInfo = extractProductInfo();

  // Безопасное получение локализованных сообщений
  const getLocalizedMessage = (key, fallback) => {
    if (isExtensionContextValid()) {
      try {
        return chrome.i18n.getMessage(key) || fallback;
      } catch (error) {
        return fallback;
      }
    }
    return fallback;
  };

  // Получаем список магазинов для отображения
  const stores = await getPriceComparisonStores(productInfo.name, productInfo.price);

  popup.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-size: 48px; margin-bottom: 10px;">🛒</div>
      <h2 style="margin: 0 0 8px 0; color: #333; font-size: 20px;">${getLocalizedMessage('extension_name', 'Mindful Shopper')}</h2>
      <p style="margin: 0; color: #666; font-size: 14px;">${getLocalizedMessage('pause_before_purchase', 'Pause before you purchase. Choose mindfully.')}</p>
    </div>
    
    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${productInfo.name}</h3>
      ${productInfo.price ? `<p style="margin: 0; color: #666; font-size: 14px;">${productInfo.price}</p>` : ''}
    </div>

    <div style="margin-bottom: 20px;">
      <h4 style="margin: 0 0 12px 0; color: #333; font-size: 14px; display: flex; align-items: center;">
        <span style="margin-right: 8px;">💰</span>
        ${getLocalizedMessage('stores_for_purchase', 'Stores for purchase')}
      </h4>
      <div id="stores-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        ${stores.slice(0, 3).map(store => `
          <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
            <div style="width: 32px; height: 32px; background: #f0f0f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">
              ${store.icon}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 2px;">${store.name}</div>
              <div style="font-size: 11px; color: #666;">${store.description}</div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; margin-left: 12px;">
              <div style="font-weight: bold; color: #2e7d32; font-size: 14px;">${store.price}</div>
              <a href="${store.url}" target="_blank" style="
                background: #ff9800;
                color: white;
                text-decoration: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                margin-top: 4px;
                transition: all 0.2s;
              " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
                ${getLocalizedMessage('to_store', 'To store')}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      ${stores.length > 3 ? `
        <button id="show-more-stores" style="
          width: 100%;
          background: #f8f9fa;
          color: #495057;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.2s;
        " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
          ${getLocalizedMessage('show_more_stores', 'Показати ще магазини')} (${stores.length - 3})
        </button>
      ` : ''}
    </div>

    <!-- Google AdSense Section -->
    <div style="margin-bottom: 20px; padding: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
      <div style="text-align: center; margin-bottom: 12px;">
        <span style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Advertisement</span>
      </div>
      <div id="google-ads" style="
        width: 100%;
        height: 100px;
        background: #ffffff;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 12px;
        text-align: center;
      ">
        <div>
          <div style="font-size: 24px; margin-bottom: 4px;">📢</div>
          <div>Google AdSense</div>
          <div style="font-size: 10px; margin-top: 2px;">Реклама буде тут</div>
        </div>
      </div>
    </div>


    <div style="text-align: center;">
      <button id="close-popup-btn" style="
        background: #f5f5f5;
        color: #666;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 12px;
        cursor: pointer;
      ">${getLocalizedMessage('close', 'Close')}</button>
    </div>
  `;

  // Добавляем обработчики событий
  const closePopupBtn = popup.querySelector('#close-popup-btn');
  const showMoreBtn = popup.querySelector('#show-more-stores');

  closePopupBtn.addEventListener('click', () => {
    popup.remove();
  });

  // Обработчик для кнопки "Показать еще магазины"
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      const storesList = popup.querySelector('#stores-list');
      const allStores = stores.map(store => `
        <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
          <div style="width: 32px; height: 32px; background: #f0f0f0; border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">
            ${store.icon}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 600; color: #333; font-size: 13px; margin-bottom: 2px;">${store.name}</div>
            <div style="font-size: 11px; color: #666;">${store.description}</div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; margin-left: 12px;">
            <div style="font-weight: bold; color: #2e7d32; font-size: 14px;">${store.price}</div>
            <a href="${store.url}" target="_blank" style="
              background: #ff9800;
              color: white;
              text-decoration: none;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              margin-top: 4px;
              transition: all 0.2s;
            " onmouseover="this.style.background='#f57c00'" onmouseout="this.style.background='#ff9800'">
              ${getLocalizedMessage('to_store', 'To store')}
            </a>
          </div>
        </div>
      `).join('');
      
      storesList.innerHTML = allStores;
      showMoreBtn.style.display = 'none';
    });
  }

  // Закрытие по клику вне popup
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });

  document.body.appendChild(popup);
}

// Функция для определения региона и языка
function detectRegionAndLanguage() {
  const hostname = window.location.hostname;
  const language = navigator.language || navigator.userLanguage;
  
  // Определяем регион по домену
  if (hostname.includes('.ua') || hostname.includes('rozetka') || hostname.includes('prom')) {
    return { region: 'ukraine', language: 'uk' };
  } else if (hostname.includes('.de') || hostname.includes('.fr') || hostname.includes('.es') || hostname.includes('.it') || 
             hostname.includes('mediamarkt') || hostname.includes('saturn') || hostname.includes('idealo')) {
    return { region: 'europe', language: language.split('-')[0] };
  } else if (hostname.includes('.com') || hostname.includes('amazon')) {
    return { region: 'america', language: 'en' };
  } else if (language.startsWith('uk')) {
    return { region: 'ukraine', language: 'uk' };
  } else if (language.startsWith('de') || language.startsWith('fr') || language.startsWith('es')) {
    return { region: 'europe', language: language.split('-')[0] };
  } else {
    return { region: 'america', language: 'en' };
  }
}

// Функция для получения цен с внешних сайтов
async function getExternalPrice(storeName, productName, currentPrice, region = 'ukraine') {
  try {
    // Для демонстрации возвращаем случайную цену в диапазоне от текущей
    // В реальном приложении здесь был бы API вызов или веб-скрапинг
    let basePrice = parseFloat(currentPrice?.replace(/[^\d.,]/g, '').replace(',', '.')) || 1000;
    
    // Ограничиваем базовую цену разумными пределами
    if (basePrice > 100000) {
      basePrice = 100000; // Максимум 100,000
    } else if (basePrice < 100) {
      basePrice = 1000; // Минимум 1,000 если цена слишком мала
    }
    
    const variation = 0.15; // ±15% вариация
    const randomFactor = 1 + (Math.random() - 0.5) * variation;
    const estimatedPrice = Math.round(basePrice * randomFactor);
    
    // Определяем валюту и формат в зависимости от региона
    switch (region) {
      case 'ukraine':
        return `${estimatedPrice.toLocaleString('uk-UA')}₴`;
      case 'europe':
        return `€${estimatedPrice.toLocaleString('de-DE')}`;
      case 'america':
        return `$${estimatedPrice.toLocaleString('en-US')}`;
      default:
        return `${estimatedPrice.toLocaleString('uk-UA')}₴`;
    }
  } catch (error) {
    console.warn(`Failed to get price from ${storeName}:`, error);
    return null;
  }
}

// Функция для получения списка магазинов для сравнения цен
async function getPriceComparisonStores(productName, currentPrice) {
  const { region, language } = detectRegionAndLanguage();
  
  // Безопасное получение локализованных сообщений
  const getLocalizedMessage = (key, fallback) => {
    if (isExtensionContextValid()) {
      try {
        return chrome.i18n.getMessage(key) || fallback;
      } catch (error) {
        return fallback;
      }
    }
    return fallback;
  };

  let stores = [];

  // Магазины для Украины
  if (region === 'ukraine') {
    // Получаем цены для украинских магазинов
    const rozetkaPrice = currentPrice || await getExternalPrice('Rozetka', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Перевірити ціну');
    const promPrice = await getExternalPrice('Prom.ua', productName, currentPrice, region) || getLocalizedMessage('browse_offers', 'Переглянути пропозиції');
    const googlePrice = await getExternalPrice('Google Shopping', productName, currentPrice, region) || getLocalizedMessage('search_prices', 'Пошук цін');
    const comfyPrice = await getExternalPrice('Comfy', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Перевірити ціну');
    const foxtrotPrice = await getExternalPrice('Foxtrot', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Перевірити ціну');
    const alloPrice = await getExternalPrice('Allo', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Перевірити ціну');
    
    stores = [
      {
        name: 'Rozetka',
        icon: '🏪',
        description: getLocalizedMessage('rozetka_description', 'Український маркетплейс'),
        price: rozetkaPrice,
        url: `https://rozetka.com.ua/search/?text=${encodeURIComponent(productName)}`
      },
      {
        name: 'Prom.ua',
        icon: '🛍️',
        description: getLocalizedMessage('prom_description', 'Український онлайн-магазин'),
        price: promPrice,
        url: `https://prom.ua/search?search_term=${encodeURIComponent(productName)}`
      },
      {
        name: 'Comfy',
        icon: '🏠',
        description: 'Український магазин електроніки',
        price: comfyPrice,
        url: `https://comfy.ua/search/?text=${encodeURIComponent(productName)}`
      },
      {
        name: 'Foxtrot',
        icon: '🦊',
        description: 'Український магазин техніки',
        price: foxtrotPrice,
        url: `https://www.foxtrot.com.ua/uk/search?query=${encodeURIComponent(productName)}`
      },
      {
        name: 'Allo',
        icon: '📱',
        description: 'Український магазин мобільних',
        price: alloPrice,
        url: `https://allo.ua/ua/search/?text=${encodeURIComponent(productName)}`
      },
      {
        name: 'Google Shopping',
        icon: '🛒',
        description: getLocalizedMessage('google_shopping_description', 'Порівняти ціни з різних магазинів'),
        price: googlePrice,
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}&hl=uk`
      }
    ];
  }
  // Магазины для Европы
  else if (region === 'europe') {
    // Получаем цены для европейских магазинов
    const amazonPrice = currentPrice || await getExternalPrice('Amazon', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const idealoPrice = await getExternalPrice('Idealo', productName, currentPrice, region) || getLocalizedMessage('find_deals', 'Find deals');
    const googlePrice = await getExternalPrice('Google Shopping', productName, currentPrice, region) || getLocalizedMessage('search_prices', 'Search prices');
    const mediamarktPrice = await getExternalPrice('MediaMarkt', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const saturnPrice = await getExternalPrice('Saturn', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const zalandoPrice = await getExternalPrice('Zalando', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    
    stores = [
      {
        name: 'Amazon',
        icon: '📦',
        description: getLocalizedMessage('amazon_description', 'Wide selection, fast delivery'),
        price: amazonPrice,
        url: `https://www.amazon.${language === 'de' ? 'de' : language === 'fr' ? 'fr' : 'co.uk'}/s?k=${encodeURIComponent(productName)}`
      },
      {
        name: 'Idealo',
        icon: '🔍',
        description: getLocalizedMessage('idealo_description', 'Find the best deals'),
        price: idealoPrice,
        url: `https://www.idealo.${language === 'de' ? 'de' : 'com'}/search?q=${encodeURIComponent(productName)}`
      },
      {
        name: 'MediaMarkt',
        icon: '🏪',
        description: 'Німецький магазин електроніки',
        price: mediamarktPrice,
        url: `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(productName)}`
      },
      {
        name: 'Saturn',
        icon: '🛰️',
        description: 'Німецький магазин техніки',
        price: saturnPrice,
        url: `https://www.saturn.de/de/search.html?query=${encodeURIComponent(productName)}`
      },
      {
        name: 'Zalando',
        icon: '👕',
        description: 'Європейський модний магазин',
        price: zalandoPrice,
        url: `https://www.zalando.${language === 'de' ? 'de' : language === 'fr' ? 'fr' : 'com'}/search?q=${encodeURIComponent(productName)}`
      },
      {
        name: 'Google Shopping',
        icon: '🛒',
        description: getLocalizedMessage('google_shopping_description', 'Compare prices from multiple stores'),
        price: googlePrice,
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}&hl=${language}`
      }
    ];
  }
  // Магазины для Америки
  else {
    // Получаем цены для американских магазинов
    const amazonPrice = currentPrice || await getExternalPrice('Amazon', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const ebayPrice = await getExternalPrice('eBay', productName, currentPrice, region) || getLocalizedMessage('browse_offers', 'Browse offers');
    const googlePrice = await getExternalPrice('Google Shopping', productName, currentPrice, region) || getLocalizedMessage('search_prices', 'Search prices');
    const walmartPrice = await getExternalPrice('Walmart', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const bestbuyPrice = await getExternalPrice('Best Buy', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    const targetPrice = await getExternalPrice('Target', productName, currentPrice, region) || getLocalizedMessage('check_price', 'Check price');
    
    stores = [
      {
        name: 'Amazon',
        icon: '📦',
        description: getLocalizedMessage('amazon_description', 'Wide selection, fast delivery'),
        price: amazonPrice,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(productName)}`
      },
      {
        name: 'eBay',
        icon: '🛒',
        description: getLocalizedMessage('ebay_description', 'Online marketplace'),
        price: ebayPrice,
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(productName)}`
      },
      {
        name: 'Walmart',
        icon: '🏪',
        description: 'Американський супермаркет',
        price: walmartPrice,
        url: `https://www.walmart.com/search?q=${encodeURIComponent(productName)}`
      },
      {
        name: 'Best Buy',
        icon: '💻',
        description: 'Американський магазин електроніки',
        price: bestbuyPrice,
        url: `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productName)}`
      },
      {
        name: 'Target',
        icon: '🎯',
        description: 'Американський роздрібний магазин',
        price: targetPrice,
        url: `https://www.target.com/s?searchTerm=${encodeURIComponent(productName)}`
      },
      {
        name: 'Google Shopping',
        icon: '🛒',
        description: getLocalizedMessage('google_shopping_description', 'Compare prices from multiple stores'),
        price: googlePrice,
        url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productName)}`
      }
    ];
  }

  return stores;
}

// Функция для извлечения информации о товаре
function extractProductInfo() {
  const hostname = window.location.hostname;
  let name = document.title || 'Unknown Product';
  let price = '';
  
  // Специальные селекторы для Amazon
  if (hostname.includes('amazon')) {
    // Amazon price selectors
    const amazonPriceSelectors = [
      '.a-price-whole',
      '.a-price .a-offscreen',
      '.a-price-range .a-offscreen',
      '.a-price-symbol + .a-price-whole',
      '#price_inside_buybox',
      '#priceblock_dealprice',
      '#priceblock_ourprice',
      '.a-price-range',
      '.a-price .a-text-price',
      '.a-price-range .a-text-price',
      '.a-price .a-offscreen',
      '.a-price-range .a-offscreen'
    ];
    
    for (const selector of amazonPriceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement) {
        price = priceElement.textContent.trim();
        break;
      }
    }
    
    // Amazon product name selectors
    const amazonNameSelectors = [
      '#productTitle',
      '.product-title',
      '.a-size-large',
      '.a-size-medium',
      '.a-size-base'
    ];
    
    for (const selector of amazonNameSelectors) {
      const nameElement = document.querySelector(selector);
      if (nameElement) {
        name = nameElement.textContent.trim();
        break;
      }
    }
  }
  // Специальные селекторы для Rozetka
  else if (hostname.includes('rozetka')) {
    const rozetkaPriceSelectors = [
      '.product-price__big',
      '.product-price__current',
      '.price-value',
      '.product-price',
      '[data-testid="price"]',
      '.price',
      '.cost',
      '.product-cost',
      '.price-current',
      '.current-price',
      '.sale-price',
      '.regular-price',
      '.price-box .price',
      '.price-box .current-price',
      '.price-box .sale-price'
    ];
    
    for (const selector of rozetkaPriceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement) {
        price = priceElement.textContent.trim();
        break;
      }
    }
    
    // Rozetka product name selectors
    const rozetkaNameSelectors = [
      '.product__title',
      '.product-title',
      '.product-name',
      'h1',
      '.product__heading',
      '.product-heading',
      '.product__name',
      '.product-name',
      '.title',
      '.product-title-text'
    ];
    
    for (const selector of rozetkaNameSelectors) {
      const nameElement = document.querySelector(selector);
      if (nameElement) {
        name = nameElement.textContent.trim();
        break;
      }
    }
  }
  // Общие селекторы для всех сайтов
  else {
    const priceSelectors = [
      '.price-value',
      '.product-price',
      '[data-testid="price"]',
      '.price',
      '.cost',
      '.product-cost',
      '.price-current',
      '.current-price',
      '.sale-price',
      '.regular-price'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = document.querySelector(selector);
      if (priceElement) {
        price = priceElement.textContent.trim();
        break;
      }
    }
  }

  return { name, price };
}


// Функция для безопасного вызова Chrome API
function safeChromeCall(apiCall, fallback) {
  // Обновляем состояние контекста
  updateContextState();
  
  if (!window.mindfulShopperContext.isValid) {
    console.warn('Extension context invalidated, using fallback');
    if (fallback) fallback();
    return;
  }
  
  try {
    apiCall();
  } catch (error) {
    console.warn('Chrome API call failed:', error);
    // Обновляем состояние после ошибки
    updateContextState();
    if (fallback) fallback();
  }
}

// Функция для добавления в wishlist
function addToWishlist(itemName, productInfo) {
  const timestamp = Date.now();
  const fullName = productInfo.price ? `${itemName} - ${productInfo.price}` : itemName;

  safeChromeCall(() => {
  chrome.storage.local.get(['wishlist', 'decisionDelayHours'], (data) => {
      if (chrome.runtime.lastError) {
        console.warn('Storage error:', chrome.runtime.lastError);
        showNotification('Error saving to wishlist', 'warning');
        return;
      }

      const existingWishlist = data.wishlist || [];
      
      // Проверяем, не добавлен ли уже этот товар
      const isAlreadyAdded = existingWishlist.some(item => item.name === fullName);
      
      if (isAlreadyAdded) {
        showNotification('Already in wishlist', 'warning');
        return;
      }

      const updatedList = [...existingWishlist, { name: fullName, addedAt: timestamp }];
      
      chrome.storage.local.set({ wishlist: updatedList }, () => {
        if (chrome.runtime.lastError) {
          console.warn('Storage save error:', chrome.runtime.lastError);
          showNotification('Error saving to wishlist', 'warning');
          return;
        }

    const delayMinutes = (data.decisionDelayHours || 24) * 60;
        
        chrome.alarms.create(`reminder-${fullName}`, {
      delayInMinutes: delayMinutes
        }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Alarm creation error:', chrome.runtime.lastError);
          }
        });

        showNotification(`Added to wishlist (${data.decisionDelayHours || 24}h)`, 'success');
      });
    });
  }, () => {
    // Fallback: показываем уведомление без сохранения
    showNotification('Extension context invalid - please reload the page', 'warning');
  });
}

// Функция для показа уведомлений
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Функция для поиска и перехвата кнопок покупки
function interceptBuyButtons() {
  // Селекторы для кнопок покупки на разных сайтах (более специфичные для Rozetka)
  const buyButtonSelectors = [
    // Rozetka specific selectors
    'button[data-testid="buy-button"]',
    'button[data-testid="purchase-button"]',
    '.buy-button',
    '.purchase-button',
    '.add-to-cart',
    '.order-button',
    // Generic selectors
    'button[data-testid*="buy"]',
    'button[data-testid*="purchase"]',
    'button[data-testid*="add-to-cart"]',
    'button[data-testid*="order"]',
    // Text-based selectors (more reliable)
    'button:contains("Купить")',
    'button:contains("Buy")',
    'button:contains("Add to cart")',
    'button:contains("Order")',
    'button:contains("Purchase")',
    'button:contains("Заказать")',
    'button:contains("Оформить заказ")',
    'button:contains("Передзамовити")',
    'button:contains("Додати в кошик")',
    'a[href*="buy"]',
    'a[href*="purchase"]',
    'a[href*="order"]',
    'a[href*="cart"]'
  ];

  buyButtonSelectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.dataset.mindfulIntercepted) {
          button.dataset.mindfulIntercepted = 'true';
          
          const originalClick = button.onclick;
          const originalHref = button.href;
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Сохраняем ссылку на кнопку для продолжения покупки
            window.lastBuyButton = button;
            window.lastBuyButtonOriginalClick = originalClick;
            window.lastBuyButtonOriginalHref = originalHref;
            
            // Показываем наш popup
            createMindfulPopup();
          });
        }
      });
    } catch (error) {
      // Игнорируем ошибки селекторов
    }
  });
}

// Функция для поиска кнопок по тексту
function interceptBuyButtonsByText() {
  const { region } = detectRegionAndLanguage();
  
  let buyTexts = [];
  
  if (region === 'ukraine') {
    buyTexts = [
      'Купить', 'Купити', 'Заказать', 'Замовити', 
      'Оформить заказ', 'Оформити замовлення', 
      'Передзамовити', 'Додати в кошик',
      'В кошик', 'В корзину', 'До кошика',
      'Купити зараз', 'Купить сейчас',
      'Оформити', 'Оформить', 'Замовити зараз'
    ];
  } else if (region === 'europe') {
    buyTexts = [
      'Buy', 'Kaufen', 'Acheter', 'Comprar',
      'Add to cart', 'In den Warenkorb', 'Ajouter au panier',
      'Order', 'Bestellen', 'Commander', 'Pedir',
      'Purchase', 'Kauf', 'Achat', 'Compra',
      'Jetzt kaufen', 'Acheter maintenant', 'Comprar ahora'
    ];
  } else {
    buyTexts = [
      'Buy', 'Add to cart', 'Order', 'Purchase',
      'Buy now', 'Add to basket', 'Add to cart',
      'Purchase now', 'Order now', 'Buy it now'
    ];
  }

  // Более умный поиск кнопок
  const allButtons = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
  
  allButtons.forEach(button => {
    const text = button.textContent?.trim() || button.value?.trim() || '';
    const ariaLabel = button.getAttribute('aria-label') || '';
    const title = button.getAttribute('title') || '';
    
    // Проверяем текст, aria-label и title
    const allText = `${text} ${ariaLabel} ${title}`.toLowerCase();
    
    if (buyTexts.some(buyText => allText.includes(buyText.toLowerCase()))) {
      if (!button.dataset.mindfulIntercepted) {
        button.dataset.mindfulIntercepted = 'true';
        
        const originalClick = button.onclick;
        const originalHref = button.href;
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          window.lastBuyButton = button;
          window.lastBuyButtonOriginalClick = originalClick;
          window.lastBuyButtonOriginalHref = originalHref;
          
          createMindfulPopup();
        });
      }
    }
  });
}

// Специальная функция для Amazon
function interceptAmazonButtons() {
  // Ищем кнопки покупки на Amazon по специфичным селекторам
  const amazonSelectors = [
    // Amazon specific selectors
    'input[value="Add to Basket"]',
    'input[value="Add to Cart"]',
    'input[value="Buy now"]',
    'input[value="Buy Now"]',
    'input[value="Add to basket"]',
    'input[value="Add to cart"]',
    'input[value="Buy now with 1-Click"]',
    'input[value="Buy Now with 1-Click"]',
    'input[value="Add to List"]',
    'input[value="Add to list"]',
    // Button selectors
    'button[data-testid="add-to-cart-button"]',
    'button[data-testid="buy-now-button"]',
    'button[data-testid="add-to-basket-button"]',
    'button[data-testid="buy-button"]',
    'button[data-testid="purchase-button"]',
    // Class-based selectors
    'button[class*="add-to-cart"]',
    'button[class*="buy-now"]',
    'button[class*="add-to-basket"]',
    'button[class*="buy-button"]',
    'button[class*="purchase"]',
    // ID-based selectors
    'button[id*="add-to-cart"]',
    'button[id*="buy-now"]',
    'button[id*="add-to-basket"]',
    'button[id*="buy-button"]',
    'button[id*="purchase"]',
    // Link selectors
    'a[href*="add-to-cart"]',
    'a[href*="buy-now"]',
    'a[href*="add-to-basket"]',
    'a[href*="buy-button"]',
    'a[href*="purchase"]'
  ];

  amazonSelectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.dataset.mindfulIntercepted) {
          button.dataset.mindfulIntercepted = 'true';
          
          const originalClick = button.onclick;
          const originalHref = button.href;
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            window.lastBuyButton = button;
            window.lastBuyButtonOriginalClick = originalClick;
            window.lastBuyButtonOriginalHref = originalHref;
            
            createMindfulPopup();
          });
        }
      });
    } catch (error) {
      // Игнорируем ошибки селекторов
    }
  });
}

// Специальная функция для Rozetka
function interceptRozetkaButtons() {
  // Ищем кнопки покупки на Rozetka по специфичным селекторам
  const rozetkaSelectors = [
    // Rozetka specific selectors
    'button[data-testid="buy-button"]',
    'button[data-testid="purchase-button"]',
    'button[data-testid="add-to-cart"]',
    'button[data-testid="order-button"]',
    '.buy-button',
    '.purchase-button',
    '.add-to-cart',
    '.order-button',
    '.product-buy-button',
    '.product-purchase-button',
    '.product-add-to-cart',
    '.product-order-button',
    // Rozetka class patterns
    'button[class*="buy"]',
    'button[class*="purchase"]',
    'button[class*="order"]',
    'button[class*="cart"]',
    'a[class*="buy"]',
    'a[class*="purchase"]',
    'a[class*="order"]',
    'a[class*="cart"]',
    // Generic selectors that work on Rozetka
    'button[type="submit"]',
    'input[type="submit"]',
    'button[class*="btn"]',
    'a[class*="btn"]'
  ];

  rozetkaSelectors.forEach(selector => {
    try {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        if (!button.dataset.mindfulIntercepted) {
          button.dataset.mindfulIntercepted = 'true';
          
          const originalClick = button.onclick;
          const originalHref = button.href;
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            window.lastBuyButton = button;
            window.lastBuyButtonOriginalClick = originalClick;
            window.lastBuyButtonOriginalHref = originalHref;
            
            createMindfulPopup();
          });
        }
      });
    } catch (error) {
      // Игнорируем ошибки селекторов
    }
  });
}

// Инициализация перехвата кнопок
function initBuyButtonInterception() {
  const hostname = window.location.hostname;
  
  // Проверяем, находимся ли мы на Amazon
  if (hostname.includes('amazon')) {
    console.log('Amazon detected, using specialized selectors');
    interceptAmazonButtons();
  }
  // Проверяем, находимся ли мы на Rozetka
  else if (hostname.includes('rozetka')) {
    console.log('Rozetka detected, using specialized selectors');
    interceptRozetkaButtons();
  }
  
  // Общие селекторы для всех сайтов
  interceptBuyButtons();
  interceptBuyButtonsByText();
}

// Функция для безопасной инициализации
function safeInit() {
  try {
    // Обновляем состояние контекста
    updateContextState();
    
    if (!window.mindfulShopperContext.isValid) {
      console.warn('Extension context invalid, skipping initialization');
      return;
    }
    
    // Проверяем, не инициализирован ли уже скрипт
    if (window.mindfulShopperContext.initialized) {
      console.log('Extension already initialized, skipping');
      return;
    }
    
    initBuyButtonInterception();
    window.mindfulShopperContext.initialized = true;
    console.log('Mindful Shopper initialized successfully');
  } catch (error) {
    console.warn('Initialization error:', error);
    // Обновляем состояние после ошибки
    updateContextState();
  }
}

// Обработчик сообщений от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProductInfo') {
    const productInfo = extractProductInfo();
    sendResponse(productInfo);
  }
});

// Обертка для безопасного выполнения
try {
  // Запускаем перехват после загрузки страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }

  // Дополнительная попытка через задержку (более мягкая для Rozetka)
  const delay = window.location.hostname.includes('rozetka') ? 5000 : 2000;
  setTimeout(safeInit, delay);

  // Перехват при изменении URL (для SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(safeInit, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

  // Обработка ошибок контекста расширения
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
      console.warn('Extension context invalidated, updating state...');
      updateContextState();
    }
  });

  // Периодическая проверка контекста (более мягкая для Rozetka)
  const checkInterval = window.location.hostname.includes('rozetka') ? 60000 : 30000;
  setInterval(() => {
    const wasValid = window.mindfulShopperContext.isValid;
    updateContextState();
    
    if (wasValid && !window.mindfulShopperContext.isValid) {
      console.warn('Extension context became invalid, resetting initialization');
      window.mindfulShopperContext.initialized = false;
    }
  }, checkInterval);
} catch (error) {
  console.warn('Content script initialization error:', error);
  
  // Показываем уведомление об ошибке
  const errorNotification = document.createElement('div');
  errorNotification.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
    background: #ff4444 !important;
    color: white !important;
    padding: 12px 20px !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  `;
  errorNotification.textContent = 'Extension error - please reload the page';
  document.body.appendChild(errorNotification);
  
  setTimeout(() => {
    errorNotification.remove();
  }, 5000);
}