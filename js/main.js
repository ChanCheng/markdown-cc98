function init() {
    chrome.extension.sendMessage({
        purpose: 'current_tab'
    }, function(response) {
        var tab = response.current_tab;
        var url = tab.url;
        var cc98 = "www.cc98.org";

        if (url.indexOf(cc98) >= 0) {
            insert_switch();
        }
    });
}

var settings = [
    "alwaysOn"
];
var syncStorage = chrome.storage.sync;
var previewFrame;
var previewInnerFrame;
var switchBar;
var onURL = chrome.extension.getURL("img/icon_on.png");
var offURL = chrome.extension.getURL("img/icon_off.png");
var previewOnURL = chrome.extension.getURL("img/previewIcon_on.png");
var previewOffURL = chrome.extension.getURL("img/previewIcon_off.png");

/** 搜索输入框，在每个输入框上插入 Markdown 开关 */

function insert_switch() {
    syncStorage.get(settings, function(items) {
        var textarea = $('textarea');

        for (var i = 0; i < textarea.length; i++) {
            switchBar = document.createElement("div");
            switchBar.setAttribute('class', 'MDBar');

            var switchItem = document.createElement("img");
            switchItem.setAttribute('class', 'header');
            if (items.alwaysOn) {
                setTextarea(switchItem, 'on');
            } else {
                setTextarea(switchItem, 'off');
            }
            switchItem.onclick = function switchClicked() {
                if (this.getAttribute('status') == 'on') {
                    setTextarea(this, 'off');
                    if (previewInnerFrame) clientubb.searchubb("MdPreviewInnerFrame", 1, "tablebody2", textarea[i].value, previewInnerFrame, true, true, true, true);
                } else {
                    setTextarea(this, 'on');
                    var UBBCode = Md_UBB_Translator.Md2UBB(textarea[i].value);
                    if (previewInnerFrame) clientubb.searchubb("MdPreviewInnerFrame", 1, "tablebody2", UBBCode, previewInnerFrame, true, true, true, true);
                }
            };

            var previewItem = document.createElement("img");
            previewItem.setAttribute('class', 'header');
            if (items.alwaysOn) {
                setPreview(previewItem, 'on');
            } else {
                setPreview(previewItem, 'off');
            }
            previewItem.onclick = function switchClicked() {
                if (this.getAttribute('status') == 'on') {
                    setPreview(this, 'off');
                } else {
                    setPreview(this, 'on');
                }
            };

            /** debug button
             *  翻译成 UBB 代码并打开 cc98 自带预览窗口
            var transBtn = document.createElement("a");
            transBtn.setAttribute('class', 'header');
            transBtn.innerText = '翻译成 UBB 代码';
            transBtn.onclick = function transToUBB() {
                chrome.extension.sendMessage({
                    purpose: 'updatePreviewFrame'
                });
                var UBBCode = Md_UBB_Translator.Md2UBB(this.parentNode.nextSibling.value);
                $("#previewfrm")[0].body.value = UBBCode;
                $("#previewfrm")[0].target = "MdPreviewFrame";
                $("#previewfrm")[0].submit();
                // console.debug(UBBCode);
            };
            
            switchBar.appendChild(transBtn);
             */
            switchBar.appendChild(switchItem);
            switchBar.appendChild(previewItem);

            textarea[i].parentNode.insertBefore(switchBar, textarea[i]);
            textarea[i].oninput = function(event) {
                var UBBCode;

                if (switchItem.getAttribute('status') == 'on') {
                    UBBCode = Md_UBB_Translator.Md2UBB(event.target.value);
                } else if (switchItem.getAttribute('status') == 'off') {
                    UBBCode = event.target.value;
                }
                if (previewInnerFrame) clientubb.searchubb("MdPreviewInnerFrame", 1, "tablebody2", UBBCode, previewInnerFrame, true, true, true, true);
                // console.log(UBBCode);
            };

            break; // 只 match 一个输入框
        }
    });
}

function setTextarea(item, mode) {
    if (mode == 'on') {
        console.debug("textarea on");
        item.setAttribute('status', 'on');
        item.src = onURL;
    } else {
        console.debug("textarea off");
        item.setAttribute('status', 'off');
        item.src = offURL;
    }
}

/** 插入预览框架 */

function insertPreview() {
    previewFrame = document.createElement("div");
    previewFrame.setAttribute("id", "MdPreviewFrame");
    previewFrame.setAttribute("class", "MdPreviewFrame");
    previewInnerFrame = document.createElement("div");
    previewInnerFrame.setAttribute("class", "MdPreviewInnerFrame");
    previewFrame.appendChild(previewInnerFrame);
    var cp = $("#copyright")[0];
    cp.parentNode.insertBefore(previewFrame, cp);
}

function setPreview(item, mode) {
    if (mode == 'on') {
        console.debug("preview on");
        item.setAttribute('status', 'on');
        if (previewFrame) previewFrame.style.display = '';
        else insertPreview();
        item.src = previewOnURL;
    } else {
        console.debug("preview off");
        item.setAttribute('status', 'off');
        if (previewFrame) previewFrame.style.display = 'none';
        item.src = previewOffURL;
    }
}

// 页面载入完成后进行初始化
init();

function showButton() {
    alert("Browser Action!");
}

/** main.js 通过 Message 机制与 background.js 进行通信 */
chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.purpose == 'remove_all') {
        if (previewFrame) delete previewFrame;
        if (switchBar) switchBar.remove();
    } else {
        sendResponse({}); // Send clean response
    }
});