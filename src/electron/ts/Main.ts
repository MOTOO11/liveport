const electron = require('electron');
const path = require('path')
import * as url from "url";
const client = require('electron-connect').client;
const BrowserWindow: typeof Electron.BrowserWindow = electron.BrowserWindow;
const app: Electron.App = electron.app;

class Main {
    mainWindow: Electron.BrowserWindow = null;
    constructor(public app: Electron.App) {
        this.app.on('ready', this.onReady);
        this.app.on("window-all-closed", () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
        this.app.on('activate', function () {
            if (this.mainWindow === null) {
                this.createWindow();
            }
        });
    }

    onReady() {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({ width: 800, height: 600 });
        // disable menubar.
        this.mainWindow.setMenu(null);
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "renderer", "html", 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        //   Open the DevTools.
        this.mainWindow.webContents.openDevTools();
    }
}

var express = require("express");
var Express = express();
var http = require('http').Server(Express);
var socketio = require('socket.io')(http);
Express.get('/', function (req, res) {
    res.sendFile(__dirname + '/browser/html/browser.html');
});
Express.use("/js", express.static(__dirname + '/browser/js'));
socketio.on('connection', function (socket) {
    socket.on('message', function (msg) {
        socketio.emit('message', msg);
    });
    socket.on('resize', function (msg) {
        socketio.emit('resize', msg);
    });
    socket.on('aa', function (msg) {
        socketio.emit('aa', msg);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
const myapp = new Main(app);
client.create(myapp.mainWindow);