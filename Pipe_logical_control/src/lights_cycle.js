const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost');

client.on('connect', () => {
    console.log('Connected');
    client.subscribe('ARQUI2_G18/actuadores/luz',
        function (err) {
            if (err) console.log(err);
        });

    client.subscribe('ARQUI2_G18/sensores/distancia',
        function (err) {
            if (err) console.log(err);
        });
});

let isHumanPresent = false;
let isLightOn = false;
let timer;

client.on('message', (topic, message) => {
    switch (topic) {
        case 'ARQUI2_G18/actuadores/luz':
            handleLight(message);
            break;
        case 'ARQUI2_G18/sensores/distancia':
            handleDistancia(message);
            break;
    }
});

function handleLight(message) {
    if (message.toString() === '0') {
        isLightOn = false;
        console.log('Luz apagada');
    }
    else if (message.toString() === '1') {
        isLightOn = true;
        console.log('Luz encendida');
    }
}


function handleDistancia(message) {
    const distance = parseInt(message.toString());

    isHumanPresent = distance < 6;

    if (!isHumanPresent) {
        console.log('No hay nadie');
        timerControl();
    } else {
        console.log('Hay alguien');
        clearTimeout(timer);
        timer = null;
    }
}

function timerControl() {
    if (!timer) {
        console.log('Iniciando timer');
        timer = setTimeout(() => {
            console.log('Timer ejecutado');
            if (!isHumanPresent && isLightOn) {
                client.publish('ARQUI2_G18/notifications', 'Luz esta encendida y no hay nadie, se apaga');
                console.log('Notificado: Luz esta encendida y no hay nadie, se apaga');

                timer = setTimeout(() => {
                    client.publish('ARQUI2_G18/actuadores/luz', '0');
                    client.publish('ARQUI2_G18/notifications', 'Se apago la luz');
                    console.log('Notificado: Se apago la luz')
                    clearTimeout(timer);
                    timer = null;
                }, 20000);
            } else {
                console.log('No se apaga la luz');
                clearTimeout(timer);
                timer = null;
            }

        }, 20000);
    }

}