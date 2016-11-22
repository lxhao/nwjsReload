var fs = require("fs");
var gui = require('nw.gui');

function main() {
    var OSX = process.platform === "darwin";
    var userHomeFolder = OSX ? process.env.HOME : process.env.USERPROFILE;
    var mainWindow = nw.Window.get(),
        trayIcon = OSX ? 'menubar@2x.png' : 'icon.png',
        trayIconOffline = OSX ? 'offline@2x.png' : 'icon-offline.png',
        trayIconMissed = OSX ? 'missed@2x.png' : 'missed.png';

    process.on('uncaughtException', function (err) {
        console.error('uncaughtException:', err);
        console.error(err.stack);
    });

    function showDevTools() {
        mainWindow.showDevTools();
    }

    function quit() {
        nw.App.quit();
    }

    var tray = new nw.Tray({icon: trayIconOffline});
    var menu = new nw.Menu();

    menu.append(new nw.MenuItem({label: 'Show Console', click: showDevTools}));
    menu.append(new nw.MenuItem({label: 'Quit', click: quit}));
    tray.menu = menu;
    var windowProperties = {
        width: nw.App.manifest.window.width,
        height: nw.App.manifest.window.height,
        min_width: nw.App.manifest.window.min_width,
        min_height: nw.App.manifest.window.min_height
    };

    console.log("test for printing logs");
    function openAppWindow() {
        //加载编辑器页面
        nw.Window.open(nw.App.manifest.onlineURL, windowProperties, function (win) {
            win.on('close', function (shouldQuit) {
                if (shouldQuit) {
                    nw.App.quit();
                    gui.App.unregisterGlobalHotKey(shortcut);
                } else {
                    win.hide()
                }
            });
            nw.App.on('reopen', function () {
                win.show();
            });
            tray.on('click', function () {
                win.show();
            });
            win.window.onload = function () {
                win.maximize();
                setTimeout(function () {
                    win.window.location.href = nw.App.manifest.onlineURL;
                }, 5000);
            };
            //设置刷新快捷键
            var option = {
                key: "Ctrl+R",
                active: function () {
                    win.reload();
                },
                failed: function (msg) {
                    console.log(msg);
                }
            };
            var shortcut = new gui.Shortcut(option);
            gui.App.registerGlobalHotKey(shortcut);
        });
    }

    openAppWindow();
}

if (window.process) {
    main();
}
