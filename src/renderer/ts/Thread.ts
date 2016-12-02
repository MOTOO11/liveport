"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import Message from "./Message";
import DataSource from "./DataSource";
const URL = "http://jbbs.shitaraba.net/bbs/read.cgi/netgame/12802/1478775754/";
const SHITARABA_REGEX = new RegExp(/http:\/\/jbbs.shitaraba.net\/bbs\/read.cgi\/(\w+)\/(\d+)\/(\d+)\/.*/);
const RES_SPLITTER = new RegExp(/<>/g);
const NEWLINE_SPLITTER = new RegExp(/\n/g);

export class Thread extends DataSource {
    request(success: (boolean) => void, failed: (err: any) => void) {
        var url = URL;
        if (Thread.isShitarabaURL(this.url)) {
            url = this.url;
        }
        var matches = url.match(SHITARABA_REGEX);
        var datUrl = `http://jbbs.shitaraba.net/bbs/rawmode.cgi/${matches[1]}/${matches[2]}/${matches[3]}/` + (this.messages.length + 1) + "-";
        console.log("request dat url : " + datUrl);
        rp({ url: datUrl, encoding: null, timeout: 8000 })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                let NewArrivals = this.data2json(decoding);
                success(NewArrivals);
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                failed(err);
            });
    }
    // 新着レスが有る場合はその数を返す
    data2json(data: string): number {
        var line = data.split(NEWLINE_SPLITTER);
        /* 
            末尾に改行コードがついているので、
            line.lengthは取得したレス+1となっている。
            そのため-1
        */
        var resArray: Message[] = [];
        for (var i = 0; i < line.length - 1; i++) {
            var r = line[i].split(RES_SPLITTER);
            var res = new Message();
            res.num = +r[0];
            res.name = r[1];
            res.mail = r[2];
            res.date = r[3];
            res.text = r[4];
            res.title = r[5];
            if (res.title) {
                this.title = res.title;
                console.log("new thread title : " + res.title);
            }
            res.id = r[6];
            resArray.push(res);
            resArray.sort(this.messageSorter);
        }
        this.messages = this.messages.concat(resArray);
        this.messages.sort(this.messageSorter);
        this.save();
        return resArray.length;
    }

    messageSorter = (n1, n2) => {
        if (n1.num < n2.num) {
            return -1;
        }
        if (n1.num > n2.num) {
            return 1;
        }
        return 0;
    }

    static isShitarabaURL(url: string): boolean {
        return SHITARABA_REGEX.test(url);
    }

    static decodeFromJson(data: any) {
        var data = JSON.parse(data);
        let thread = new Thread();
        thread.bookmark = data.bookmark;
        thread.url = data.url;
        thread.title = data.title;
        var resdata = [];
        for (var i in data.messages) {
            var decode = Message.decodeFromJson(JSON.stringify(data.messages[i]));
            resdata.push(decode);
        }
        thread.messages = resdata;
        return thread;
    }

    static threadFactory(url: string): Thread {
        var thread = Thread.loadThread(url);
        if (thread == null) {
            console.log("new thread url.")
            return new Thread(url);
        }
        console.log("read localstorage url.")
        return Thread.decodeFromJson(thread);
    }

    static loadThread(url: string) {
        return localStorage.getItem(url);
    }
    static clearThread(url: string) {
        localStorage.removeItem(url);
    }
    static clearAllThread(url: string) {
        localStorage.clear();
    }
}

export default Thread;
