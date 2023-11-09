const { app, BrowserWindow, screen } = require('electron');
const url = require("url");
const path = require("path");

let mainWindow;
let loadingWindow;

function createLoadingWindow() {
    loadingWindow = new BrowserWindow({
        width: 700,
        height: 700,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    loadingWindow.loadFile('./dist/chatappstinger/assets/animations/loading-animation.gif');
    loadingWindow.once('ready-to-show', () => {
        loadingWindow.show();
    });
}

function createMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        show: false,
        width: width - 200,
        height: height,
        minWidth: width - 200,
        minHeight: height,
        icon: "./dist/chatappstinger/assets/icons/app-icon.ico",
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/chatappstinger/index.html`),
            protocol: "file:",
            slashes: true
        })
    );
    mainWindow.webContents.once('dom-ready', () => {
        setTimeout(() => {
            mainWindow.show();
            if (loadingWindow) {
                loadingWindow.hide();
                loadingWindow.close();
            }
        }, 2500);
    });

    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });
}

app.on('ready', () => {
    createLoadingWindow();
    createMainWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createMainWindow();
});