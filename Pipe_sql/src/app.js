const mqtt = require('mqtt')
const mysql = require("mysql");

require('dotenv').config()

const client = mqtt.connect('mqtt://localhost');

const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD
});
connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado a la base de datos');
});
// Funcion para parsear las fechas
const getRealDate = () => {
    const date_now = new Date();
    const day_now = date_now.getDate();
    const mont_now = date_now.getMonth() + 1;
    const year_now = date_now.getFullYear();
    return `${year_now}-${mont_now}-${day_now}`;
}

// Funcion para parsear el tiempo
const getRealTime = () => {
    const date_now = new Date();
    const hour_now = date_now.getHours();
    const minute_now = date_now.getMinutes();
    const seconds_now = date_now.getSeconds();
    return `${hour_now}:${minute_now}:${seconds_now}`;
}

const getDateTime = () => {
    const date = getRealDate();
    const time = getRealTime();
    return `${date} ${time}`;
}



const insertarTemperatura = (valor) => {
    const query = "INSERT INTO temperatura (`Value`, `Datetime`) VALUES ?";
    const values = [[valor, getDateTime()]];
    connection.query(query, [values], (err, _result, _fields) => {
        if (err) {
            throw err;
        }

    });
}

const insertarCO2 = (valor) => {
    const query = "INSERT INTO air (`Value`, `Datetime`) VALUES ?";
    const values = [[valor, getDateTime()]];
    connection.query(query, [values], (err, _result, _fields) => {
        if (err) {
            throw err;
        }

    });
}

const insertarLuz = (valor) => {
    const query = "INSERT INTO lumen (`Value`, `Datetime`) VALUES ?";
    const values = [[valor, getDateTime()]];
    connection.query(query, [values], (err, _result, _fields) => {
        if (err) {
            throw err;
        }

    });
}

const insertarDistancia = (valor) => {
    const query = "INSERT INTO proximidad (`Value`, `Datetime`) VALUES ?";
    const values = [[valor, getDateTime()]];
    connection.query(query, [values], (err, _result, _fields) => {
        if (err) {
            throw err;
        }

    });
}

client.on('connect', () => {
    console.log('Conectado al broker MQTT');
    client.subscribe('ARQUI2_G18/sensores/temperatura', function (err) {
        if (err) console.error(err);
    });

    client.subscribe('ARQUI2_G18/sensores/CO2', function (err) {
        if (err) console.error(err);
    });

    client.subscribe('ARQUI2_G18/sensores/luz', function (err) {
        if (err) console.error(err);
    });

    client.subscribe('ARQUI2_G18/sensores/distancia', function (err) {
        if (err) console.error(err);
    });
});

client.on('message', (topic, message) => {

    switch (topic) {
        case 'ARQUI2_G18/sensores/temperatura':
            console.log('Temperatura: %s', message);
            insertarTemperatura(message.toString());
            break;
        case 'ARQUI2_G18/sensores/CO2':
            console.log('CO2: %s', message);
            insertarCO2(message.toString());
            break;
        case 'ARQUI2_G18/sensores/luz':
            console.log('Luz: %s', message);
            insertarLuz(message.toString());
            break;

        case 'ARQUI2_G18/sensores/distancia':
            console.log('Distancia: %s', message);
            insertarDistancia(message.toString());
            break;

    }

    //console.log('Mensaje recibido:', topic, message.toString());


});

process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
});