// Функция для применения локализации
function applyLocalization() {
  document.getElementById('extensionTitle').textContent = chrome.i18n.getMessage('extension_name');
  document.getElementById('buyCoffeeText').textContent = chrome.i18n.getMessage('buy_coffee');
}

// Применяем локализацию при загрузке
applyLocalization();