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
        if (!this.url) {
            failed("url is not set");
            return;
        }
        if (!Thread.isShitarabaURL(this.url)) {
            failed("not shitaraba url");
            return;
        }
        var matches = this.url.match(SHITARABA_REGEX);
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
        }
        this.messages = this.messages.concat(resArray);
        this.sortMessage();
        this.save();
        return resArray.length;
    }

    static isShitarabaURL(url: string): boolean {
        return SHITARABA_REGEX.test(url);
    }
}

export default Thread;
