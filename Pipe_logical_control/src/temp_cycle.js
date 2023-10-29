const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
    console.log('Connected');
    client.subscribe('ARQUI2_G18/actuadores/ventilador', (err) => {
        if (err) console.log(err);
    });

    client.subscribe('ARQUI2_G18/sensores/temperatura', (err) => {
        if (err) console.log(err);
    });
});

let temperaturaAlta = false;
let ventiladorEncendido = false;
let timer;

client.on('message', (topic, message) => {
    switch (topic) {
        case 'ARQUI2_G18/actuadores/ventilador':
            handleVentilador(message);
            break;
        case 'ARQUI2_G18/sensores/temperatura':
            handleTemperatura(message);
            break;
    }
});

function handleVentilador(message) {
    if (message.toString() === '0') {
        ventiladorEncendido = false;
        console.log('Ventilador apagado');
    }
    else if (message.toString() === '1' || message.toString() === '2') {
        ventiladorEncendido = true;
        console.log('Ventilador encendido');
    }
}

function handleTemperatura(message) {
    const temperatura = parseFloat(message.toString());

    temperaturaAlta = temperatura > 27; // 27.8

    if (temperaturaAlta) {
        console.log('Temperatura alta');
        timerControl();
    } else {
        console.log('Temperatura adecuada');
        clearTimeout(timer);
        timer = null;
        
    }
}

function timerControl() {
    if (!timer) {
        console.log('Iniciando timer');
        timer = setTimeout(() => {
            console.log('Timer ejecutado');
            if (temperaturaAlta && !ventiladorEncendido) {
                client.publish('ARQUI2_G18/notifications', 'Temperatura alta y ventilador apagado, se enciende');
                console.log('Notificado: Temperatura alta y ventilador apagado, se enciende');

                timer = setTimeout(() => {
                    client.publish('ARQUI2_G18/actuadores/ventilador', '2');  // Enciende el ventilador a velocidad alta
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
