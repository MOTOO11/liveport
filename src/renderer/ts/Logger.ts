export default class Logger {
    static log(label: string, message: string) {
        console.log("[%s]:%s", label, message);
    }
}