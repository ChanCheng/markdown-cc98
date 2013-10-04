(function(pangu) {
    var syncStorage = chrome.storage.sync;
    var settings = [
        "TitleFont",
        "ContextFont", "ContextSize",
        "LinkFont", "LinkSize", "LinkBold", "LinkItalic",
        "EmphasisFont", "EmphasisSize", "EmphasisBold", "EmphasisItalic", "EmphasisColor",
        "InlineCodeFont", "InlineCodeSize", "InlineCodeBold", "InlineCodeItalic", "InlineCodeColor",
        "QuoteFont", "QuoteSize", "QuoteBold", "QuoteItalic", "QuoteColor"
    ];
    var defaultFonts = ["微软雅黑", "黑体", "宋体"];

    /** 设置（标题、正文、链接、强调、行内代码、引用）字体 */

    setFontMenuHandler = function() {
        setFont(this.parentNode.parentNode.getAttribute('field'), this.innerText);
    }

    function setFont(field, font) {
        var input = $("#customized" + field + "Font");
        var example = $(".setting_example" + field);

        var isDefault = false;
        for (var i = 0; i < defaultFonts.length; i++) {
            if (defaultFonts[i] == font) {
                isDefault = true;
                break;
            }
        }

        if (isDefault) {
            input.hide(500);
            $("#chosen" + field + "Font")[0].innerHTML = font + '<span class="caret"></span>';
            for (var i = 0; i < example.length; i++) {
                example[i].setAttribute("style", "font-family: " + font);
            }
        } else {
            input.show(500);
            $("#chosen" + field + "Font")[0].innerHTML = '自定义<span class="caret"></span>';
            if (input[0].value) {
                for (var i = 0; i < example.length; i++) {
                    example[i].setAttribute("style", "font-family: " + input[0].value);
                }
            } else {
                for (var i = 0; i < example.length; i++) {
                    example[i].setAttribute("style", "font-family: null");
                }
            }

            input.bind("input", function(event) {
                if (event.target.value) {
                    for (var i = 0; i < example.length; i++) {
                        example[i].setAttribute("style", "font-family: " + event.target.value);
                    }
                } else {
                    for (var i = 0; i < example.length; i++) {
                        example[i].setAttribute("style", "font-family: null");
                    }
                }
            });
        }
    }

    /** 设置（正文、链接、强调、行内代码、引用）字号 */

    setSizeMenuHandler = function() {
        setFontSize(this.parentNode.parentNode.getAttribute('field'), this.innerText);
    }

    function setFontSize(field, size) {
        $("#chosen" + field + "Size")[0].innerHTML = size + '<span class="caret"></span>';
        var example = $(".setting_example" + field + "Size");
        if (size[0] == '7') {
            for (var i = 0; i < example.length; i++) {
                example[i].setAttribute("style", "font-size: " + (size[0] * 5) + "px; padding: 6px");
            }
        } else {
            for (var i = 0; i < example.length; i++) {
                example[i].setAttribute("style", "font-size: " + (size[0] * 5) + "px");
            }
        }
    }

    /** 设置（链接、强调、行内代码、引用）加粗、斜体 */

    setBoldHandler = function() {
        var status = this.getAttribute('status');

        if (status == 'on') {
            setStyle(this.parentNode.getAttribute('field'), "bold", 'off');
        } else {
            setStyle(this.parentNode.getAttribute('field'), "bold", 'on');
        }
    }

    setItalicHandler = function() {
        var status = this.getAttribute('status');

        if (status == 'on') {
            setStyle(this.parentNode.getAttribute('field'), "italic", 'off');
        } else {
            setStyle(this.parentNode.getAttribute('field'), "italic", 'on');
        }
    }

    function setStyle(field, option, status) {
        var label = $('[field=' + field + '] .setting_' + option + '_label')[0];
        var target = $(".setting_example" + field);

        label.setAttribute("status", status);
        if (status == 'on') {
            label.setAttribute("class", "label label-info setting_" + option + "_label");
            for (var i = 0; i < target.length; i++) {
                target[i].innerHTML = "<" + option[0] + ">" + target[i].innerHTML + "</" + option[0] + ">";
            }
        } else {
            label.setAttribute("class", "label label-default setting_" + option + "_label");
            for (var i = 0; i < target.length; i++) {
                if (option[0] == 'b') {
                    target[i].innerHTML = target[i].innerHTML.replace(/<b>/g, '')
                        .replace(/<\/b>/g, '');
                } else {
                    target[i].innerHTML = target[i].innerHTML.replace(/<i>/g, '')
                        .replace(/<\/i>/g, '');
                }
            }
        }
    }

    /** 设置（强调、行内代码、引用）字体颜色 */

    setColorHandler = function() {
        setColor(this.parentNode.getAttribute('field'), this.getAttribute('name'));
    }

    function setColor(field, color) {
        var example = $(".setting_example" + field + "Color");
        for (var i = 0; i < example.length; i++) {
            example[i].setAttribute("style", "color: " + color);
            example[i].setAttribute("name", color);
        }
    }

    /** 保存设置 */

    saveHandler = function() {
        var titleFont = $("#chosenTitleFont")[0].innerText;
        if (titleFont == "自定义") titleFont = $("#customizedTitleFont")[0].value;
        var contextFont = $("#chosenContextFont")[0].innerText;
        if (contextFont == "自定义") contextFont = $("#customizedContextFont")[0].value;
        var linkFont = $("#chosenLinkFont")[0].innerText;
        if (linkFont == "自定义") linkFont = $("#customizedLinkFont")[0].value;
        var emphasisFont = $("#chosenEmphasisFont")[0].innerText;
        if (emphasisFont == "自定义") emphasisFont = $("#customizedEmphasisFont")[0].value;
        var inlineCodeFont = $("#chosenInlineCodeFont")[0].innerText;
        if (inlineCodeFont == "自定义") inlineCodeFont = $("#customizedInlineCodeFont")[0].value;
        var quoteFont = $("#chosenQuoteFont")[0].innerText;
        if (quoteFont == "自定义") quoteFont = $("#customizedQuoteFont")[0].value;
        var data = {
            "TitleFont": titleFont,
            "ContextFont": contextFont,
            "ContextSize": $("#chosenContextSize")[0].innerText,
            "LinkFont": linkFont,
            "LinkSize": $("#chosenLinkSize")[0].innerText,
            "LinkBold": $("[field=Link] .setting_bold_label")[0].getAttribute('status'),
            "LinkItalic": $("[field=Link] .setting_italic_label")[0].getAttribute('status'),
            "EmphasisFont": emphasisFont,
            "EmphasisSize": $("#chosenEmphasisSize")[0].innerText,
            "EmphasisBold": $("[field=Emphasis] .setting_bold_label")[0].getAttribute('status'),
            "EmphasisItalic": $("[field=Emphasis] .setting_italic_label")[0].getAttribute('status'),
            "EmphasisColor": $(".setting_exampleEmphasisColor")[0].getAttribute('name'),
            "InlineCodeFont": inlineCodeFont,
            "InlineCodeSize": $("#chosenInlineCodeSize")[0].innerText,
            "InlineCodeBold": $("[field=InlineCode] .setting_bold_label")[0].getAttribute('status'),
            "InlineCodeItalic": $("[field=InlineCode] .setting_italic_label")[0].getAttribute('status'),
            "InlineCodeColor": $(".setting_exampleInlineCodeColor")[0].getAttribute('name'),
            "QuoteFont": quoteFont,
            "QuoteSize": $("#chosenQuoteSize")[0].innerText,
            "QuoteBold": $("[field=Quote] .setting_bold_label")[0].getAttribute('status'),
            "QuoteItalic": $("[field=Quote] .setting_italic_label")[0].getAttribute('status'),
            "QuoteColor": $(".setting_exampleQuoteColor")[0].getAttribute('name')
        };
        syncStorage.set(data, function() {
            var res_label = $('#save_result')[0];
            res_label.innerText = "我记住了！";
            res_label.setAttribute("class", "label label-success");
            // res_label.innerText = "臣妾记不住啊！";
            // res_label.setAttribute("class", "label label-danger");
        });
    }

    /** 恢复默认设置 */

    resetHandler = function() {
        $('#save_result')[0].setAttribute("class", "label label-nothing");

        // 字体设置
        init_font("Title", "微软雅黑");
        init_font("Context", "微软雅黑");
        init_font("Link", "微软雅黑");
        init_font("Emphasis", "微软雅黑");
        init_font("InlineCode", "Lucida Console");
        init_font("Quote", "微软雅黑");

        // 字号设置
        setFontSize("Context", "3 号");
        setFontSize("Link", "3 号");
        setFontSize("Emphasis", "4 号");
        setFontSize("InlineCode", "2 号");
        setFontSize("Quote", "4 号");

        // 加粗设置
        setStyle("Link", "bold", 'on');
        setStyle("Emphasis", "bold", 'on');
        setStyle("InlineCode", "bold", 'off');
        setStyle("Quote", "bold", 'off');

        // 斜体设置
        setStyle("Link", "italic", 'off');
        setStyle("Emphasis", "italic", 'off');
        setStyle("InlineCode", "italic", 'on');
        setStyle("Quote", "italic", 'off');

        // 字体颜色设置
        setColor("Emphasis", '#4169e1');
        setColor("InlineCode", '#e900ff');
        setColor("Quote", '#121212');

        // 保存设置
        saveHandler();
    }


    /** 初始化字体设置 */

    function init_font(field, font) {
        var isDefault = false;
        for (var i = 0; i < defaultFonts.length; i++) {
            if (defaultFonts[i] == font) {
                isDefault = true;
                break;
            }
        }

        if (!isDefault) $("#customized" + field + "Font")[0].value = font;
        setFont(field, font);
    }

    /** 读出保存的设置 */

    function init_options() {
        syncStorage.get(settings, function(items) {
            // 字体设置
            init_font("Title", items.TitleFont);
            init_font("Context", items.ContextFont);
            init_font("Link", items.LinkFont);
            init_font("Emphasis", items.EmphasisFont);
            init_font("InlineCode", items.InlineCodeFont);
            init_font("Quote", items.QuoteFont);

            // 字号设置
            setFontSize("Context", items.ContextSize);
            setFontSize("Link", items.LinkSize);
            setFontSize("Emphasis", items.EmphasisSize);
            setFontSize("InlineCode", items.InlineCodeSize);
            setFontSize("Quote", items.QuoteSize);

            // 加粗设置
            setStyle("Link", "bold", items.LinkBold);
            setStyle("Emphasis", "bold", items.EmphasisBold);
            setStyle("InlineCode", "bold", items.InlineCodeBold);
            setStyle("Quote", "bold", items.QuoteBold);

            // 斜体设置
            setStyle("Link", "italic", items.LinkItalic);
            setStyle("Emphasis", "italic", items.EmphasisItalic);
            setStyle("InlineCode", "italic", items.InlineCodeItalic);
            setStyle("Quote", "italic", items.QuoteItalic);

            // 字体颜色设置
            setColor("Emphasis", items.EmphasisColor);
            setColor("InlineCode", items.InlineCodeColor);
            setColor("Quote", items.QuoteColor);
        });

        // 事件绑定
        $(".font_menu li a").click(setFontMenuHandler);
        $(".size_menu li a").click(setSizeMenuHandler);
        $(".setting_bold_label").click(setBoldHandler);
        $(".setting_italic_label").click(setItalicHandler);
        $(".color_selector").click(setColorHandler);
        $("#setting_save_btn").click(saveHandler);
        $("#setting_reset_btn").click(resetHandler);
    }

    // DOM 载入完触发
    $(document).ready(function() {
        init_options();
    });

}(window.pangu = window.pangu || {}));