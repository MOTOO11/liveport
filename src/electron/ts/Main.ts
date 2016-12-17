const electron = require('electron');
const fs = require('fs');
import { shell, ipcMain } from 'electron';
const path = require('path')
import * as url from "url";
const BrowserWindow: typeof Electron.BrowserWindow = electron.BrowserWindow;
const app: Electron.App = electron.app;
const info_path = "./bounds.json";
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
        //   Open the DevTools.
        this.mainWindow.webContents.openDevTools();
    }
}

import { Server } from "./Server";
let server: Server;

ipcMain.on('start-server', (event, arg) => {
    console.log("main : server start on : " + arg);
    try {
        let port = arg;
        if (!server)
            server = new Server(port);
        if (server.start())
            event.sender.send("start", port);
        else {
            event.sender.send("failed");
        }
    } catch (e) {
        console.log(e);
        event.sender.send("failed");
    }
});

ipcMain.on("stop-server", (event, arg) => {
    server.stop();
    console.log("main : server stop");
    event.sender.send("stop")
})

const myapp = new Main(app);

const client = require('electron-connect').client;
client.create(myapp.mainWindow);