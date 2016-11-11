"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
const URL = "http://jbbs.shitaraba.net/bbs/read.cgi/netgame/12802/1478775754/";
const SHITARABA_REGEX = new RegExp(/http:\/\/jbbs.shitaraba.net\/bbs\/read.cgi\/(\w+)\/(\d+)\/(\d+)/);
const RES_SPLITTER = new RegExp(/<>/g);
const NEWLINE_SPLITTER = new RegExp(/\n/g);

export class Thread {
    res: Res[] = [];
    bookmark: number = 0;
    url: string = "";
    constructor(url?: string) {
        if (url) this.url = url;
    }

    dat2json(dat: string) {
        var line = dat.split(NEWLINE_SPLITTER);
        for (var i = 0; i < line.length - 1; i++) {
            var r = line[i].split(RES_SPLITTER);
            var res = new Res();
            res.num = +r[0];
            res.name = r[1];
            res.mail = r[2];
            res.date = r[3];
            res.text = r[4];
            res.title = r[5];
            res.id = r[6];
            this.res.push(res);
        }
    }

    static isShitarabaURL(url: string): boolean {
        return SHITARABA_REGEX.test(url);
    }

    request() {
        var url = URL;
        if (Thread.isShitarabaURL(this.url)) {
            url = this.url;
        }
        var matches = url.match(SHITARABA_REGEX);
        var datUrl = `http://jbbs.shitaraba.net/bbs/rawmode.cgi/${matches[1]}/${matches[2]}/${matches[3]}/`;
        console.log("request dat url : " + datUrl);
        rp({ url: datUrl, encoding: null, timeout: 1500 })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                this.dat2json(decoding);
                // var st = this.stringify();
                // var th = Thread.decodeFromJson(st);
                // console.log(this.res[0].name === th.res[0].name);
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
            });
    }
    stringify(): string {
        return JSON.stringify(this);
    }
    static decodeFromJson(data: any) {
        var data = JSON.parse(data);
        let thread = new Thread();
        thread.bookmark = data.bookmark;
        thread.url = data.url;
        var resdata = [];
        for (var i in data.res) {
            var decode = Res.decodeFromJson(JSON.stringify(data.res[i]));
            resdata.push(decode);
        }
        thread.res = resdata;
        return thread;
    }
}

export default Thread;
// [レス番号]<>[名前]<>[メール]<>[日付]<>[本文]<>[スレッドタイトル]<>[ID]
export class Res {
    num: number;
    name: string;
    mail: string;
    date: string;
    text: string;
    title: string;
    id: string;
    constructor() {

    }
    static decodeFromJson(data: any) {
        var data = JSON.parse(data);
        let res = new Res();
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

let url = "http://jbbs.shitaraba.net/bbs/read.cgi/netgame/8845/1478777435/";
var t = new Thread(url);
t.request();