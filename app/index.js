const { app, BrowserWindow } = require('electron');

let mainWindow = null;

//ejecuta cuando mi app esta lista
app.on('ready', () => {
    //se puede personalizar lagoy ancho. Sino la crea por defecto
    mainWindow = new BrowserWindow({
        icon: __dirname + '/favicon.ico',
        webPreferences: {
            //integra funcionalidades de node en la venta de la app. ej: __dirname
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });
    mainWindow.loadFile(__dirname + '/index.html');
});
