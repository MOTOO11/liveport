"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import Message from "./Message";
import { DataSource, ThreadList } from "./DataSource";
const SHITARABA_REGEX = new RegExp(/http:\/\/jbbs.shitaraba.net\/bbs\/read.cgi\/(\w+)\/(\d+)\/(\d+)\/.*/);
const RES_SPLITTER = new RegExp(/<>/g);
const NEWLINE_SPLITTER = new RegExp(/\n/g);

export class Shitaraba extends DataSource {
    request(success: (number) => void, failed: (err: any) => void) {
        if (!this.url) {
            failed("url is not set");
            return;
        }
        if (!Shitaraba.isValidURL(this.url)) {
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
    listUrl = "";
    threadList: ThreadList[] = [];
    getLists(success: () => void, failed: (err: any) => void) {
        if (!this.listUrl) {
            var matches = this.url.match(SHITARABA_REGEX);
            this.listUrl = `http://jbbs.shitaraba.net/${matches[1]}/${matches[2]}/subject.txt`;
        }
        console.log("request list url : " + this.listUrl);
        rp({ url: this.listUrl, encoding: null, timeout: 8000 })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                let NewArrivals = this.list2Json(decoding);
                success();
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                failed(err);
            });
    }
    list2Json(value: string) {
        var line = value.split(NEWLINE_SPLITTER);
        let pattern = new RegExp(/(\n){10}\.cgi,(\w+)/, "ig");
        line.forEach(element => {
            let match = element.match(pattern);
            var l = new ThreadList();
            l.url = match[0];
            l.title = match[1];
            this.threadList.push(l);
        });
        //1480790278.cgi,ガンジー205(739)
        this.threadList.sort((n1, n2) => {
            if (n1.name < n2.name) {
                return -1;
            }
            if (n1.name > n2.name) {
                return 1;
            }
            return 0;
        });
    }


    data2Lists(value: string) {

    }
    sendMessage(success: () => void, failed: (err: any) => void) {
        var matches = this.url.match(SHITARABA_REGEX);
        var sendUrl = `http://jbbs.shitaraba.net/bbs/write.cgi/${matches[1]}/${matches[2]}/${matches[3]}/`;
    }

    static isValidURL(url: string): boolean {
        return SHITARABA_REGEX.test(url);
    }
}

export class Send {
    BBS = "";
    KEY = "";
    DIR = "";
    NAME = "";
    MAIL = "";
    MESSAGE = "";
}

export default Shitaraba;
