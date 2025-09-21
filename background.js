chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.storage.local.set({ decisionDelayHours: 24 });
  } catch (error) {
    console.warn('Storage initialization error:', error);
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