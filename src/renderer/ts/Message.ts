"use strict"
import StringUtil from "./StringUtil";
export default class Message {
    num: number;
    name: string;
    mail: string;
    date: string;
    text: string;
    title: string;
    id: string;
    latest: boolean = false;
    decorateText: string = "";
    optionalText: string = "";
    setParameters(num: number, name: string, mail: string, date: string, text: string, title: string, id: string, latest: boolean) {
        this.num = num;
        this.name = name;
        this.mail = mail;
        this.date = date;
        this.text = text;
        this.title = title;
        this.id = id;
        this.latest = latest;
        var replace = StringUtil.urlToLink(text);
        this.decorateText = StringUtil.anchorToInnerLink(replace);
        this.optionalText = StringUtil.imageUrlToLinkStrings(text);
    }
    constructor() { }

    static decodeFromJson(data: any) {
        var data = JSON.parse(data);
        let res = new Message();
        let num = data.num;
        let name = data.name;
        let mail = data.mail;
        let date = data.date;
        let text = data.text;
        let title = data.title;
        let id = data.id;
        res.setParameters(num, name, mail, date, text, title, id, false);
        return res;
    }
    stringify() {
        return JSON.stringify(this);
    }
}

