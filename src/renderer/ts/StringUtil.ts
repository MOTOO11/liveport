const BR = /<br>/g;
class StringUtil {

    static replaceBr2NewLine(str: string, nl?: string) {
        return str.replace(BR, nl ? nl : "\r\n");
    }

    static urlToReadable(text: string, replaceStr?: string): string {
        var exp = /(\b(h?ttps?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return text.replace(exp, replaceStr ? replaceStr : "URL");
    }

    static anchorToReadable(text: string, replaceStr?: string): string {
        var exp = /<a href="\/bbs\/read.cgi\/[a-zA-Z]+\/[0-9]+\/[0-9]+\/([0-9]{1,4})" target="_blank">&gt;&gt;[0-9]{1,4}<\/a>/gi;
        return text.replace(exp,
            replaceStr ? replaceStr : "レス$1");
    }

    static urlToLink(text: string): string {
        var exp = /(\b(h?ttps?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
        return text.replace(exp,
            "<a href= \"" + ('$1'.lastIndexOf("ttp", 0) === 0 ? "" : "h") + '$1' + "\" target=\"_blank\">$1</a>");
    }

    static anchorToInnerLink(text: string): string {
        var exp = /<a href="\/bbs\/read.cgi\/[a-zA-Z]+\/[0-9]+\/[0-9]+\/([0-9]{1,4})" target="_blank">&gt;&gt;[0-9]{1,4}<\/a>/gi;
        return text.replace(exp,
            "<a href=\"#MESSAGE-$1\" >&gt;&gt;$1</a>");
    }
}

export default StringUtil;


