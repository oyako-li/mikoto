# from flask import Flask, render_template
# from flask_assets import Environment, Bundle

# app = Flask(__name__, static_folder='public', static_url_path='/')
# I use Flask-Assets to build and combine CSS and JS assets,
# but this isn't strictly necessary.
# assets = Environment(app)
# css = Bundle("custom.css", output="gen/style.css")
# assets.register("site_css", css)

# @app.route('/')
# def home():
#    return render_template('./index2.html')
# @app.route('/clearker')
# def clearker():
#    return render_template('./index.html')

# if __name__ == '__main__':
#    app.run(host='0.0.0.0', port=8000)

import os
import sys
import cv2
import time
import serial
import logging
from datetime import datetime
from flask import Flask, render_template, Response, send_from_directory, abort

from camera import Camera

TEMPLATE_DIR = '../../templates/'
LOG_FILE_DIR = '.log/'

filename=None
path=None
while True:
    try:
        path = f"{LOG_FILE_DIR}{datetime.today().strftime('%Y-%m-%d')}"
        filename = f"{datetime.today().strftime('%H-%M-%S')}"
        _fh = logging.FileHandler(f"{path}/{filename}.log")
        break
    except FileNotFoundError:
        os.makedirs(f"{path}")

logger = logging.getLogger("g_code_logger")
logger.setLevel(logging.DEBUG)
_fh.setLevel(logging.DEBUG)
_fh_formatter = logging.Formatter('%(asctime)s, %(message)s')
_fh.setFormatter(_fh_formatter)
_ch = logging.StreamHandler()
_ch.setLevel(logging.DEBUG)
_ch_formatter = logging.Formatter('[{}.%(asctime)s], %(message)s'.format(filename))
_ch.setFormatter(_ch_formatter)

# add the handlers to the logger
logger.addHandler(_ch)
logger.addHandler(_fh)

app = Flask(__name__, static_folder='public', static_url_path='/', template_folder=TEMPLATE_DIR)
# app = Flask(__name__, template_folder='../../templates/')


@app.route("/")
def index():
    return "Hello World!"

@app.route("/stream")
def stream():
    return render_template("index3.html")

@app.route('/get-files/<path:file_path>',methods = ['GET','POST'])
def get_files(file_path):
    global logger
    """Download a file."""
    try:
        return send_from_directory('../../.log/', f"{file_path}.log", as_attachment=True)
    except FileNotFoundError as e:
        logger.error(f"{e}, path:{file_path}")
        abort(404)

def gen(camera):
   global logger
   SER = serial.Serial(sys.argv[1], sys.argv[2])
   logger.info('set-g-code-G90:{}'.format(SER.write("G90\r\n".encode())))
   def read_position():
      while True:
            try:
               logger.debug('read-g-code-M114:{}'.format(SER.write("M114\r\n".encode())))
               bytesToRead = SER.inWaiting()
               position = SER.read(bytesToRead).decode("utf-8")
               position = float(position.split(' ')[1].split('Y:')[1])
               logger.info(f'get-position:{position}')
               return position
            except Exception: pass
   
   position = read_position()
   logger.info("first move".format(SER.write(f'G00 Y220 F8000.0;\r\n'.encode())) if position<220 else f'first position:{position}')
   count = 0
   pre_time = time.time()
   qcd = cv2.QRCodeDetector()
   
   while True:
      frame = camera.get_frame()

      retval, decoded_info, points, straight_qrcode = qcd.detectAndDecodeMulti(frame)
      if retval:
         logger.debug('QR_GET')
         frame = cv2.polylines(frame, points.astype(int), True, (0, 255, 0), 3)
         if read_position()==220:
            now = time.time()
            logger.info('remove220to0:{}, count:{}, time:{}'.format(SER.write("G00 Y00 F9000.0\r\nG00 Y220 F9000.0\r\n".encode()), count, now-pre_time))
            count+=1
            pre_time=now
            time.sleep(2)
      if frame is not None:
         yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + frame.tobytes() + b"\r\n")
      else:
         print("frame is none")

@app.route("/video_feed")
def video_feed():
    return Response(gen(Camera()),
            mimetype="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    app.debug = True
    app.run(host="0.0.0.0", port=3001)