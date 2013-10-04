/**
 * Name: Md_UBB_Translator.js
 * URL: https://github.com/ChanCheng/markdown-cc98
 * Author: ChanCheng
 * License: MIT License
 * Description: Convert Markdown to UBB 						// or UBB to Markdown
 * Version: 0.1
 *
 * Usage:
 * Md_UBB_Translator.Md2UBB(MdCode);
 */

(function(Md_UBB_Translator) {

	/** private methods */
	var syncStorage = chrome.storage.sync;

	/** 自定义属性值 */

	var atxPattern = /^(#{1,6})\s*(\S+?.*?)#*\s*$/; // 类 Atx 标题正则式
	var titleUBB = [
		"[font=微软雅黑][size=6][b]", "[/b][/size][/font]\n\n",
		"[font=微软雅黑][size=5][b]", "[/b][/size][/font]\n\n",
		"[font=微软雅黑][size=4][b]", "[/b][/size][/font]\n\n",
		"[font=微软雅黑][size=3][b]", "[/b][/size][/font]\n\n",
		"[font=微软雅黑][size=2][b]", "[/b][/size][/font]\n\n",
		"[font=微软雅黑][size=1][b]", "[/b][/size][/font]\n\n",
	];

	var contextUBB = [
		"[font=微软雅黑][size=3]", "[/size][/font]\n"
	];

	var quotePattern = /^>\s*(\S+?.*?)\s*$/; // 引用正则式
	var quoteTag = ["[font=微软雅黑][size=4][color=#121212][quote]", "[/quote][/color][/size][/font]\n"];

	var listHeadPattern = /^(\d.|[*+-])\s+/; // 列表头正则式
	var listTag = ["[list]", "[/list]\n"];

	var divLinePattern = /^([*_-]\s*){3,}([^*_-]*?)([*_-]*\s*)*$/; // 分割线正则式
	var divLength = 134; // 分割线长度

	var codePattern = /^([ ]{4,}|\t)+(.*)$/; // 代码正则式
	var inlineCodePattern = /`([^`]+?)`/g; // 行内代码正则式
	var codeTag = ["[code]", "[/code]\n", "[font=Lucida Console][size=2][color=#e900ff][i][noubb] ", " [/noubb][/i][/color][/size][/font]"];

	var urlFixer = true; // URL 自动补全
	var urlHeaders = /^\s*(http|https):\/\//; // URL 协议头正则式

	var boldPattern = /(\*{2}(.+?)\*{2})|(_{2}(.+?)_{2})/g; // 加粗正则式
	var boldTag = ["[b]", "[/b]"];

	var italicPattern = /(\*(.+?)\*)|(_(.+?)_)/g; // 斜体正则式
	var italicTag = ["[i]", "[/i]"];

	var emphasisTag = ["[font=微软雅黑][size=4][color=#4169e1][b]", "[/b][/color][/size][/font]"];

	var withLinksPattern = /(!\[.*?\]\(.+?\))|(\[.*?\]\(.+?\))/g; // 行内有 URL 正则式
	var picPattern = /!\[(.*?)\]\((.+?)\)/; // 图片、文件标签正则式
	var linkPattern = /\[(.*?)\]\((.+?)\)/; // 链接标签正则式
	var linkStyleTag = ["[font=微软雅黑][size=3][b]", "[/b][/size][/font]"];

	/**  段属性值 */
	var EMPTYLINE = 0; // 空行
	var QUOTE = 1; // 引用
	var LIST = 2; // 列表
	var CODE = 3; // 代码
	var DIVLINE = 4; // 分割线
	var ATXTITLE = 5; // 类 Atx 标题
	var TEXT = 6; // 普通文本
	/** 获取该行的段属性 */

	function getStatus(str, nowStatus) {
		if (str.match(atxPattern)) return ATXTITLE; // 类 Atx 标题
		if (str.match(quotePattern)) return QUOTE; // 引用
		if (str.match(/^([*_-]\s*){3,}/)) return DIVLINE; // 分割线
		if (str.match(listHeadPattern)) return LIST; // 列表
		if (str.match(/^[ ]{4,}|\t/)) {
			if (nowStatus == QUOTE || nowStatus == LIST) return nowStatus;
			else return CODE; // 代码
		}
		if (str.match(/^\s*$/)) return EMPTYLINE; // 空行
		if (nowStatus == QUOTE || nowStatus == LIST) return nowStatus;
		else return TEXT; // 普通文本
	}

	/** 处理图片、文件标签 */

	function picHandler(note, url) {
		// if (url.match(/^https?:\/\//)) {
			if (note == '0' || note == ' ') return "[img=0]" + url + "[/img]\n";
			else return linkStyleTag[0] + "[img=1]" + url + "[/img]" + linkStyleTag[1] + '\n';
		// } else {
		// 	var type = url.match(/\.(.*)$/);
		// 	if (type) {
		// 		if (note == '0') return "[upload=" + type[1] + ",0]" + url + "[/upload]\n";
		// 		else return "[upload=" + type[1] + ",1]" + url + "[/upload]\n";
		// 	} else {
		// 		return "[upload]" + url + "[/upload]\n";
		// 	}
		// }
	}

	/** 处理链接标签 */

	function linkHandler(name, url) {
		if (urlFixer) {
			if (!url.match(urlHeaders)) url = "http://" + url;
		}

		if (!name) return linkStyleTag[0] + url + linkStyleTag[1];
		// if (!name) return "[u][url][color=blue]" + url + "[/color][/url][/u]";
		else return linkStyleTag[0] + "[url=" + url + "][color=blue][u]" + name + "[/u][/color][/url]" + linkStyleTag[1];
	}

	/** 处理 ``` 标签 */

	codeQuoteHandler = function() {
		var content = arguments[1].match(/^(.*)$/gm);
		var res = '\n';
		for (var i = 0; i < content.length - 1; i++) {
			res += "    " + content[i] + '\n';
		}
		return res;
	}

	chrome.storage.onChanged.addListener(function(changes, areaName) {
		if (areaName == "sync") {
			/** 实在是烦死了啊我就是个白痴啊怎么会做得这么复杂啊臣妾实在是写不下去了啊皇上你不要逼我啊你再逼臣妾臣妾一口盐汽水喷死你啊呸！ */
			Md_UBB_Translator.init();
		}
	});

	/** public methods */

	Md_UBB_Translator.init = function() {
		var settings = [
			"TitleFont",
			"ContextFont", "ContextSize",
			"LinkFont", "LinkSize", "LinkBold", "LinkItalic",
			"EmphasisFont", "EmphasisSize", "EmphasisBold", "EmphasisItalic", "EmphasisColor",
			"InlineCodeFont", "InlineCodeSize", "InlineCodeBold", "InlineCodeItalic", "InlineCodeColor",
			"QuoteFont", "QuoteSize", "QuoteBold", "QuoteItalic", "QuoteColor"
		];
		syncStorage.get(settings, function(items) {
			// 标题 Style 设置
			for (var i = 0; i < 11; i += 2) {
				titleUBB[i] = "[font=" + items.TitleFont + "][size=" + (6 - i / 2) + "][b]";
			}

			// 正文 Style 设置
			contextUBB[0] = "[font=" + items.ContextFont + "][size=" + items.ContextSize[0] + "]";

			// 链接 Style 设置
			linkStyleTag[0] = "[font=" + items.LinkFont + "][size=" + items.LinkSize[0] + "]";
			linkStyleTag[1] = "[/size][/font]";
			if (items.LinkBold == 'on') {
				linkStyleTag[0] += "[b]";
				linkStyleTag[1] = "[/b]" + linkStyleTag[1];
			}
			if (items.LinkItalic == 'on') {
				linkStyleTag[0] += "[i]";
				linkStyleTag[1] = "[/i]" + linkStyleTag[1];
			}

			// 强调 Style 设置
			emphasisTag[0] = "[font=" + items.EmphasisFont + "][size=" + items.EmphasisSize[0] + "][color=" + items.EmphasisColor + "]";
			emphasisTag[1] = "[/color][/size][/font]";
			if (items.EmphasisBold == 'on') {
				emphasisTag[0] += "[b]";
				emphasisTag[1] = "[/b]" + emphasisTag[1];
			}
			if (items.EmphasisItalic == 'on') {
				emphasisTag[0] += "[i]";
				emphasisTag[1] = "[/i]" + emphasisTag[1];
			}

			// 行内代码 Style 设置
			codeTag[2] = "[font=" + items.InlineCodeFont + "][size=" + items.InlineCodeSize[0] + "][color=" + items.InlineCodeColor + "]";
			codeTag[3] = "[/color][/size][/font]";
			if (items.InlineCodeBold == 'on') {
				codeTag[2] += "[b]";
				codeTag[3] = "[/b]" + codeTag[3];
			}
			if (items.InlineCodeItalic == 'on') {
				codeTag[2] += "[i]";
				codeTag[3] = "[/i]" + codeTag[3];
			}
			codeTag[2] += "[noubb] ";
			codeTag[3] = " [/noubb]" + codeTag[3];

			// 引用 Style 设置
			quoteTag[0] = "[font=" + items.QuoteFont + "][size=" + items.QuoteSize[0] + "][color=" + items.QuoteColor + "]";
			quoteTag[1] = "[/color][/size][/font]\n";
			if (items.QuoteBold == 'on') {
				quoteTag[0] += "[b]";
				quoteTag[1] = "[/b]" + quoteTag[1];
			}
			if (items.QuoteItalic == 'on') {
				quoteTag[0] += "[i]";
				quoteTag[1] = "[/i]" + quoteTag[1];
			}
			quoteTag[0] += "[quote]";
			quoteTag[1] = "[/quote]" + quoteTag[1];
		});
	}

	Md_UBB_Translator.Md2UBB = function(MdCode) {
		var UBBCode = "";

		/** 预处理 */
		// 空行转换
		// var rawCode = MdCode.replace(/^[ \t]*$/gm, "");

		// 消除连续空行
		var rawCode = (MdCode + '\n').replace(/^(\s*\n){2,}/gm, "\n");
		// 消除非代码行行首缩进
		/*rawCode = rawCode.replace(/^[ ]{0,3}(\S+.*?)\n/g, "$1\n");
		rawCode = rawCode.replace(/\n[ ]{1,3}(\S+.*?)\n/g, "\n$1\n");
		rawCode = rawCode.replace(/\n[ ]{1,3}(\S+.*?)\n/g, "\n$1\n");
		rawCode = rawCode.replace(/\n[ ]{0,3}(\S+.*?)$/g, "\n$1");
		rawCode = rawCode.replace(/^[ ]{0,3}(\S+.*?)$/g, "$1");*/
		// 代码引用
		rawCode = rawCode.replace(/^\s*?```\s*?\n((.*?\n)*?)\s*?```\s*?\n/g, codeQuoteHandler);
		rawCode = rawCode.replace(/\n\s*?```\s*?\n((.*?\n)*?)\s*?```\s*?\n/g, codeQuoteHandler);
		rawCode = rawCode.replace(/\n\s*?```\s*?\n((.*?\n)*?)\s*?```\s*?$/g, codeQuoteHandler);

		/** 分段处理 */
		var codeArr = rawCode.split('\n');
		var tmpRawCode = "";
		var i = 0;
		var startIndex = 0;
		var status = 0; // 当前行段属性
		var nextStatus = getStatus(codeArr[0], 0); // 下一行段属性
		var content;
		while (i < codeArr.length - 1) {
			// 取段起始地址
			startIndex = i;
			while (true) {
				status = nextStatus;
				if (i == codeArr.length - 2) break; // 到达内容末尾
				nextStatus = getStatus(codeArr[i + 1], status);
				if (status == ATXTITLE || status == DIVLINE) break; // 标题和分割线自成一段
				if (status != nextStatus) break; // 段属性不相同则非同一段
				i++;
			}
			tmpRawCode = "";

			// 处理段内容
			switch (status) {
				case EMPTYLINE:
					tmpRawCode = '\n';

					break;
				case QUOTE:
					tmpRawCode = quoteTag[0];
					content = "";
					for (var j = startIndex; j <= i; j++) {
						content += codeArr[j].replace(/^>?([ ]{0,4}|\t)/, "") + '\n';
					}
					tmpRawCode += Md_UBB_Translator.Md2UBB(content); // 递归处理引用内容
					tmpRawCode = tmpRawCode.replace(/\n*$/, ''); // 去除多余的空行
					tmpRawCode += quoteTag[1];

					break;
				case LIST:
					tmpRawCode = listTag[0];
					content = codeArr[startIndex].replace(listHeadPattern, "") + '\n';
					for (var j = startIndex + 1; j <= i; j++) {
						if (codeArr[j].match(listHeadPattern)) {
							tmpRawCode = tmpRawCode.replace(/\n\n$/, '\n'); // 去除多余的空行
							tmpRawCode += "[*] " + Md_UBB_Translator.Md2UBB(content); // 递归处理标签内容
							content = codeArr[j].replace(listHeadPattern, "") + '\n';
						} else {
							content += codeArr[j].replace(/^(\t|[ ]{0,4})/, "") + '\n';
						}
					}
					tmpRawCode = tmpRawCode.replace(/\n\n$/, '\n'); // 去除多余的空行
					tmpRawCode += "[*] " + Md_UBB_Translator.Md2UBB(content); // 递归处理标签内容
					tmpRawCode = tmpRawCode.replace(/\n*$/, ''); // 去除多余的空行
					tmpRawCode += listTag[1];

					break;
				case CODE:
					tmpRawCode = codeTag[0];
					for (var j = startIndex; j < i; j++) {
						tmpRawCode += codeArr[j].replace(/^\s*/, "") + '\n';
					}
					tmpRawCode += codeArr[i].replace(/^\s*/, ""); // 去除开头的空格
					tmpRawCode = tmpRawCode.replace(/\n\n$/, '\n'); // 去除多余的空行
					tmpRawCode += codeTag[1];

					break;
				case DIVLINE:
					content = codeArr[i].match(divLinePattern)[2]; // 分割线内容
					if (content) {
						content = content.replace(/\s+/g, ' '); // 去除连续空格
						var cnt = Math.ceil((divLength - content.length) / 2);
						// 这个分割线还是对不很齐啊真受不了！
						var fullWidthCnt = content.match(/[\u4e00-\u9fa5\u3040-\u30FF]/g); // 获取全角符号的个数（因为全角和半角符号的宽度不同！）
						if (fullWidthCnt) fullWidthCnt = fullWidthCnt.length;
						else fullWidthCnt = 0;
						fullWidthCnt = Math.ceil(fullWidthCnt * 3 / 4); // 全角符号宽度：半角符号宽度 取经验参数 7:4 :p
						tmpRawCode = new Array(cnt).join('-') + ' ' + content + ' ' + new Array(divLength - 1 - content.length - cnt - fullWidthCnt).join('-') + '\n';
					} else {
						tmpRawCode = new Array(divLength).join('-') + '\n';
					}

					break;
				case ATXTITLE:
					content = codeArr[i].match(atxPattern);
					var titleLev = content[1].length;
					content = content[2].replace(/\s+/g, ' '); // 去除连续空格
					content = content.replace(/\\([\\\*_{}\[\]\(\)#+\-\.!`])/g, '$1'); // 转义符

					// 标题 Style
					tmpRawCode = titleUBB[titleLev * 2 - 2] + content + titleUBB[titleLev * 2 - 1];

					break;
				case TEXT:
					tmpRawCode = "";
					for (var j = startIndex; j < i; j++) {
						content = codeArr[j].replace(/\s+/g, ' '); // 去除连续空格
						content = content.replace(/\\([\\\*_{}\[\]\(\)#+\-\.!`])/g, '$1'); // 转义符
						tmpRawCode += content;
						// 段内分行
						if (codeArr[j].match(/\t|[ ]{2,}$/)) tmpRawCode += '\n';
						else if (tmpRawCode[tmpRawCode.length - 1] != ' ') tmpRawCode += ' ';
					}
					content = codeArr[i].replace(/\s+/g, ' '); // 去除连续空格
					tmpRawCode += content;
					if (tmpRawCode[tmpRawCode.length - 1] != '\n') tmpRawCode += '\n';

					break;
			}

			// 处理行内标签
			// 把 URL 中的 *_- 转换为 Html 实体
			tmpRawCode = tmpRawCode.replace(/(\[.*?\]\()(.*?)\)/g, function() {
				var url = arguments[2].replace(/\*/g, "&#42;").replace(/_/g, "&#95;").replace(/\-/g, "&#45;");
				return arguments[1] + url + ")";
			});
			// 这里好像没有考虑转义符啊>3<
			// 强调
			tmpRawCode = tmpRawCode.replace(/\*\*(\S+?)\*\*/g, emphasisTag[0] + "$1" + emphasisTag[1]);
			tmpRawCode = tmpRawCode.replace(/__(\S+?)__/g, emphasisTag[0] + "$1" + emphasisTag[1]);
			// 斜体
			tmpRawCode = tmpRawCode.replace(/\*(\S+?)\*/g, italicTag[0] + "$1" + italicTag[1]);
			tmpRawCode = tmpRawCode.replace(/_(\S+?)_/g, italicTag[0] + "$1" + italicTag[1]);
			// 行内代码
			tmpRawCode = tmpRawCode.replace(inlineCodePattern, codeTag[2] + "$1" + codeTag[3]);
			// 图片 & 链接
			// js 正则好像没有平衡组啊那要怎么做啊……
			for (var tmpi = 0; tmpi < tmpRawCode.length; tmpi++) {
				if (tmpRawCode[tmpi] == ']' && tmpRawCode[tmpi + 1] == '(') {
					mode = 0; // 0：链接 1：图片
					leftMark = 0;
					lastMatched = -1;
					for (j = tmpi - 1; j >= 0; j--) {
						if (tmpRawCode[j] == ']') leftMark++;
						else if (tmpRawCode[j] == '[') {
							lastMatched = j;
							if (leftMark == 0) {
								break;
							}
							else {
								leftMark--;
							}
						}
					}
					if (lastMatched == -1) continue; // 不匹配
					var note = tmpRawCode.substring(lastMatched + 1, tmpi);
					if (lastMatched > 0 && tmpRawCode[lastMatched - 1] == '!') mode = 1;

					for (var j = tmpi + 2; j < tmpRawCode.length; j++) {
						if (tmpRawCode[j] == ')') break;
					}
					if (j == tmpRawCode.length) continue; // 不匹配
					var url = tmpRawCode.substring(tmpi + 2, j);

					if (mode == 1) {
						var res = picHandler(note, url);
						tmpi = lastMatched + res.length - 2;
						tmpRawCode = tmpRawCode.substring(0, lastMatched - 1) + res + tmpRawCode.substring(j + 1);
					}
					else {
						var res = linkHandler(note, url);
						tmpi = lastMatched + res.length - 1;
						tmpRawCode = tmpRawCode.substring(0, lastMatched) + res + tmpRawCode.substring(j + 1);
					}
				}
			}

			tmpRawCode = tmpRawCode.replace(/\\([\\\*_{}\[\]\(\)#+\-\.!`])/g, '$1'); // 转义符
			UBBCode += tmpRawCode;
			i++;
		}

		// 正文 Style
		UBBCode = contextUBB[0] + UBBCode + contextUBB[1];
		return UBBCode;
	};

}(window.Md_UBB_Translator = window.Md_UBB_Translator || {}));