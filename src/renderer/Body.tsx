import React ,{ useRef, useState, useEffect } from 'react';

export const Body = () => {
  useEffect(()=>{
    load();
  },[]);

  async function load() {
    try {
      navigator.mediaDevices.enumerateDevices().then(devices=>{
        devices.forEach(function(device) {
          if (device.kind == "videoinput") {  
            navigator.mediaDevices.getUserMedia({video: {deviceId:{exact: device.deviceId}}}).then(stream=>{
              const camera = document.createElement("video");
              const eyes = document.createElement('canvas');
              const ctx = eyes.getContext('2d');
              camera.srcObject = stream;
              camera.play();
              eyes.width= camera.videoWidth;
              eyes.height= camera.videoHeight;
              document.body.appendChild(camera);
              function tick() {
                if (camera.readyState===camera.HAVE_ENOUGH_DATA) {
                  ctx.drawImage(camera, 0, 0, eyes.width,eyes.height);
                  const imageData = ctx.getImageData(0,0, camera.videoWidth, camera.videoHeight)
                  // sharp(imageData);
                  // window.micotoApi.stream(videoRef.current.toDataURL('image/jpeg'));
                  console.log(imageData);
                }
                requestAnimationFrame(tick);
              }
              tick();
            })
          } else if (device.kind=="audioinput") {
            
          }
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <>
      <img src="" alt="" className="camera"></img>
      <audio className="voice"></audio>
   </>
 )
}

export default Body;