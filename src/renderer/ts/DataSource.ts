import Message from "./Message"
export abstract class DataSource {
    messages: Message[] = [];
    url: string = "";
    bookmark: number = 0;
    title: string = "";
    constructor(url: string) {
        this.url = url;
    }

    abstract request(success: (boolean) => void, failed: (err: any) => void);
    abstract data2json(data: string): number;

    allNum() {
        return this.messages.length;
    }

    next() {
        this.bookmark++;
        this.save();
    }

    latest() {
        this.bookmark = this.allNum();
        this.save();
    }

    load(): boolean {
        var thread = DataSource.loadDataSource(this.url);
        if (thread == null) {
            console.log("new thread.")
            return false;
        }
        console.log("read thread from localstorage.")
        this.decodeFromJson(thread);
        return true;
    }

    decodeFromJson(data: any) {
        var data = JSON.parse(data);
        this.bookmark = data.bookmark;
        this.url = data.url;
        this.title = data.title;
        var resdata = [];
        for (var i in data.messages) {
            var decode = Message.decodeFromJson(JSON.stringify(data.messages[i]));
            resdata.push(decode);
        }
        this.messages = resdata;
    }

    sortMessage() {
        this.messages.sort((n1, n2) => {
            if (n1.num < n2.num) {
                return -1;
            }
            if (n1.num > n2.num) {
                return 1;
            }
            return 0;
        });
    }

    save() {
        localStorage.setItem(this.url, this.stringify());
    }
    stringify(): string {
        return JSON.stringify(this);
    }


    static loadDataSource(url: string) {
        return localStorage.getItem(url);
    }

    static clearDataSource(url: string) {
        localStorage.removeItem(url);
    }
    static clearAllDataSource(url: string) {
        localStorage.clear();
    }
}
