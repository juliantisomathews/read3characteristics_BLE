#include <ArduinoBLE.h>
#include "DHT.h"

BLEService ledService("19B10010-E8F2-537E-4F6C-D104768A1214"); // create service

BLEFloatCharacteristic tempCharacteristic("19B10011-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);
BLEFloatCharacteristic humidityCharacteristic("19B10012-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);
BLEFloatCharacteristic turbidityCharacteristic("19B10013-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);


DHT dht(2, DHT22);

void setup() {
  Serial.begin(9600);
//  while (!Serial); // enables bluetooth connectivity without having to open the serial monitor
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (1);
  }

BLE.setLocalName("WTNF");
BLE.setAdvertisedService(ledService);

ledService.addCharacteristic(tempCharacteristic);
ledService.addCharacteristic(humidityCharacteristic);
ledService.addCharacteristic(turbidityCharacteristic);


BLE.addService(ledService);

tempCharacteristic.writeValue(0.0);
humidityCharacteristic.writeValue(0.0);
turbidityCharacteristic.writeValue(0.0);

BLE.advertise();
Serial.println("Bluetooth device active, waiting for connections...");
dht.begin();
}

void loop() {

  BLE.poll(); // sees if any clients want to talk to us

  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();

  int sensorValue = analogRead(A0);// read the input on analog pin 0:
  float voltage = sensorValue * (3.3 / 1024.0); // Convert the analog reading (which goes from 0 - 1023) to a voltage (0 - 5V):

  tempCharacteristic.writeValue(t);
  humidityCharacteristic.writeValue(h);
  turbidityCharacteristic.writeValue(voltage);
  
//  Serial.println(voltage)
  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.println(F("°C "));
  delay(1000);
}
