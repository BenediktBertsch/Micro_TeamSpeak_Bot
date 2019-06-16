//Load Config
const config = require('./config.json')
//For Botmonitoring
const express = require('express')
const app = express()
var logdata = []
var log = "Bot Started... </br>"
//To communicate with the API
var request = require('requestretry')
//Teamspeak
const teamspeak = require('ts3-nodejs-library')
process.setMaxListeners(0)
require('events').EventEmitter.defaultMaxListeners = 0
const hostadress = process.env.APIhost + ':' + process.env.APIport + '/' + config.api.version
//Log into the Query
const ts3 = new teamspeak({
    host: process.env.TShost,
    queryport: parseInt(process.env.TSqueryport, 10),
    serverport: parseInt(process.env.TSserverport, 10),
    username: process.env.TSqueryusername,
    password: process.env.TSquerypassword,
    nickname: process.env.TSnickname,
    keepalive: config.bot.settings.keepalive
})

//If a Client connects
ts3.on("clientconnect", async ev => {
    try {
        const client = ev.client
        const clients = await ts3.clientList({
            client_type: 0
        })
        request.post({
            url: 'http://' + hostadress + '/usercount?counter=' + clients.length,
            maxAttempts: 5,
            retryDelay: 5000,
            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
        }, function (err, httpResponse, body) {
            if (err) { console.log(err.message) }
        })
        request.post({
            url: 'http://' + hostadress + '/userlog?uid=' + client._static.uid,
            maxAttempts: 5,
            retryDelay: 5000,
            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
        }, function (err, httpResponse, body) {
            if (err) { console.log(err.message) } else {
                if ('{"message":"User added."}' == body) {
                    client.message('Hallo ' + client.getCache().client_nickname + ', du kannst dich ab sofort mit "!register deinbenutzername deinpasswort" dich registrieren und dadurch deine auf dem Server verbrachte Zeit protokollieren lassen. Dazu musst du in diesem Chat das genannte Command ausführen. Anschließend kannst du auf https://xaviius.de dich mit diesen Daten einloggen.')
                }
            }
        })
        request.post({
            url: 'http://' + hostadress + '/logadd?uid=' + client._static.uid + '&type=c',
            maxAttempts: 5,
            retryDelay: 5000,
            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
        }, function (err, httpResponse, body) {
            if (err) { console.log(err.message) }
        })
        logadd(`Client ${client.getCache().client_nickname} connected`)
    } catch (error) {
        console.log(error)
    }
})
//If a client disconnects
ts3.on("clientdisconnect", ev => {
    try {
        const client = ev.client
        request.post({
            url: 'http://' + hostadress + '/logadd?uid=' + client.client_unique_identifier + '&type=d',
            maxAttempts: 5,
            retryDelay: 5000,
            retrySrategy: request.RetryStrategies.HTTPOrNetworkError
        }, function (err, httpResponse, body) {
            if (err) { console.log(err.message) }
        })
        logadd(`Client ${client.client_nickname} disconnected`)
    } catch (error) {
        console.log(error)
    }
})
//If the connection is ready, register those events
ts3.on("ready", async () => {
    try {
        Promise.all([
            ts3.registerEvent("server"),
            ts3.registerEvent("channel", 0),
            ts3.registerEvent("textserver"),
            ts3.registerEvent("textchannel"),
            ts3.registerEvent("textprivate")
        ]).then(() => {
            logadd("Subscribed to all Events")
            console.log("Subscribed to all Events")
        }).catch(e => {
            console.log("CATCHED", e.message)
        })
    } catch (error) {
        console.log(error)
    }
});
//If the Client sends a message to the Bot
ts3.on("textmessage", async ({ msg, invoker }) => {
    try {
        logadd(invoker._propcache.client_nickname + " " + msg)
        logadd(invoker._propcache.client_nickname + " " + msg)
        const clients = await ts3.clientList({
            client_type: 0
        })
        clients.forEach(client => {
            if (client.getCache().client_nickname == invoker._propcache.client_nickname) {
                var group;
                switch (invoker._propcache.client_servergroups[0]) {
                    case 6: group = 'Administrator'
                        break;
                    case 7: group = 'User'
                        break;
                    case 8: group = 'New Fags'
                        break;
                    case 9: group = 'Hagenbims'
                        break;
                }
                if (msg.toLowerCase().includes('!help')) {
                    client.message("Du kannst dich mit '!register deinbenutzername deinpasswort' registrieren, mit diesen Daten kannst du dich dann auf der Webseite einloggen.")
                } else {
                    if (msg.toLowerCase().includes('!register')) {
                        var tempmsg = msg.split(" ");
                        if (tempmsg[1] != undefined && tempmsg[2] != undefined) {
                            if (tempmsg[1].length >= 5) {
                                if (tempmsg[2].length >= 5) {
                                    request.post({
                                        url: 'http://' + hostadress + '/register?username=' + tempmsg[1] + '&uid=' + invoker._propcache.client_unique_identifier + '&password=' + tempmsg[2] + '&rank=' + group,
                                        maxAttempts: 5,
                                        retryDelay: 5000,
                                        retrySrategy: request.RetryStrategies.HTTPOrNetworkError
                                    }, function (err, httpResponse, body) {
                                        if (err) { console.log(err.message) }
                                        else {
                                            if (body == '{"message":"Username already taken."}') {
                                                client.message("Benutzername bereits vergeben.")
                                            }
                                            if (body == '{"message":"An user with this TeamSpeak ID is already registered."}') {
                                                client.message("Du hast dich bereits registriert.")
                                            }
                                            if (body == '{"message":"User registered."}') {
                                                client.message("Du hast dich erfolgreich registriert.")
                                            }
                                        }
                                    })
                                } else {
                                    client.message("Passwort muss mindestens 5 Zeichen enthalten! Für mehr Informationen !help")
                                }
                            } else {
                                client.message("Benutzername muss mindestens 5 Zeichen enthalten! Für mehr Informationen !help")
                            }
                        } else {
                            client.message("Falsche Eingabe! Für mehr Informationen !help")
                        }
                    }
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
})
//If the Connection is established
ts3.on("ready", async () => {
    try {
        //Get all non query clients
        const clients = await ts3.clientList({ client_type: 0 })
        clients.forEach(client => {
            //this will send an object with the change
            client.on("update#client_nickname", change => {
                logadd("Nickname changed", change.from, "=>", change.to)
                console.log("Nickname changed", change.from, "=>", change.to)
            })
        })
        //create a check interval in order to cyclic check for changes
        //the library will handle the rest of it
        setInterval(() => ts3.clientList(), 2000)
    } catch (error) {
        console.log(error)
    }
})
ts3.on("error", e => {
    console.log("Error", e.message)
})
ts3.on("close", e => {
    console.log("Connection has been closed!", e)
})
//Webserver monitoring
function logadd(log) {
    logdata.push(log, '</br>')
}
app.get('/', function (req, res) {
    log = '';
    for (var i = 0; i < logdata.length; i++) {
        log += logdata[i]
    }
    res.send(log)
})
app.listen(process.env.runningPort);