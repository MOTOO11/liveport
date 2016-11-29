export default class Logger {
    static log(label: string, message: any) {
        if (process.env.NODE_ENV !== "production")
            console.log("[%s]:%s", label, message);
    }
}