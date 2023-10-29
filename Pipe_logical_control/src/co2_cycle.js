const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
    console.log('Connected');
    client.subscribe('ARQUI2_G18/actuadores/ventilador', (err) => {
        if (err) console.log(err);
    });

    client.subscribe('ARQUI2_G18/sensores/CO2', (err) => {
        if (err) console.log(err);
    });
});

let aireLimpio = true;
let ventiladorEncendido = false;
let timer;

client.on('message', (topic, message) => {
    switch (topic) {
        case 'ARQUI2_G18/actuadores/ventilador':
            handleVentilador(message);
            break;
        case 'ARQUI2_G18/sensores/CO2':
            handleCO2(message);
            break;
    }
});

function handleVentilador(message) {
    if (message.toString() === '0') {
        ventiladorEncendido = false;
        console.log('Ventilador apagado');
    } else if (['1', '2'].includes(message.toString())) {
        ventiladorEncendido = true;
        console.log('Ventilador encendido');
    }
}

function handleCO2(message) {
    const co2 = parseFloat(message.toString());
    aireLimpio = co2 <= 200; // 180

    if (!aireLimpio) {
        console.log('Calidad del aire deficiente');
        timerControl();
    } else {
        console.log('Calidad del aire óptima');
        clearTimeout(timer);
        timer = null;

    }
}

function timerControl() {
    if (!timer) {
        console.log('Iniciando timer');
        timer = setTimeout(() => {
            console.log('Timer ejecutado');
            if (!aireLimpio && !ventiladorEncendido) {
                client.publish('ARQUI2_G18/notifications', 'Ventilador está apagado y calidad del aire deficiente, se enciende');
                console.log('Notificado: Ventilador está apagado y calidad del aire deficiente, se enciende')

                timer = setTimeout(() => {
                    client.publish('ARQUI2_G18/actuadores/ventilador', '1');
                    client.publish('ARQUI2_G18/notifications', 'Ventilador encendido');
                    console.log('Notificado: Ventilador encendido');
                    clearTimeout(timer);
                    timer = null;
                }, 20000);
            } else {
                console.log('No se enciende el ventilador');
                clearTimeout(timer);
                timer = null;
            }

        }, 20000);
    }
}