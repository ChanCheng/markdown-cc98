/**
 * background.js 由 background.html 引入
 * 在扩展的整个生命周期中存在
 */

function init() {
	var settings = [
		"alwaysOn",
		"TitleFont",
        "ContextFont", "ContextSize",
        "LinkFont", "LinkSize", "LinkBold", "LinkItalic",
        "EmphasisFont", "EmphasisSize", "EmphasisBold", "EmphasisItalic", "EmphasisColor",
        "InlineCodeFont", "InlineCodeSize", "InlineCodeBold", "InlineCodeItalic", "InlineCodeColor",
        "QuoteFont", "QuoteSize", "QuoteBold", "QuoteItalic", "QuoteColor"
	];

	var syncStorage = chrome.storage.sync;

	syncStorage.get(settings, function(items) {
		if (!items.alwaysOn) syncStorage.set({ 'alwaysOn': true });

		if (!items.TitleFont)  	syncStorage.set({ 'TitleFont': '微软雅黑'});
		if (!items.ContextFont)	syncStorage.set({ 'ContextFont': '微软雅黑'});
		if (!items.LinkFont)  	syncStorage.set({ 'LinkFont': '微软雅黑'});
		if (!items.EmphasisFont)	syncStorage.set({ 'EmphasisFont': '微软雅黑'});
		if (!items.InlineCodeFont)  syncStorage.set({ 'InlineCodeFont': 'Lucida Console'});
		if (!items.QuoteFont)	syncStorage.set({ 'QuoteFont': '微软雅黑'});

		if (!items.ContextSize)	syncStorage.set({ 'ContextSize': '3 号'});
		if (!items.LinkSize)  	syncStorage.set({ 'LinkSize': '3 号'});
		if (!items.EmphasisSize)	syncStorage.set({ 'EmphasisSize': '4 号'});
		if (!items.InlineCodeSize)  syncStorage.set({ 'InlineCodeSize': '2 号'});
		if (!items.QuoteSize)	syncStorage.set({ 'QuoteSize': '4 号'});

		if (!items.LinkBold)  	syncStorage.set({ 'LinkBold': 'on'});
		if (!items.EmphasisBold)	syncStorage.set({ 'EmphasisBold': 'on'});
		if (!items.InlineCodeBold)  syncStorage.set({ 'InlineCodeBold': 'off'});
		if (!items.QuoteBold)	syncStorage.set({ 'QuoteBold': 'off'});

		if (!items.LinkItalic)  	syncStorage.set({ 'LinkItalic': 'off'});
		if (!items.EmphasisItalic)	syncStorage.set({ 'EmphasisItalic': 'off'});
		if (!items.InlineCodeItalic)  syncStorage.set({ 'InlineCodeItalic': 'on'});
		if (!items.QuoteItalic)	syncStorage.set({ 'QuoteItalic': 'off'});

		if (!items.EmphasisColor)	syncStorage.set({ 'EmphasisColor': '#4169e1'});
		if (!items.InlineCodeColor)  syncStorage.set({ 'InlineCodeColor': '#e900ff'});
		if (!items.QuoteColor)	syncStorage.set({ 'QuoteColor': '#121212'});
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
			file: 'vendors/jquery-2.0.3.min.js',
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