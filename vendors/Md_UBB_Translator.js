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
	var atxPattern = /^(#{1,6})\s*(\S+?.*?)#*\s*$/; // 类 Atx 标题正则式
	var titleUBB = [
		"[font=微软雅黑][size=6][b]", "[/b][/size][/font]\n",
		"[font=微软雅黑][size=5][b]", "[/b][/size][/font]\n",
		"[font=微软雅黑][size=4][b]", "[/b][/size][/font]\n",
		"[font=微软雅黑][size=3][b]", "[/b][/size][/font]\n",
		"[font=微软雅黑][size=2][b]", "[/b][/size][/font]\n",
		"[font=微软雅黑][size=1][b]", "[/b][/size][/font]\n",
	];
	var quotePattern = /^>\s*(\S+?.*?)\s*$/; // 引用正则式
	var quoteTag = ["[quote]", "[/quote]\n"];
	var listHeadPattern = /^(\d.|[*+-])\s+/; // 列表头正则式
	var listTag = ["[list]", "[/list]\n"];
	var divLinePattern = /^([*_-]\s*){3,}([^*_-]*?)([*_-]*\s*)*$/; // 分割线正则式
	var divLength = 134; // 分割线长度
	var codePattern = /^([ ]{4,}|\t)+(.*)$/; // 代码正则式
	var inlineCodePattern = /`(.+?)`/g; // 行内代码正则式
	var codeTag = ["[code=2]", "[/code]\n", "[i][noubb]", "[/noubb][/i]"];
	var urlFixer = true; // URL 自动补全
	var urlHeaders = /^\s*(http|https):\/\//; // URL 协议头正则式
	var boldPattern = /(\*{2}(.+?)\*{2})|(_{2}(.+?)_{2})/g; // 加粗正则式
	var boldTag = ["[b]", "[/b]"];
	var italicPattern = /(\*(.+?)\*)|(_(.+?)_)/g; // 斜体正则式
	var italicTag = ["[i]", "[/i]"];
	var withLinksPattern = /(!\[.*?\]\(.+?\))|(\[.*?\]\(.+?\))/g; // 行内有 URL 正则式
	var picPattern = /!\[(.*?)\]\((.+?)\)/; // 图片、文件标签正则式
	var linkPattern = /\[(.*?)\]\((.+?)\)/; // 链接标签正则式

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
		if (str == "") return EMPTYLINE; // 空行
		if (str.match(atxPattern)) return ATXTITLE; // 类 Atx 标题
		if (str.match(quotePattern)) return QUOTE; // 引用
		if (str.match(/^([*_-]\s*){3,}/)) return DIVLINE; // 分割线
		if (str.match(listHeadPattern)) return LIST; // 列表
		if (str[0] == ' ') {
			if (nowStatus == QUOTE || nowStatus == LIST) return nowStatus;
			else return CODE; // 代码
		}
		if (nowStatus == QUOTE || nowStatus == LIST) return nowStatus;
		else return TEXT; // 普通文本
	}

	/** 处理加粗标签 */
	boldHandler = function(str, p1, c1, p2, c2) {
		if (p1) {
			return boldTag[0] + c1 + boldTag[1];
		} else if (p2) {
			return boldTag[0] + c2 + boldTag[1];
		} else return "";
	}

	/** 处理斜体标签 */
	italicHandler = function(str, p1, c1, p2, c2) {
		if (p1) {
			return italicTag[0] + c1 + italicTag[1];
		} else if (p2) {
			return italicTag[0] + c2 + italicTag[1];
		} else return "";
	}

	/** 处理图片、文件标签 */

	function picHandler(note, url) {
		if (url.match(/^https?:\/\//)) {
			if (note == '0' || note == ' ') return "[img=0]" + url + "[/img]\n";
			else return "[img=1]" + url + "[/img]\n";
		} else {
			var type = url.match(/\.(.*)$/);
			if (type) {
				if (note == '0') return "[upload=" + type[1] + ",0]" + url + "[/upload]\n";
				else return "[upload=" + type[1] + ",1]" + url + "[/upload]\n";
			} else {
				return "[upload]" + url + "[/upload]\n";
			}
		}
	}

	/** 处理链接标签 */

	function linkHandler(name, url) {
		if (urlFixer) {
			if (!url.match(urlHeaders)) url = "http://" + url;
		}

		if (!name) return url;
		// if (!name) return "[u][url][color=blue]" + url + "[/color][/url][/u]";
		else return "[url=" + url + "][color=blue][u]" + name + "[/u][/color][/url]";
	}

	/** public methods */

	Md_UBB_Translator.Md2UBB = function(MdCode) {
		var UBBCode = "";

		/** 预处理 */
		// 空行转换
		var rawCode = MdCode.replace(/^[ \t]*$/gm, "");
		// 消除连续空行
		rawCode = rawCode.replace(/\n{3,}/g, "\n\n");
		// 消除非代码行行首缩进
		rawCode = rawCode.replace(/^[ ]{0,3}(\S+.*?)\n/g, "$1\n");
		rawCode = rawCode.replace(/\n[ ]{1,3}(\S+.*?)\n/g, "\n$1\n");
		rawCode = rawCode.replace(/\n[ ]{1,3}(\S+.*?)\n/g, "\n$1\n");
		rawCode = rawCode.replace(/\n[ ]{0,3}(\S+.*?)$/g, "\n$1");
		rawCode = rawCode.replace(/^[ ]{0,3}(\S+.*?)$/g, "$1");

		/** 分段处理 */
		var codeArr = rawCode.split('\n');
		var tmpRawCode = "";
		var i = 0;
		var startIndex = 0;
		var status = 0; // 当前行段属性
		var nextStatus = getStatus(codeArr[0], 0); // 下一行段属性
		var content;
		while (i < codeArr.length) {
			// 取段起始地址
			startIndex = i;
			while (true) {
				status = nextStatus;
				if (i == codeArr.length - 1) break; // 到达内容末尾
				nextStatus = getStatus(codeArr[i + 1], status);
				if (status == ATXTITLE || status == DIVLINE) break; // 标题和分割线自成一段
				if (status != nextStatus) break; // 段属性不相同则非同一段
				i++;
			}

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
						fullWidthCnt = Math.ceil(fullWidthCnt * 3 / 4); // 全角符号宽度：半角符号宽度 取经验参数 7:4
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
					tmpRawCode = titleUBB[titleLev * 2 - 2] + content + titleUBB[titleLev * 2 - 1];
					break;
				case TEXT:
					tmpRawCode = "";
					for (var j = startIndex; j <= i; j++) {
						content = codeArr[j].replace(/\s+/g, ' ');
						content = content.replace(/\\([\\\*_{}\[\]\(\)#+\-\.!`])/g, '$1'); // 转义符
						tmpRawCode += content;
						// 段内分行
						if (codeArr[j].match(/\t|[ ]{2,}$/)) tmpRawCode += '\n';
						else if (tmpRawCode[tmpRawCode.length - 1] != ' ') tmpRawCode += ' ';
					}
					if (tmpRawCode[tmpRawCode.length - 1] != '\n') tmpRawCode += '\n';
					break;
			}

			// 处理行内标签
			// 行内有 URL
			if (tmpRawCode.match(withLinksPattern)) {
				var tmpArr = tmpRawCode.split(withLinksPattern);
				var tmpContent;
				tmpRawCode = "";
				for (var tmpi = 0; tmpi < tmpArr.length; tmpi++) {
					if (tmpArr[tmpi]) {
						if (tmpContent = tmpArr[tmpi].match(picPattern)) {
							// 图片标签
							tmpRawCode += picHandler(tmpContent[1], tmpContent[2]);
						} else if (tmpContent = tmpArr[tmpi].match(linkPattern)) {
							// 链接标签
							tmpRawCode += linkHandler(tmpContent[1], tmpContent[2]);
						} else {
							// 普通行
							tmpRawCode += tmpArr[tmpi].replace(boldPattern, boldHandler)
								.replace(italicPattern, italicHandler)
								.replace(inlineCodePattern, codeTag[2] + "$1" + codeTag[3]);
						}
					}
				}
			}
			// 行内无 URL
			else {
				// 处理加粗标签
				tmpRawCode = tmpRawCode.replace(boldPattern, boldHandler);

				// 处理斜体标签
				tmpRawCode = tmpRawCode.replace(italicPattern, italicHandler);

				// 处理行内代码标签
				tmpRawCode = tmpRawCode.replace(inlineCodePattern, codeTag[2] + "$1" + codeTag[3]);
			}

			UBBCode += tmpRawCode;
			i++;
		}

		return UBBCode;
	};

}(window.Md_UBB_Translator = window.Md_UBB_Translator || {}));