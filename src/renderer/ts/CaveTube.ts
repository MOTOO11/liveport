"use strict"
import * as rp from "request-promise";
import * as  iconv from "iconv-lite";
import Message from "./Message";
import { DataSource } from "./DataSource";
const CAVETUBE_REGEX = new RegExp(/https:\/\/www\.cavelis\.net\/live\/(.+)/);
const DK = "46CBA895366C49938CDEC4308E0DFE6B";

export class CaveTube extends DataSource {
    stream_name: string = "";
    request(success: (number) => void, failed: (err: any) => void) {
        if (!this.url) {
            failed("url is not set");
            return;
        }
        if (!CaveTube.isValidURL(this.url)) {
            failed("not CaveTube url");
            return;
        }
        if (this.stream_name) this.datRequest(success, failed);
        else this.streamNameRequest(success, failed);

    }

    datRequest(success: (number) => void, failed: (err: any) => void) {
        var commentUrl = "http://ws.cavelis.net:3000/comment/" + this.stream_name + "?devkey=" + DK;
        console.log("request comment url : " + commentUrl);
        return rp({ url: commentUrl, timeout: 8000 })
            .then((json) => {
                console.log("request result : ok!");
                let NewArrivals = this.data2json(json);
                success(NewArrivals);
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
                failed(err);
            });
    }

    streamNameRequest(success: (boolean) => void, failed: (err: any) => void) {
        var matches = this.url.match(CAVETUBE_REGEX);
        var streamNameUrl = `https://www.cavelis.net/api/live_url/${matches[1]}`;
        console.log("request stream_name url : " + streamNameUrl);
        rp({ url: streamNameUrl, timeout: 8000 })
            .then((json) => {
                return this.stream_name = JSON.parse(json).stream_name;
            }).then(() => {
                if (!this.stream_name) {
                    failed("this stream is ended");
                }
                console.log("stream_name result : ok!");
                return this.datRequest(success, failed);
            })
            .catch((err) => {
                console.log("error...");
                console.log(err);
            });
    }
    // 新着レスが有る場合はその数を返す
    data2json(data: string): number {
        let comments = JSON.parse(data).comments;
        /* 
            末尾に改行コードがついているので、
            line.lengthは取得したレス+1となっている。
            そのため-1
        */
        var resArray: Message[] = [];
        for (var i in comments) {
            if (+i + 1 > this.messages.length) {
                var res = new Message();
                res.num = comments[i].comment_num;
                res.name = comments[i].name;
                res.mail = "";
                res.date = this.calcDatatime(comments[i].time);
                res.text = comments[i].message;
                res.id = "";
                res.latest = true;
                resArray.push(res);
            }
        }
        this.title = this.url;
        console.log("new thread title : " + this.title);
        this.messages.forEach(element => {
            element.latest = false;
        });
        this.messages = this.messages.concat(resArray);
        this.messages.filter((x, i, self) => self.indexOf(x) === i);
        this.sortMessage();
        // CaveTube may change ID each time
        // this.save();
        return resArray.length;
    }

    calcDatatime(ux: number) {
        var d = new Date(ux);
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
        var min = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
        var sec = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
        return `${year}/${month}/${day} ${hour}:${min}:${sec}`;
    }
    listUrl = "";
    getLists(success: () => void, failed: (err: any) => void) {
        // if (!this.listUrl) this.createListUsrl();
        // console.log("request list url : " + this.listUrl);
        // rp({ url: this.listUrl, encoding: null, timeout: 8000 })
        //     .then((htmlString) => {
        //         console.log("request result : ok!");
        //         var decoding = iconv.decode(htmlString, "EUC-JP")
        //         let NewArrivals = this.data2json(decoding);
        //         success();
        //     })
        //     .catch((err) => {
        //         console.log("error...");
        //         console.log(err);
        //         failed(err);
        //     });
        failed("未実装です");
    }
    createListUsrl(): string {
        return "";
    }
    data2Lists(value: string) {
    }
    sendMessage(message: any, success: (result: string) => void, failed: (err: any) => void) {
        failed("未実装です");
    }

    static isValidURL(url: string): boolean {
        return CAVETUBE_REGEX.test(url);
    }
}

export default CaveTube;
