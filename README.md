# 🛒 Mindful Shopper - Chrome Extension

**Pause before you purchase. Choose mindfully.**

A Chrome extension that helps you make thoughtful purchasing decisions by comparing prices across multiple stores and providing a mindful shopping experience.

## ✨ Features

### 🎯 **Core Functionality**
- **Smart Buy Button Interception** - Automatically detects and intercepts buy buttons on e-commerce sites
- **Mindful Popup** - Shows a popup when you click buy with price comparison
- **Price Comparison** - Real-time price comparison across multiple stores
- **Regional Store Support** - Different stores for different regions (Ukraine, Europe, America)
- **Show More Stores** - Expandable store list with "Show more" functionality
- **Google AdSense Ready** - Built-in ad space for monetization

### 🛍️ **Supported Stores by Region**

#### 🇺🇦 **Ukraine**
- **Rozetka** - Ukrainian marketplace
- **Prom.ua** - Ukrainian online marketplace  
- **Comfy** - Ukrainian electronics store
- **Foxtrot** - Ukrainian tech store
- **Allo** - Ukrainian mobile store
- **Google Shopping** - Price comparison

#### 🇪🇺 **Europe**
- **Amazon** - Wide selection, fast delivery
- **Idealo** - Find the best deals
- **MediaMarkt** - German electronics store
- **Saturn** - German tech store
- **Zalando** - European fashion store
- **Google Shopping** - Price comparison

#### 🇺🇸 **America**
- **Amazon** - Wide selection, fast delivery
- **eBay** - Online marketplace
- **Walmart** - American supermarket
- **Best Buy** - American electronics store
- **Target** - American retail store
- **Google Shopping** - Price comparison

### 🌍 **Internationalization**
- **English** (default)
- **Ukrainian** (uk)
- **German** (de)
- **Spanish** (es)
- **French** (fr)
- **Russian** (ru)

## 🚀 Installation

1. **Download the extension files** to your local machine
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## 📖 How to Use

### 1. **Shopping on Any Site**
- Visit any e-commerce website (Amazon, Rozetka, MediaMarkt, etc.)
- Click on any "Buy" or "Add to Cart" button
- The extension will show a popup with:
  - **Product information** and current price
  - **Price comparison** from multiple stores
  - **"Show more stores"** button to see all available stores
  - **Direct links** to each store
  - **Close** button to cancel

### 2. **Price Comparison Features**
- **Automatic region detection** - Shows relevant stores for your region
- **Real-time price generation** - Simulated prices with realistic variations
- **Currency support** - Shows prices in local currency (₴, €, $)
- **Store variety** - 6+ stores per region for comprehensive comparison
- **Expandable list** - Click "Show more stores" to see all options

### 3. **Extension Popup**
- **Simple interface** - Clean popup with just donation button
- **Instructions** - Clear guidance on how to use the extension
- **Donation support** - Support the developer via "Buy Me a Coffee"

### 4. **Regional Support**
- **Ukraine** - Rozetka, Prom.ua, Comfy, Foxtrot, Allo, Google Shopping
- **Europe** - Amazon, Idealo, MediaMarkt, Saturn, Zalando, Google Shopping  
- **America** - Amazon, eBay, Walmart, Best Buy, Target, Google Shopping

## 🎨 **Price Comparison UI**

The extension displays price comparisons in a clean, organized format:

- **Product information** - Name and current price
- **Store cards** - Icon, name, description, and price for each store
- **"Show more stores" button** - Expandable list for additional stores
- **Direct store links** - "To store" buttons for easy navigation
- **Google AdSense section** - Ready for monetization
- **Regional currency** - Prices in local currency (₴, €, $)

## 🔧 **Technical Details**

### **Manifest V3**
- Uses the latest Chrome extension manifest format
- Secure and future-proof
- Content Security Policy compliant

### **Content Scripts**
- Automatically injects on all websites
- Smart button detection for different e-commerce sites
- Regional store detection based on domain and language
- Graceful error handling and fallbacks

### **Price Generation**
- Simulated price generation with realistic variations (±15%)
- Currency formatting based on region
- Fallback to text messages if price generation fails

### **UI Components**
- **Main popup** - Simple interface with donation button
- **Overlay popup** - Rich price comparison interface
- **Responsive design** - Works on different screen sizes
- **Hover effects** - Interactive store cards and buttons

### **Internationalization**
- Multi-language support (EN, UK, DE, ES, FR, RU)
- Regional store selection
- Localized currency formatting

## 🐛 **Troubleshooting**

### **Extension Not Working?**
1. **Reload the extension** in `chrome://extensions/`
2. **Refresh the page** (F5)
3. **Check the console** for error messages
4. **Try a different website**

### **Buttons Not Detected?**
- The extension uses smart selectors to find buy buttons
- Some sites may use custom button implementations
- Try clicking different buy buttons on the page

### **Price Comparison Not Working?**
- Make sure you're on a product page
- Check your internet connection
- The extension uses simulated prices for demonstration
- Try refreshing the page and clicking buy buttons again

### **Wrong Stores Showing?**
- The extension detects region by domain (.ua, .de, .com) and language
- For MediaMarkt/Saturn sites, European stores should show
- For Ukrainian sites, Ukrainian stores should show
- Check browser language settings

### **Prices Look Unrealistic?**
- Prices are simulated for demonstration purposes
- Real implementation would use actual store APIs
- Price variations are ±15% from the original price

## 🧪 **Testing**

### **Test the Extension**
1. **Load the extension** in Chrome developer mode
2. **Visit any e-commerce site** (Amazon, Rozetka, MediaMarkt, etc.)
3. **Click on buy buttons** to trigger the popup
4. **Test price comparison** - see different stores and prices
5. **Test "Show more stores"** button functionality
6. **Test regional detection** - visit sites from different regions

### **Test File**
Use the included `test-price-comparison.html` file:
1. Open the file in Chrome
2. Click on any "Buy Now" button
3. Test the popup functionality
4. Verify price comparison works
5. Test all interactive elements

## 📁 **File Structure**

```
Mindful Shopper/
├── manifest.json          # Extension configuration (Manifest V3)
├── popup.html             # Main extension popup (simplified)
├── popup.js               # Popup functionality (minimal)
├── content.js             # Content script with price comparison
├── background.js          # Background service worker
├── style.css              # Styling for popup
├── icons/                 # Extension icons
│   └── icon128.png
├── _locales/              # Internationalization
│   ├── en/messages.json   # English
│   ├── uk/messages.json   # Ukrainian
│   ├── de/messages.json   # German
│   ├── es/messages.json   # Spanish
│   ├── fr/messages.json   # French
│   └── ru/messages.json   # Russian
├── test-price-comparison.html  # Test file
├── TROUBLESHOOTING.md     # Troubleshooting guide
└── README.md              # This file
```

## 🆕 **Recent Updates**

### **v2.0 - Major Update**
- ✅ **Simplified main popup** - Clean interface with just donation button
- ✅ **Enhanced price comparison** - 6+ stores per region
- ✅ **Regional store support** - Ukraine, Europe, America
- ✅ **"Show more stores" functionality** - Expandable store list
- ✅ **Google AdSense integration** - Ready for monetization
- ✅ **Improved price generation** - Realistic price variations
- ✅ **Better currency support** - Local currency formatting
- ✅ **Enhanced UX** - Hover effects and responsive design

## 💰 **Monetization**

### **Google AdSense Integration**
- **Built-in ad space** - Ready for Google AdSense integration
- **Strategic placement** - Ads appear in the price comparison popup
- **Non-intrusive design** - Ads don't interfere with core functionality
- **Revenue potential** - Monetize through price comparison traffic

### **Donation Support**
- **"Buy Me a Coffee"** button in main popup
- **Direct support** for the developer
- **Optional contribution** - No pressure, purely voluntary

## 🤝 **Contributing**

Feel free to contribute to this project by:
- Adding support for more e-commerce sites
- Improving price comparison algorithms
- Adding new languages and regions
- Reporting bugs and issues
- Suggesting new features
- Improving the Google AdSense integration

## 📄 **License**

This project is open source and available under the MIT License.

## 🙏 **Acknowledgments**

- Chrome Extensions API documentation
- E-commerce sites for providing public APIs
- Open source community for inspiration
- Google AdSense for monetization opportunities
- All contributors and testers

---

## 🎯 **Future Roadmap**

- **Real API integration** - Connect to actual store APIs for real prices
- **More regions** - Add support for Asia, South America, Africa
- **Advanced filtering** - Filter stores by price range, delivery time, etc.
- **User preferences** - Save favorite stores and settings
- **Analytics** - Track usage and popular stores
- **Mobile support** - Extend to mobile browsers

---

**Happy Shopping! 🛒✨**

*Make mindful purchasing decisions with confidence.*
