import Message from "./Message"
abstract class DataSource {
    messages: Message[] = [];
    url: string = "";
    bookmark: number = 0;
    title: string = "";
    constructor(url?: string) {
        if (url) {
            this.url = url;
            this.dataSourceFactory(this.url);
        }
    }

    abstract request(success: (boolean) => void, failed: (err: any) => void);

    allNum() {
        return this.messages.length;
    }

    save() {
        localStorage.setItem(this.url, this.stringify());
    }
    abstract data2json(data: string): number;
    next() {
        this.bookmark++;
        this.save();
    }

    latest() {
        this.bookmark = this.allNum();
        this.save();
    }
    stringify(): string {
        return JSON.stringify(this);
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
        return this;
    }

    dataSourceFactory(url: string): DataSource {
        var thread = DataSource.loadDataSource(url);
        if (thread == null) {
            console.log("new thread url.")
            return;
        }
        console.log("read thread from localstorage url.")
        return this.decodeFromJson(thread);
    }
    static loadDataSource(url: string) {
        return localStorage.getItem(url);
    }
    abstract messageSorter: (value1: number, value2: number) => number;

    static clearDataSource(url: string) {
        localStorage.removeItem(url);
    }
    static clearAllDataSource(url: string) {
        localStorage.clear();
    }
}

export default DataSource;