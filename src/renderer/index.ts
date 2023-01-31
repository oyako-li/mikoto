import { FacePoint } from '../lib/FacePoint';
import axios from 'axios';
import { live2dRender } from './renderer';
import { getAngle, getDistance } from '../util/MathUtil';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

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
    './model/Clearker2/action1.wav',
    './model/Clearker2/action2.wav'
  ]
};

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
    const { updatePoint, clickedHandler } = await live2dRender(canvas, model, {
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
    let point = new FacePoint()
    const _handleOnMouseMove = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY
      const rect = canvas.getBoundingClientRect()
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
    const _handleOnMouseClick = (e: MouseEvent) => {
      clickedHandler();
    }
    document.body.addEventListener('mousemove', _handleOnMouseMove, false)
    document.body.addEventListener('click', _handleOnMouseClick, false)
  } catch(error: any) {
    alert(error);
    console.error(error);
  }
};

window.addEventListener('load', () => {
  load()
  // alert('wake up');
});
