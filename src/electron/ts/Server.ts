
import * as Express from "express";
import * as Http from "http";
import * as sio from "socket.io";
export class Server {
    http: Http.Server;
    express: Express.Express;
    socketio: SocketIO.Server;
    port: number;
    constructor(port: number) {
        this.port = port;
    }
    init() {
        this.express = Express();
        this.http = Http.createServer(this.express);
        this.socketio = sio(this.http);
        this.express.get('/', (req, res) => {
            res.sendFile(__dirname + '/browser/html/browser.html');
        });
        this.express.use("/js", Express.static(__dirname + '/browser/js'));
        this.socketio.on('connection', (socket) => {
            socket.on('message', (msg) => {
                this.socketio.emit('message', msg);
            });
            socket.on('aa', (msg) => {
                this.socketio.emit('aa', msg);
            });
        });
    }

    start(portNum: number = this.port): boolean {
        if (this.http && this.http.listening) {
            this.stop();
            console.log("restart server");
        }
        this.init();
        try {
            this.port = portNum;
            this.http.listen(this.port, () => {
                console.log('server listening on *:%s', this.port);
            });
        } catch (e) {
            console.log('server listening failed on *:%s', this.port);
            return false;
        }
        return true;
    }

    stop() {
        console.log("stop server");
        this.http.close(() => {
            console.log("close server")
        });
        try {
            this.http.listen(this.port, () => {
                console.log('dummy server listening on *:%s closing soon', this.port);
                this.http.close();
            });
        } catch (e) {
            console.log('dummy server listening failed if alredy server on *:%s', this.port);
            return false;
        }
    }

    listening() {
        return this.http.listening;
    }
}

export default Server;