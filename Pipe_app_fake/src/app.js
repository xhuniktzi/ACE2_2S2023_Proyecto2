const mqtt = require('mqtt');
const express = require('express');
const cors = require('cors');

const app = express();
const client = mqtt.connect('mqtt://localhost');
const port = 5500;

let stackNotifications = [];

app.use(cors());

// routes
app.get('/wind/v1', (req, res) => {
    console.log('Ventilador velocidad 1');
    client.publish('ARQUI2_G18/actuadores/ventilador', '1');
    res.sendStatus(204);
});

app.get('/wind/v2', (req, res) => {
    console.log('Ventilador velocidad 2');
    client.publish('ARQUI2_G18/actuadores/ventilador', '2');
    res.sendStatus(204);
});

app.get('/wind/off', (req, res) => {
    console.log('Ventilador apagado');
    client.publish('ARQUI2_G18/actuadores/ventilador', '0');
    res.sendStatus(204);
});

app.get('/light/on', (req, res) => {
    console.log('Luz encendida');
    client.publish('ARQUI2_G18/actuadores/luz', '1');
    res.sendStatus(204);
});

app.get('/light/off', (req, res) => {
    console.log('Luz apagada');
    client.publish('ARQUI2_G18/actuadores/luz', '0');
    res.sendStatus(204);
});

app.get('/door/open', (req, res) => {
    console.log('Puerta abierta');
    client.publish('ARQUI2_G18/actuadores/motor', '1');
    res.sendStatus(204);
});

app.get('/door/close', (req, res) => {
    console.log('Puerta cerrada');
    client.publish('ARQUI2_G18/actuadores/motor', '0');
    res.sendStatus(204);
});

app.get('/notifications', (req, res) => {
    res.json(stackNotifications);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


client.on('connect', () => {
    console.log('Conectado al broker MQTT');

    client.subscribe('ARQUI2_G18/notifications', function (err) {
        if (err) console.error(err);
    }
    );
});

client.on('message', (topic, message) => {
    switch (topic) {
        case 'ARQUI2_G18/notifications':
            handleNotifications(message);
            break;
    }
});

function handleNotifications(message) {
    stackNotifications.push(message.toString());
    console.log(message.toString());
}