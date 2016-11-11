const electron = require('electron');
const path = require('path')
// const url = require('url')
import * as url from "url";
// const client = require('electron-connect').client;
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
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, "renderer","html", 'index.html'),
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

var Express = require("express")();
var http = require('http').Server(Express);
var socketio = require('socket.io')(http);
Express.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/browser.html');
});
Express.get('/js/browser.bundle.js', function (req, res) {
    res.sendFile(__dirname + '/js/browser.bundle.js');
});
socketio.on('connection', function (socket) {
    socket.on('message', function (msg) {
        socketio.emit('message', msg);
    });
    // socket.on('message', function (msg) {
    //     socketio.emit('message', msg);
    // });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});
const myapp = new Main(app);
// client.create(myapp.mainWindow);