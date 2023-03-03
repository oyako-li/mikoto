import { FacePoint } from '../lib/FacePoint';
import jsQR from "jsqr";
import axios from 'axios';
import { live2dRender } from './renderer';
import { getAngle, getDistance } from '../util/MathUtil';
import React, { useRef, useState, useEffect } from 'react';

type vec = {
  x:number;
  y:number;
}

export const Home = () => {
  const MODEL_FILES = {
    moc3: './model/Clearker2/Clearker6.3.moc3',
    model3: './model/Clearker2/Clearker6.3.model3.json',
    physics3: './model/Clearker2/Clearker6.3.physics3.json',
    textures: [
      './model/Clearker2/Clearker6.3.2048/texture_00.png'
    ],
    motions: [
      './model/Clearker2/action1.1.motion3.json',
      './model/Clearker2/action2.1.motion3.json'
    ],
    sounds: [
      './model/Clearker2/action1.1.wav',
      './model/Clearker2/action2.1.wav'
    ]
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLCanvasElement>(null);
  const camera = document.createElement("video");
  // contextを状態として持つ
  const [context,setContext] = useState(null);

  // コンポーネントの初期化完了後コンポーネント状態にコンテキストを登録
  useEffect(()=>{
    const video = videoRef.current.getContext("2d");
    setContext(video);
  },[]);

  // 状態にコンテキストが登録されたらそれに対して操作できる
  useEffect(()=>{
    if(context!==null) {
      load();
    }
  },[context]);

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
      const motions = await Promise.all([
        ...MODEL_FILES.motions.map( motion => {
          return axios.get(motion, { responseType: 'arraybuffer' }).then(res => res.data)
        })
      ]);
      const sounds = await Promise.all([
        ...MODEL_FILES.sounds.map( sound => {
          return axios.get(sound, { responseType: 'blob' }).then(res => res.data)
        })
      ]);
      const { updatePoint, clickedHandler } = await live2dRender(canvasRef.current, model, {
        moc3,
        physics,
        motions,
        sounds,
        textures
      }, {
        autoBlink: true,
        x: 0,
        y: 1.5,
        scale: 2
      });
      let point = new FacePoint();
      // Use facingMode: environment to attemt to get the front camera on phones
      navigator.mediaDevices.getUserMedia({audio: true, video: { facingMode: "environment" } }).then(function(stream) {
        camera.srcObject = stream;
        camera.setAttribute("playsinline", 'true'); // required to tell iOS safari we don't want fullscreen
        camera.play();
        let audioStream = new MediaStream(stream.getAudioTracks());
        let audioRecord = new MediaRecorder(audioStream);
        let audioChunks:any = [];
        audioRecord.start();
        
        audioRecord.addEventListener("dataavailable", e => audioChunks.push(e.data));
        
        audioRecord.addEventListener('stop', _ => {
            let audioBlob = new Blob(audioChunks);
            audioChunks = [];
            
            let fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onload = _ =>{
              window.streamApi.voice(fileReader.result);
            };
            
            audioRecord.start();
        });
        let audioInterval = setInterval( _ =>audioRecord.stop(), 1000);
        requestAnimationFrame(tick);
      }).catch(handleError=>console.error(handleError));


      const _handleOnMouseMove = (e: MouseEvent) => {
        const x = e.clientX
        const y = e.clientY
        const rect = canvasRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const distance = getDistance(x, y, cx, cy)
        const dx = cx - x
        const dy = cy - y
        const angle = getAngle(x, y, cx, cy)
        const r = Math.cos(angle) * Math.sin(angle) * 180 / Math.PI
        Object.assign(point, {
          angleX: -dx / 10,
          angleY: dy / 10,
          angleZ: r * (distance / cx),
          angleEyeX: -dx / cx,
          angleEyeY: dy / cy,
        })
        updatePoint(point)
      }
      const _handleOnMouseClick = async (e: MouseEvent) => {
        // console.log();
        await window.clearkerApi.post('M114\r\n');
        clickedHandler();
      }
      document.body.addEventListener('mousemove', _handleOnMouseMove, false);
      document.body.addEventListener('click', _handleOnMouseClick, false);
      function drawLine(begin:vec, end:vec, color:string) {
        context.beginPath();
        context.moveTo(begin.x, begin.y);
        context.lineTo(end.x, end.y);
        context.lineWidth = 4;
        context.strokeStyle = color;
        context.stroke();
      }
      
      async function tick() {
        if (camera.readyState === camera.HAVE_ENOUGH_DATA) {
      
          videoRef.current.height = camera.videoHeight;
          videoRef.current.width = camera.videoWidth;
          context.drawImage(camera, 0, 0, videoRef.current.width, videoRef.current.height);
          var imageData = context.getImageData(0, 0, videoRef.current.width, videoRef.current.height);
          window.streamApi.stream(videoRef.current.toDataURL('image/jpeg'));
          var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            console.log(code.data);
            if (code.data!=="") console.log('position:', await window.clearkerApi.get('M114\r\n'));
          } 
        }
        requestAnimationFrame(tick);
      }
    } catch(error: any) {
      alert(error);
      console.error(error);
    }
  };


  return (
    <>
      <canvas ref={canvasRef} ></canvas>
      <canvas ref={videoRef}></canvas>

      <script src="./lib/live2dcubismcore.min.js"></script>
    </>
  )
}