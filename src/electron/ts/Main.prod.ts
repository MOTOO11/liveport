const electron = require('electron');
const fs = require('fs');
import { shell } from 'electron';
const path = require('path')
import * as url from "url";
const BrowserWindow: typeof Electron.BrowserWindow = electron.BrowserWindow;
const app: Electron.App = electron.app;
const port = require("../config.json").port;
const info_path = "./bounds.json";
process.env.NODE_ENV = "production";

let argv = [];
var ipcMain = require('electron').ipcMain;
ipcMain.on('argv', (event) => {
    event.returnValue = argv;
});

class Main {
    mainWindow: Electron.BrowserWindow = null;
    constructor(public app: Electron.App) {
        argv = process.argv;
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
        this.mainWindow = new BrowserWindow({
            icon: __dirname + '/assets/icon/favicon.png'
        });
        let bounds_info;
        try {
            bounds_info = JSON.parse(fs.readFileSync(info_path, 'utf8'));
        }
        catch (e) { }
        if (bounds_info)
            this.mainWindow.setBounds(bounds_info);
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
        this.mainWindow.on('close', () => {
            try {
                fs.writeFileSync(info_path, JSON.stringify(this.mainWindow.getBounds()));
            } catch (e) { }
        });
        this.mainWindow.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
        });
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
    socket.on('aa', function (msg) {
        socketio.emit('aa', msg);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});
const myapp = new Main(app);