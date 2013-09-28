/**
 * background.js 由 background.html 引入
 * 在扩展的整个生命周期中存在
 */

function init() {
	var settings = [
		"alwaysOn"
	];

	var syncStorage = chrome.storage.sync;

	syncStorage.get(settings, function(items) {
		if (!items.alwaysOn) {
			syncStorage.set({
				'alwaysOn': true
			});
		}
	});
}

init();

/** 在页面加载完成后注入js代码 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == 'loading' && tab.url.search(/^chrome/i) == -1) {
		chrome.tabs.sendMessage(tab.id, {
			purpose: "remove_all"
		});
	} else if (changeInfo.status == 'complete' && tab.url.search(/^chrome/i) == -1) {
		chrome.tabs.executeScript(tab.id, {
			file: 'js/main.js',
			allFrames: true
		});
		chrome.tabs.insertCSS(tab.id, {
			file: 'css/myStyle.css'
		});
		chrome.tabs.executeScript(tab.id, {
			file: 'vendors/jquery-1.7.2.min.js',
			allFrames: true
		});
		chrome.tabs.executeScript(tab.id, {
			file: 'vendors/clientubb.js',
			allFrames: true
		});
		chrome.tabs.executeScript(tab.id, {
			file: 'vendors/Md_UBB_Translator.js',
			allFrames: true
		});
	}
});

chrome.browserAction.onClicked.addListener(function(tab) {
	console.debug("browser action");
	chrome.tabs.executeScript(tab.id, {
		code: 'showButton();'
	})
});

/** background.js 通过 Message 机制与 content script 进行通信 */
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.purpose == 'current_tab') {
		sendResponse({
			current_tab: sender.tab
		});
	} else {
		sendResponse({}); // Send clean response
	}
});