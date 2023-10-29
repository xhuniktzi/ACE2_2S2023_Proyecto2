const { SerialPort } = require('serialport');
const mqtt = require('mqtt');
const { ReadlineParser } = require("@serialport/parser-readline");

const client = mqtt.connect('mqtt://localhost');

const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600
});

const parser = new ReadlineParser({ delimiter: "\r\n" });

let stateLuz = '0';
let stateVentilador = '0';
let stateMotor = '0';

port.pipe(parser);

port.on('open', () => {
    console.log('Puerto serial abierto');
});

parser.on('data', (data) => {
    console.log('Raw input: ', data);
    const [T, C, L, D] = data.split('|');
    console.log('Data: ', T, C, L, D);
    
    client.publish('ARQUI2_G18/sensores/temperatura', T);
    client.publish('ARQUI2_G18/sensores/CO2', C);
    client.publish('ARQUI2_G18/sensores/luz', L);
    client.publish('ARQUI2_G18/sensores/distancia', D);

    console.log(`Enviando datos de actuadores: ${stateLuz}${stateVentilador}${stateMotor}\n`);
    port.write(`${stateLuz}${stateVentilador}${stateMotor}\n`, (err) => {
        if (err) console.error(err);
    });
});



client.on('connect', () => {
    console.log('Conectado al broker MQTT');

    client.subscribe('ARQUI2_G18/actuadores/luz', function (err) {
        if (err) console.error(err);
    }
    );

    client.subscribe('ARQUI2_G18/actuadores/ventilador', function (err) {
        if (err) console.error(err);
    }
    );

    client.subscribe('ARQUI2_G18/actuadores/motor', function (err) {
        if (err) console.error(err);
    }
    );

});

client.on('message', (topic, message) => {
    switch (topic) {
        case 'ARQUI2_G18/actuadores/luz':
            console.log('Luz: ', message.toString());
            stateLuz = message.toString();
            break;
        case 'ARQUI2_G18/actuadores/ventilador':
            console.log('Ventilador: ', message.toString());
            stateVentilador = message.toString();
            break;
        case 'ARQUI2_G18/actuadores/motor':
            console.log('Motor: ', message.toString());
            stateMotor = message.toString();
            break;
    }
});