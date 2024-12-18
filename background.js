chrome.runtime.onInstalled.addListener(() => {
    console.log('Twitter DM Popout extension installed');
});

let popupWindowId = null;
let activeTabId = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'OPEN_POPUP') {
        activeTabId = sender.tab.id;
        
        if (popupWindowId !== null) {
            chrome.windows.remove(popupWindowId);
        }

        chrome.windows.create({
            url: chrome.runtime.getURL('popup.html'),
            type: 'popup',
            width: message.dimensions.width,
            height: message.dimensions.height,
            left: message.dimensions.left,
            top: message.dimensions.top
        }, (window) => {
            popupWindowId = window.id;
        });
    }
    else if (message.type === 'LOAD_CONVERSATION') {
        chrome.tabs.sendMessage(activeTabId, message);
    }
    else if (message.type === 'CONVERSATION_MESSAGES') {
        if (popupWindowId !== null) {
            chrome.runtime.sendMessage(message);
        }
    }
    
    return true;
}); 