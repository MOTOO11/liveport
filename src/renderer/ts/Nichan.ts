"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import * as encoding from "encoding-japanese";
import Message from "./Message";
import { DataSource, ThreadList } from "./DataSource";

const ApplicationName = require("../../../package.json").name
const VERSION = require("../../../package.json").version

const NICHAN_THREAD_REGEX = new RegExp(/^https?:\/\/[a-zA-z\-\.0-9]+(?::\d+)?\/test\/read\.cgi\/\w+\/\d+(?:|\/.*)$/);
const NICHAN_BBS_REGEX = new RegExp(/^https?:\/\/[a-zA-z\-\.0-9]+(?::\d+)?\/\w+\/?$/);
const RES_SPLITTER = new RegExp(/<>/g);
const NEWLINE_SPLITTER = new RegExp(/\r?\n/g);
const DEFAULT_TIMEOUT = 10000;

export class Nichan extends DataSource {
    hostPort: string;
    boardDir: string;
    threadNum?: string;
    datBuffer: Buffer = new Buffer(0);

    constructor(url: string) {
        super(url);

        let matches;
        if (matches = /^https?:\/\/([a-zA-z\-\.0-9]+(?::\d+)?)\/test\/read\.cgi\/(\w+)\/(\d+)(?:|\/.*)$/.exec(url)) {
            this.hostPort = matches[1];
            this.boardDir = matches[2];
            this.threadNum = matches[3];
        } else if (matches = /^https?:\/\/([a-zA-z\-\.0-9]+(?::\d+)?)\/(\w+)\/?$/.exec(url)) {
            this.hostPort = matches[1];
            this.boardDir = matches[2];
        } else {
            throw new Error(`Invalid Nichan URL: ${url}`);
        }
    }

    request(success: (number) => void, failed: (err: any) => void) {
        // 板URLがセットされている場合、スレッドの取得はできない。
        if (!this.validateThread().valid) {
            failed(this.validateThread().text);
            return;
        }

        var datUrl = `http://${this.hostPort}/${this.boardDir}/dat/${this.threadNum}.dat`;
        console.log("request dat url : " + datUrl);
        rp({ url: datUrl,
             encoding: null,
             headers: { "Range": `bytes=${this.datBuffer.length}-` },
             resolveWithFullResponse: true,
             timeout: DEFAULT_TIMEOUT })
            .then((res) => {
                console.log(`request result : ${res.statusCode}`);
                if (res.statusCode === 200) {
                    this.datBuffer = res.body;
                } else if (res.statusCode === 206) { // Partial Content
                    console.log(`Concatenating buffer ${this.datBuffer.length} + ${res.body.length}`);
                    this.datBuffer = Buffer.concat([this.datBuffer, res.body]);
                } else {
                    failed(`${res.statusCode}：不明なステータスコード`);
                    return;
                }
                let newArrivals = this.data2json(iconv.decode(this.datBuffer, "CP932"));
                success(newArrivals);
            })
            .catch((err) => {
                if (err.statusCode === 416) { // Requested Range Not Satisfiable
                    console.log(`request result : ${err.statusCode}`);
                    success(0);
                } else {
                    console.log("error...", err);
                    failed(`${err.statusCode} : 取得に失敗しました`);
                }
            });
    }

    data2json(data: string): number {
        var line = data.split(NEWLINE_SPLITTER);
        var resArray: Message[] = [];
        var oldMessageCount = this.messages.length;
        for (var i = 0; i < line.length - 1; i++) {
            var r = line[i].split(RES_SPLITTER);
            var res = new Message();
            let num = i+1;
            let name = r[0];
            let mail = r[1];
            let date = r[2];
            let text = r[3];
            let title = r[4];
            let latest = (i + 1) > oldMessageCount;
            let id = "";

            // 本文のフォーマットをしたらばの仕様に合わせる。
            text = text.replace(/^ | $/g, "").replace(/ <br> /g, "<br>");

            let matches;
            if (matches = /(.*?) ID:(.+)$/.exec(date)) {
                date = matches[1];
                id = matches[2];
            }

            res.setParameters(num, name, mail, date, text, title, id, latest);
            if (res.title) {
                this.title = res.title;
                console.log("new thread title : " + res.title);
            }
            resArray.push(res);
        }
        this.messages = resArray;
        this.sortMessage();
        this.save();
        return resArray.length - oldMessageCount;
    }

    getLists(success: () => void, failed: (err: any) => void) {
        this.threadLists = [];
        var listUrl = `http://${this.hostPort}/${this.boardDir}/subject.txt`;
        console.log("request list url : " + listUrl);
        rp({ url: listUrl, encoding: null, timeout: DEFAULT_TIMEOUT })
            .then((data: Buffer) => {
                console.log("request result : ok!");
                var decoding = iconv.decode(data, "CP932")
                this.data2Lists(decoding);
                success();
            })
            .catch((err) => {
                console.log("error...", err);
                failed(`${err.statusCode} : 取得に失敗しました`);
            });
    }

    // subject.txtの内容をパースして threadLists に ThreadList オブジェクトを追加する。
    data2Lists(value: string) {
        var line = value.split(NEWLINE_SPLITTER);
        for (var i = 0; i < line.length - 1; i++) {
            let pattern = new RegExp(/^(\d+)\.dat<>(.+)$/, "ig");
            let match = pattern.exec(line[i]);
            var l = new ThreadList();
            l.key = match[1];
            l.title = match[2];
            l.url = `http://${this.hostPort}/test/read.cgi/${this.boardDir}/${l.key}/`;
            this.threadLists.push(l);
        }
    }

    sjisUrlEncoded = (string) => {
        return encoding.urlEncode(iconv.encode(string, "CP932"))
    }

    sendMessage(message: { MESSAGE: string, NAME: string, MAIL: string }, success: (result: string) => void, failed: (err: any) => void) {
        if (!this.validateThread().valid) {
            failed(this.validateThread().text);
            return;
        }

        var sendUrl = `http://${this.hostPort}/test/bbs.cgi`;
        console.log("send url : " + sendUrl);
        let form = 'bbs=' + this.sjisUrlEncoded(this.boardDir) +
            '&key=' + this.sjisUrlEncoded(this.threadNum) +
            '&MESSAGE=' + this.sjisUrlEncoded(message.MESSAGE) +
            '&mail=' + this.sjisUrlEncoded(message.MAIL) +
            '&FROM=' + this.sjisUrlEncoded(message.NAME) +
            '&submit=' + this.sjisUrlEncoded("書き込む");
        const option = {
            url: sendUrl,
            encoding: null,
            timeout: DEFAULT_TIMEOUT,
            headers: {
                referer: this.url,
                "User-Agent": `${ApplicationName}/${VERSION}`
            },
            form: form
        };

        rp.post(option)
            .then((data: Buffer) => {
                console.log("send result : ok!");
                let match = /<title>(.+)<\/title>/ig.exec(iconv.decode(data, "CP932"));
                success(match[1]);
            })
            .catch((err) => {
                console.log("error...", err);
                failed("投稿失敗");
            });
    }

    getSetting(success: () => void, failed: (err: any) => void) {
        let settingUrl = `http://${this.hostPort}/${this.boardDir}/SETTING.TXT`;
        console.log("request setting url : " + settingUrl);
        rp({ url: settingUrl, encoding: null, timeout: DEFAULT_TIMEOUT })
            .then((data: Buffer) => {
                console.log("request result : ok!");
                let str = iconv.decode(data, "CP932")
                console.log("result : " + str);
                let matches = str.match(/BBS_TITLE=(.+)/);
                if (matches.length > 0) {
                    this.parentTitle = matches[1];
                    console.log("bbs title : " + matches[1]);
                    this.save();
                    success();
                } else {
                    failed("BBSタイトルの取得に失敗しました");
                }
            })
            .catch((err) => {
                console.log("error...", err);
                failed(`${err.statusCode} : BBSタイトルの取得に失敗しました`);
            });
    }

    validateThread(): { valid: boolean, text: string } {
        if (!this.url) {
            return { valid: false, text: "URLが設定されていません" };
        }
        if (Nichan.isValidBBSURL(this.url)) {
            return { valid: false, text: "掲示板のURLが選択されていません" };
        }
        if (!Nichan.isValidThreadURL(this.url)) {
            return { valid: false, text: "掲示板のURLが選択されていません" };
        }
        return { valid: true, text: "" };
    }

    static isValidThreadURL(url: string): boolean {
        return NICHAN_THREAD_REGEX.test(url);
    }
    static isValidBBSURL(url: string): boolean {
        return NICHAN_BBS_REGEX.test(url);
    }
}
export default Nichan;
