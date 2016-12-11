"use strict"
export default class Message {
    num: number;
    name: string;
    mail: string;
    date: string;
    text: string;
    title: string;
    id: string;
    latest: boolean = false;
    constructor() { }

    static decodeFromJson(data: any) {
        var data = JSON.parse(data);
        let res = new Message();
        res.num = data.num;
        res.name = data.name;
        res.mail = data.mail;
        res.date = data.date;
        res.text = data.text;
        res.title = data.title;
        res.id = data.id;
        return res;
    }
    stringify() {
        return JSON.stringify(this);
    }
}

