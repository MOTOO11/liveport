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
            res.latest=true;
            if (res.title) {
                this.title = res.title;
                console.log("new thread title : " + res.title);
            }
            res.id = r[6];
            resArray.push(res);
        }
        this.messages.forEach(element => {
            element.latest = false;
        });
        this.messages = this.messages.concat(resArray);
        this.sortMessage();
        this.save();
        return resArray.length;
    }
    listUrl = "";
    setThreadDetails() {
        if (!this.listUrl && !this.sendUrl) {
            var matches = this.url.match(SHITARABA_REGEX);
            this.listUrl = `http://jbbs.shitaraba.net/${matches[1]}/${matches[2]}/subject.txt`;
            this.DIR = matches[1];
            this.BBS = matches[2];
            this.sendUrl = `http://jbbs.shitaraba.net/bbs/write.cgi/${this.DIR}/${this.BBS}/${this.KEY}`;
        }
    }
    getLists(success: () => void, failed: (err: any) => void) {
        this.setThreadDetails();
        this.threadLists = [];
        console.log("request list url : " + this.listUrl);
        rp({ url: this.listUrl, encoding: null, timeout: 8000 })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                let NewArrivals = this.data2Lists(decoding);
                success();
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                failed(err);
            });
    }
    data2Lists(value: string) {
        var line = value.split(NEWLINE_SPLITTER);
        for (var i = 0; i < line.length - 1; i++) {
            let pattern = new RegExp(/(\d{10})\.cgi,(.+)/, "ig");
            let match = pattern.exec(line[i]);
            var l = new ThreadList();
            l.key = match[1];
            l.title = match[2];
            l.url = `http://jbbs.shitaraba.net/bbs/read.cgi/${this.DIR}/${this.BBS}/${l.key}/`;
            this.threadLists.push(l);
        }
    }

    BBS = "";
    KEY = "";
    DIR = "";
    sendUrl = "";
    sendMessage(message: { MESSAGE: string, NAME: string, MAIL: string }, success: () => void, failed: (err: any) => void) {
        this.setThreadDetails();
        console.log("send url : " + this.sendUrl);
        // message.NAME = iconv.decode(new Buffer(message.NAME, "UTF-8"), "EUC-JP").toString();
        // message.MESSAGE = iconv.decode(new Buffer(message.MESSAGE, "UTF-8"), "EUC-JP").toString();
        // message.MAIL = iconv.decode(new Buffer(message.MAIL, "UTF-8"), "EUC-JP").toString();
        const option = {
            url: this.sendUrl, encoding: null, timeout: 8000,
            // form: {
            //     DIR: this.DIR, BBS: this.BBS, KEY: this.KEY,
            //     NAME: message.NAME, MAIL: message.MAIL, MESSAGE: message.MESSAGE
            // },
            form: {
                DIR: this.DIR, BBS: this.BBS, KEY: this.KEY,
                NAME: "", MAIL: "", MESSAGE: "message"
            }
        };

        // let form = "NAME="+ 
        rp.post(option)
            .then((htmlString) => {
                console.log("send result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                // <b>\n(.+)\n.+\n.+\n(.+)\n.*<\/b>
                let errorPattern = new RegExp(/<b>\n(.+)\n.+\n.+\n(.+)\n.*<\/b>/, "ig")
                //ERROR!! 
                let match = decoding.match(errorPattern);
                if (match) {
                    failed(`${match[2]}`);
                }
                success();
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                failed(err);
            });
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
