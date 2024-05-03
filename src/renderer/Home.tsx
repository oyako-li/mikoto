import { FacePoint } from '../lib/FacePoint';
import axios from 'axios';
import { live2dRender } from './renderer';
import { getAngle, getDistance } from '../util/MathUtil';
import React, { useRef, useState, useEffect } from 'react';
import './Home.css';
import sharp from 'sharp';

type vec = {
  x:number;
  y:number;
}
const MODEL_FILES = {
  moc3: './model/mikoto1.4/mikoto1.4.moc3',
  model3: './model/mikoto1.4/mikoto1.4.model3.json',
  physics3: './model/mikoto1.4/mikoto1.4.physics3.json',
  textures: [
    './model/mikoto1.4/mikoto1.4.4096/texture_00.png',
  ],
};

export const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLCanvasElement>(null);
  const camerasRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(()=>{
    setIsLoaded(true);
  },[]);

  useEffect(()=>{
    if (isLoaded){
      load();
    }
  }, [isLoaded]);

  async function load() {
    try {

      const [model, moc3, physics, ...textures] = await Promise.all([
        axios.get<ArrayBuffer>(MODEL_FILES.model3, { responseType: 'arraybuffer' }).then(res => res.data),
        axios.get(MODEL_FILES.moc3, { responseType: 'arraybuffer' }).then(res => res.data),
        axios.get(MODEL_FILES.physics3, { responseType: 'arraybuffer' }).then(res => res.data),
        ...MODEL_FILES.textures.map(texture => {
          return axios.get(texture, { responseType: 'blob' }).then(res => res.data)
        })
      ]);
      const { updatePoint, clickedHandler } = await live2dRender(canvasRef.current, model, {
        moc3,
        physics,
        textures
      }, {
        autoBlink: true,
        x: 0,
        y: 1.9,
        scale: 2.2
      });
      let point = new FacePoint();

      navigator.mediaDevices.enumerateDevices().then(devices=>{
        console.log(devices)
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
              camerasRef.current.appendChild(camera);
              function tick() {
                if (camera.readyState===camera.HAVE_ENOUGH_DATA) {
                  ctx.drawImage(camera, 0, 0, videoRef.current.width, videoRef.current.height);
                  const imageData = ctx.getImageData(0,0, camera.videoWidth, camera.videoHeight)
                  // window.mikotoApi.stream(videoRef.current.toDataURL('image/jpeg'));
                  // console.log(imageData);
                }
                requestAnimationFrame(tick);
              }
              tick();
            })
          } else if (device.kind=="audioinput") {
            console.log("load audio")
          }
        });
      });



      // const _handleOnMouseMove = (e: MouseEvent) => {
      //   const x = e.clientX
      //   const y = e.clientY
      //   const rect = canvasRef.current.getBoundingClientRect()
      //   const cx = rect.left + rect.width / 2
      //   const cy = rect.top + rect.height / 2
      //   const distance = getDistance(x, y, cx, cy)
      //   const dx = cx - x
      //   const dy = cy - y
      //   const angle = getAngle(x, y, cx, cy)
      //   const r = Math.cos(angle) * Math.sin(angle) * 180 / Math.PI
      //   Object.assign(point, {
      //     angleX: -dx / 10,
      //     angleY: dy / 10,
      //     angleZ: r * (distance / cx),
      //     angleEyeX: -dx / cx,
      //     angleEyeY: dy / cy,
      //   })
      //   updatePoint(point)
      // }
      // const _handleOnMouseMove = (e: MouseEvent) => {
      //   const x = e.clientX
      //   const y = e.clientY
      //   const rect = canvasRef.current.getBoundingClientRect()
      //   const cx = rect.left + rect.width / 2
      //   const cy = rect.top + rect.height / 2
      //   const distance = getDistance(x, y, cx, cy)
      //   const dx = cx - x
      //   const dy = cy - y
      //   const angle = getAngle(x, y, cx, cy)
      //   const r = Math.cos(angle) * Math.sin(angle) * 180 / Math.PI
      //   Object.assign(point, {
      //     angleX: -dx / 10,
      //     angleY: dy / 10,
      //     angleZ: r * (distance / cx),
      //     angleEyeX: -dx / cx,
      //     angleEyeY: dy / cy,
      //   })
      //   updatePoint(point)
      // }

      // const _handleOnMouseClick = async (e: MouseEvent) => {
      //   clickedHandler();
      // }
      
      // async function tick() {
      //   if (camera1.readyState === camera1.HAVE_ENOUGH_DATA) {
      //     videoRef.current.height = camera1.videoHeight;
      //     videoRef.current.width = camera1.videoWidth;
      //     context.drawImage(camera1, 0, 0, videoRef.current.width, videoRef.current.height);
      //     window.mikotoApi.stream(videoRef.current.toDataURL('image/jpeg'));
      //   }
      //   requestAnimationFrame(tick);
      // }

      // document.body.addEventListener('mousemove', _handleOnMouseMove, false);
      // document.body.addEventListener('click', _handleOnMouseClick, false);
    } catch(error: any) {
      alert(error);
      console.error(error);
    }
  };


  return (
    <>
      <canvas ref={canvasRef} className='canvas'></canvas>
      <canvas ref={videoRef}></canvas>
      <div ref={camerasRef}></div>
      {/* <textarea ref={textRef}></textarea>
      <div style={{border:"dotted", padding:"10px",backgroundColor:"white"}}>
          <span id="final_span"></span>
          <span id="interim_span" style={{color:"grey"}}></span>
      </div> */}
    </>
  )
}