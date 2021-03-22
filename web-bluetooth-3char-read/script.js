/*
A Web Bluetooth connection and read example

Uses the Web Bluetooth API to make Bluetooth connections 
to a plain JavaScript page. Modified from the p5.ble 
getting started example at https://itpnyu.github.io/p5ble-website/docs/getstarted.html

This script works with the ArduinoBLE library example called ButtonLED: 
https://github.com/arduino-libraries/ArduinoBLE/tree/master/examples/Peripheral/ButtonLED

Library documentation:
https://www.arduino.cc/en/Reference/ArduinoBLE

created 25 Feb 2021 
by Tom Igoe
*/

// advertised service UUID of the  to search for:
const serviceUuid = '19b10010-e8f2-537e-4f6c-d104768a1214';
// DOM elements to interact with:
let connectButton;
let dataDiv;
let dataDiv2;
let dataDiv3;
let deviceDiv;
let myDevice;

// this function is called when the page is loaded. 
// event listener functions are initialized here:
function setup() {
  // put the DOM elements into global variables:
  connectButton = document.getElementById('connect');
  connectButton.addEventListener('click', connectToBle);
  deviceDiv = document.getElementById('device');
  dataDiv = document.getElementById('data');
  dataDiv2 = document.getElementById('data2'); // added div
  dataDiv3 = document.getElementById('data3');
}

// connect to the peripheral:
function connectToBle() {
  // options let you filter for a peripheral 
  // with a particular service UUID:
  let options = {
    filters: [{ 
      services: [serviceUuid] 
    }]
  };
  // start scanning:
  navigator.bluetooth.requestDevice(options)
  // when you get a device:
    .then(device => {
      myDevice = device;
      deviceDiv.innerHTML = "Device name: " + device.name;
      // deviceDiv.innerHTML += "<br>Service UUID: " + serviceUuid;
      return device.gatt.connect();
    })
    // get the primary service:
    .then(server => server.getPrimaryService(serviceUuid))
    .then(service => service.getCharacteristics())
    // get the characteristics of the service:
    .then(characteristics => readCharacteristics(characteristics))
   // if there's an error:
    .catch(error => console.log('Connection failed!', error));


  function readCharacteristics(characteristics) {
        // console.log(characteristics)
    // for (c of characteristics){
    //   console.log(c.uuid);
    // }
    for (c of characteristics) {
      // console.log(c)
      c.addEventListener('characteristicvaluechanged', readData);
      c.startNotifications();
      // deviceDiv.innerHTML += c.uuid;
    }
  
    // add the characterisitic UUID to the device div:
    // deviceDiv.innerHTML += "<br>characteristic UUID: " + characteristics[0].uuid;
   

    // // subscribe to the button characteristic:
    // Get an initial value:
    // return characteristics[0].readValue();
  }
}

// read incoming data:
function readData(event, error) {
  // console.log(event)
  if (error) {
    console.log('error: ', error);
    return;
  }
  // get the data  from the peripheral.
  // it's declared as a byte in the Arduino sketch,
  // so look for an unsigned int, 8 bits (Uint8):
  let sensorVal = event.target.value.getFloat32(0, true);

  if (event.target.uuid == "19b10011-e8f2-537e-4f6c-d104768a1214") {
    dataDiv.innerHTML = 'Temperature (C˚):<br> ' + sensorVal; 
  }

  if (event.target.uuid == "19b10012-e8f2-537e-4f6c-d104768a1214") {
    dataDiv2.innerHTML = 'Humidity:<br> ' + sensorVal; 
  }

  if (event.target.uuid == "19b10013-e8f2-537e-4f6c-d104768a1214") {
    dataDiv3.innerHTML = 'Turbidity (V):<br> ' + sensorVal; 
  }
  // dataDiv.innerHTML = 'value: ' + sensorVal;
  // dataDiv2.innerHTML = 'value: ' + sensorVal;
}

// This is a listener for the page to load.
// This is the command that actually starts the script:
window.addEventListener('DOMContentLoaded', setup);