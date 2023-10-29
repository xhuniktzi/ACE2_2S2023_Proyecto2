#include <Servo.h>

#include <SoftwareSerial.h>

#include <DHT.h>

#define DHTPIN 4
#define DHTYPE DHT11

#define MQ135 A2

#define LSens A1

#define pingP 23
#define echoP 22

#define ledLuz 8
#define ledMotor 9
#define ledVent 10
#define ledVen2 12

#define motorPin 11

DHT dht(DHTPIN, DHTYPE);

int manejarVelocidad_step = 1000;
static unsigned long manejarVelocidad_last_time = 0;
bool current_is_on = false;
bool ventiladorEncendido = false;
bool velocidadAlta = false;

int request_step = 2000;
static unsigned long request_last_time = 0;

Servo myServo;
int PosInicial = 0;
int PosActual = 0;

char latestStateMot = '0';

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  dht.begin();

  pinMode(echoP, INPUT);
  pinMode(pingP, OUTPUT);

  pinMode(ledLuz, OUTPUT);    // luz
  pinMode(ledMotor, OUTPUT);  // Motor
  pinMode(ledVent, OUTPUT);   // ventilacion
  pinMode(ledVen2, OUTPUT); // vent 2

  pinMode(motorPin, OUTPUT);  // motor ventilador

  myServo.attach(6);
  myServo.write(PosInicial);
}

void loop() {
  // put your main code here, to run repeatedly:
  manejarVelocidad();
  handleMain();
}


void handleMain() {
  unsigned long now = millis();
  if (now - request_last_time < request_step) return;
  request_last_time = now;

  handleSensors();
  handleActions();
}

void manejarVelocidad() {
  unsigned long now = millis();
  int dstep;

  if (!current_is_on) {
    //Serial.println("S4");
    dstep = manejarVelocidad_step * 2;
  } else {
    if (velocidadAlta) {
      //Serial.println("S16");
      dstep = manejarVelocidad_step * 16;
    } else {
      //Serial.println("S2");
      dstep = manejarVelocidad_step * 4;
    }
  }

  if (now - manejarVelocidad_last_time < dstep) return;
  manejarVelocidad_last_time = now;

  if (!ventiladorEncendido) return;


  if (!current_is_on) {
    //Serial.println("Vent OFF");
    digitalWrite(motorPin, LOW);  //original: HIGH
    current_is_on = true;
    return;
  }

  digitalWrite(motorPin, HIGH);  //original: LOW
  //Serial.println("Vent ON");
  current_is_on = false;
  return;
}


void apagarVentilador() {
  //Serial.println("Vent ON");
  digitalWrite(motorPin, HIGH);  //invertir? original: LOW
}

void handleSensors() {
  float t = leerTemperatura();
  float c = leerCO2();
  float l = leerLumen();
  float d = leerDistancia();

  if (!MedicionesValidas(t, l, c, d)) {
    //Serial.println("ERR");
    return;
  }

  String msg = "";
  msg.concat(t);
  msg.concat("|");
  msg.concat(c);
  msg.concat("|");
  msg.concat(l);
  msg.concat("|");
  msg.concat(d);
  Serial.println(msg);
}



void handleActions() {
  String res = Serial.readStringUntil('\n');
  char stateLuz = res.charAt(0);
  char stateVen = res.charAt(1);
  char stateMot = res.charAt(2);


  if (stateLuz == '1') {
    digitalWrite(ledLuz, HIGH);
  } else if (stateLuz == '0') {
    digitalWrite(ledLuz, LOW);
  }

  if (stateVen == '2') {
    velocidadAlta = true;
    ventiladorEncendido = true;
    digitalWrite(ledVent, HIGH);
    digitalWrite(ledVen2, HIGH);
  } else if (stateVen == '1') {
    velocidadAlta = false;
    ventiladorEncendido = true;
    digitalWrite(ledVent, HIGH);
    digitalWrite(ledVen2, LOW);
  } else if (stateVen == '0') {
    apagarVentilador();
    ventiladorEncendido = false;
    digitalWrite(ledVent, LOW);
    digitalWrite(ledVen2, LOW);
  }

  if (stateMot == '1') {
    if (latestStateMot != '1') {
      PosActual = Mover90grados();
    }
    latestStateMot = '1';
    digitalWrite(ledMotor, HIGH);
  } else if (stateMot == '0') {
    if (latestStateMot != '0') {
      MoverPosicionInicio(PosActual);
    }
    latestStateMot = '0';
    digitalWrite(ledMotor, LOW);
  }
}

float leerTemperatura() {
  return dht.readTemperature();
}

float leerCO2() {
  return analogRead(MQ135);
}

float leerLumen() {
  float lecturaSensor = analogRead(LSens);  // Leer el valor analógico del sensor
  float voltage = lecturaSensor * (5.0 / 1025) * 1000;
  float resistencia = 10000 * (voltage / (5000.0 - voltage));
  // Realizar la conversión utilizando una regla de tres simple para ajustar el rango leído al rango de lux
  float lux = (500.0 / resistencia) * 1000;
  return lux;
}

long microsecondsToCentimeters(long microseconds)  // method to covert microsec to centimeters
{
  return microseconds / 29 / 2;
}


float leerDistancia() {
  long duration, cm;

  digitalWrite(pingP, LOW);
  delayMicroseconds(2);

  digitalWrite(pingP, HIGH);
  delayMicroseconds(10);

  digitalWrite(pingP, LOW);

  duration = pulseIn(echoP, HIGH);           // using pulsin function to determine total time
  cm = microsecondsToCentimeters(duration);  // calling method

  return cm;
}

bool MedicionesValidas(float temperatura, float lumen, float co2, float dist) {
  // Verificar si alguna medición es NaN
  if (isnan(temperatura) || isnan(lumen) || isnan(co2) || isnan(dist)) {
    return false;
  }
  return true;
}

void MoverPosicionInicio(int actual) {
  for (int i = actual; i > 0; i--) {
    myServo.write(i);
    //delay(20);
  }
}

int Mover90grados() {
  for (int i = 0; i <= 180; i++) {
    myServo.write(i);
    //delay(20);
  }
  return 90;
}
