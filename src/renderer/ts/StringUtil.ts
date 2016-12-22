const BR = /<br>/gi;
import { configure } from "./Configure"
const SystemDictionary = configure.SystemDictionary;
const UserDictionary: [{ pattern: string, reading: string }] = configure.UserDictionary;
const NgDictionary: string[] = configure.NgDictionary;
class StringUtil {

    static replaceBr2NewLine(str: string, nl?: string) {
        return str.replace(BR, nl ? nl : "\r\n");
    }

    static urlToReadable(text: string): string {
        var exp = new RegExp(SystemDictionary.URL.pattern, "ig");
        return text.replace(exp, SystemDictionary.URL.reading);
    }

    static urlToLink(text: string): string {
        var exp = new RegExp(SystemDictionary.URL.pattern, "ig");
        let matches = text.match(exp);
        return text.replace(exp,
            "<a href= \"" + "http:$3" + "\" target=\"_blank\">$1</a>");
    }

    static imageUrlToLinkStrings(text: string): string {
        var exp = new RegExp(SystemDictionary.ImageExt.pattern, "ig");
        let matches = text.match(exp);
        let result = "";
        if (matches) {
            matches.forEach(element => {
                let link = StringUtil.ttpLinkToHttpLink(element);
                result += `<a href="${link}" target="_blank"><img class="thumbs" src="${link}" /></a>`;
            });
        }
        return (result ? "<br />" : "") + result;
    }

    static ttpLinkToHttpLink(link: string) {
        return (link.lastIndexOf('h', 0) === 0 ? "" : "h") + link;
    }

    static anchorToPlain(text: string): string {
        var exp = new RegExp(SystemDictionary.ANCHOR.pattern, "ig");
        return text.replace(exp, ">>$1");
    }

    static anchorToReadable(text: string): string {
        var exp = new RegExp(SystemDictionary.ANCHOR.pattern, "ig");
        return text.replace(exp, SystemDictionary.ANCHOR.reading);
    }

    static anchorToInnerLink(text: string): string {
        var exp = new RegExp(SystemDictionary.ANCHOR.pattern, "ig");
        return text.replace(exp,
            "<a href=\"#MESSAGE-$1\" >&gt;&gt;$1</a>");
    }

    static isAA(text: string, lineLimit?: number, regexp?: RegExp): boolean {
        let regex = new RegExp(SystemDictionary.AA.pattern, "ig");
        if (text.split(/\r\n|\r|\n/).length < (lineLimit ? lineLimit : 3)) return false;
        return regex.test(text);
    }

    static applyUserDictionary(text: string): string {
        for (var i in UserDictionary) {
            var exp = new RegExp(UserDictionary[i].pattern, "ig");
            text = text.replace(exp, UserDictionary[i].reading);
        }
        return text;
    }

    static containsNg(text: string): boolean {
        for (var i in NgDictionary) {
            var exp = new RegExp(NgDictionary[i], "ig");
            if (NgDictionary[i])
                if (exp.test(text)) return true;
        }
        return false;
    }

    /**
* 半角カタカナを全角カタカナに変換
* 
* @param {String} str 変換したい文字列
*/
    static replaceHANKAKUtoZENKAKU(str: string): string {
        var kanaMap = {
            'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
            'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
            'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
            'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
            'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
            'ｳﾞ': 'ヴ', 'ﾜﾞ': '?', 'ｦﾞ': '?',
            'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
            'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
            'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
            'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
            'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
            'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
            'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
            'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
            'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
            'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
            'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
            'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
            '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
        };

        var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
        return str
            .replace(reg, function (match) {
                return kanaMap[match];
            })
            .replace(/ﾞ/g, '゛')
            .replace(/ﾟ/g, '゜');
    }
}

export default StringUtil;