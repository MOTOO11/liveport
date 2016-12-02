import Message from "./Message"
abstract class DataSource {
    messages: Message[] = [];
    url: string = "";
    bookmark: number = 0;
    // threadFactory(url: string);
    title: string = "";
    constructor(url?: string) {
        if (url) this.url = url;
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
    abstract messageSorter: (value1:number,value2:number) => number;
}

export default DataSource;