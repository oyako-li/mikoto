var {SerialPort} = require('serialport');
const DEVICE_FILE_PATH = '/dev/ttyUSB0';
const SERIAL_OPTION = {path: DEVICE_FILE_PATH,baudRate: 115200 };

var port = new SerialPort(SERIAL_OPTION);

port.on('data',(data)=>{
    console.log('receive data: ', data.toString());
});

port.on('error', (err)=>{
    console.error(err);
});

var num=0;

setInterval(()=>{
    var text = 'hoge';
    port.write(text+num, (err)=>{
        console.log('send data: ', text+num++);
    });
}, 1000);