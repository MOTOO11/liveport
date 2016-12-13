"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import Message from "./Message";
import * as encoding from "encoding-japanese";
import { DataSource, ThreadList } from "./DataSource";
const SHITARABA_REGEX = new RegExp(/http:\/\/jbbs.shitaraba.net\/bbs\/read.cgi\/(\w+)\/(\d+)\/(\d+)\/.*/);
const RES_SPLITTER = new RegExp(/<>/g);
const NEWLINE_SPLITTER = new RegExp(/\n/g);
const DEFAULT_TIMEOUT = 10000;

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
        rp({ url: datUrl, encoding: null, timeout: DEFAULT_TIMEOUT })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                let NewArrivals = this.data2json(decoding);
                success(NewArrivals);
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                if (!err.statusCode) {
                    console.log("send request timeout");
                    failed("タイムアウトしました");
                    return;
                }
                failed("取得に失敗しました");
                return;
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
            res.latest = true;
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
    constructor(url: string) {
        super(url);
        if (Shitaraba.isValidURL(url))
            this.setThreadDetails();
    }
    setThreadDetails() {
        if (!this.listUrl && !this.sendUrl) {
            var matches = this.url.match(SHITARABA_REGEX);
            this.listUrl = `http://jbbs.shitaraba.net/${matches[1]}/${matches[2]}/subject.txt`;
            this.DIR = matches[1];
            this.BBS = matches[2];
            this.KEY = matches[3];
            this.sendUrl = `http://jbbs.shitaraba.net/bbs/write.cgi/${this.DIR}/${this.BBS}/${this.KEY}/`;
        }
    }
    getLists(success: () => void, failed: (err: any) => void) {
        this.setThreadDetails();
        this.threadLists = [];
        console.log("request list url : " + this.listUrl);
        rp({ url: this.listUrl, encoding: null, timeout: DEFAULT_TIMEOUT })
            .then((htmlString) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                this.data2Lists(decoding);
                success();
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                if (!err.statusCode) {
                    console.log("send request timeout");
                    failed("タイムアウトしました");
                    return;
                }
                failed("取得に失敗しました");
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

    urlEncodeUtf8ToEuc = (string) => {
        string = iconv.encode(string, "EUC=JP")
        return encoding.urlEncode(string)
    }

    sendMessage(message: { MESSAGE: string, NAME: string, MAIL: string }, success: (result: string) => void, failed: (err: any) => void) {
        this.setThreadDetails();
        console.log("send url : " + this.sendUrl);
        let form = 'BBS=' + this.urlEncodeUtf8ToEuc(this.BBS) +
            '&KEY=' + this.urlEncodeUtf8ToEuc(this.KEY) +
            '&DIR=' + this.urlEncodeUtf8ToEuc(this.DIR) +
            '&MESSAGE=' + this.urlEncodeUtf8ToEuc(message.MESSAGE) +
            '&MAIL=' + this.urlEncodeUtf8ToEuc(message.MAIL) +
            '&NAME=' + this.urlEncodeUtf8ToEuc(message.NAME);
        const option = {
            url: this.sendUrl, encoding: null, timeout: DEFAULT_TIMEOUT,
            headers: {
                referer: "http://jbbs.shitaraba.net/bbs/read.cgi/netgame/12802/1481207144/"
            },
            form: form
        };

        rp.post(option)
            .then((htmlString) => {
                console.log("send result : ok!");
                var decoding = iconv.decode(htmlString, "EUC-JP")
                let pattern = new RegExp(/<title>(.+)<\/title>/, "ig");
                let match = pattern.exec(decoding);
                success(match[1]);
            })
            .catch((err) => {
                console.log("error...");
                if (!err.statusCode) {
                    console.log("send request timeout");
                    failed("タイムアウトしました");
                    return;
                }
                console.log(err.statusCode);
                let pattern = new RegExp(/(\{.+\})/, "ig");
                let match = err.message.match(pattern);
                let data = JSON.parse(match).data;
                let buffer = new Buffer(data);
                let decoding = iconv.decode(buffer, "EUC-JP")
                pattern = new RegExp(/[ ]+(.+)\n[ ]+<br>\n.+<br>\n[ ]+(.+)/, "ig");
                match = pattern.exec(decoding);
                failed(match[1] + ":" + match[2]);
            });
    }

    static isValidURL(url: string): boolean {
        return SHITARABA_REGEX.test(url);
    }
}

export default Shitaraba;
