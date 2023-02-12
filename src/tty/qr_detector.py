import os
import sys
import cv2
import time
import serial
import logging
# import numpy as np
from datetime import datetime
from flask import Flask, request, render_template, Response, send_from_directory, abort
from flask_assets import Environment, Bundle

DIR_PATH = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(DIR_PATH, 'templates/')
LOG_FILE_DIR = os.path.join(DIR_PATH, '.log/')

logger = logging.getLogger("g_code_logger")
logger.setLevel(logging.INFO)
filename=None
path=None
while True:
    try:
        path = f"{LOG_FILE_DIR}{datetime.today().strftime('%H-%M-%S')}"
        filename = f"{datetime.today().strftime('%Y-%m-%d')}"
        _fh = logging.FileHandler(f"{path}/{filename}.log")
        break
    except FileNotFoundError:
        os.makedirs(path)

_fh.setLevel(logging.INFO)
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

# @app.errorhandler(404)
# def page_not_found(e):
#     # note that we set the 404 status explicitly
#     return render_template('404.html'), 404

@app.route('/')
def home():
   return render_template('./index3.html')

@app.route('/get-files/<path:file_path>',methods = ['GET','POST'])
def get_files(file_path):

    """Download a file."""
    try:
        return send_from_directory(LOG_FILE_DIR, f"{file_path}.log", as_attachment=True)
    except FileNotFoundError:
        abort(404)

def frame_gen(env_func, *args, **kwargs):
    get_frame = env_func(*args, **kwargs)
    while True:
        frame = next(get_frame, None)
        if frame is None:
            break
        _, frame = cv2.imencode('.png', frame)
        frame = frame.tobytes()
        yield (b'--frame\r\n' + b'Content-Type: image/png\r\n\r\n' + frame + b'\r\n')

def render_browser(env_func):
    def wrapper(*args, **kwargs):
        @app.route('/render_feed')
        def render_feed():
            return Response(frame_gen(env_func, *args, **kwargs), mimetype='multipart/x-mixed-replace; boundary=frame')

        print("Starting rendering, check `server_ip:3000`.")
        app.run(host='0.0.0.0', port='3000', debug=False)

    return wrapper


if __name__ == '__main__':
    @render_browser
    def main(*args):
        SER = serial.Serial(args[1], args[2])
        logger.info('set-gcode-G90:',SER.write("G90\r\n".encode()))
        qcd = cv2.QRCodeDetector()
        cap = cv2.VideoCapture(0)

        def read_position():
            while True:
                try:
                    logger.debug('read-gcode-M114:',SER.write(f'M114\r\n'.encode()))
                    bytesToRead = SER.inWaiting()
                    position = SER.read(bytesToRead).decode("utf-8")
                    position = float(position.split(' ')[1].split('Y:')[1])
                    logger.info('get-position:', position)
                    return position
                except Exception: pass

        position = read_position()
        logger.info("first move"+str(SER.write(f'G00 Y220 F8000.0;\r\n'.encode())) if position<220 else f'first position:{position}')
        count = 0
        pre_time = time.time()
        while True:
            try:
                while cap.isOpened():
                    _, frame = cap.read()
                    if not _: 
                        logger.debug('get-image-error')
                        continue
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    _,frame = cv2.threshold(frame, 127, 225, cv2.THRESH_TOZERO)
                    if not _:
                        logger.debug('image-threshold-error')
                        continue
                    retval, decoded_info, points, straight_qrcode = qcd.detectAndDecodeMulti(frame)
                    if retval:
                        logger.debug('QR_GET')
                        frame = cv2.polylines(frame, points.astype(int), True, (0, 255, 0), 3)
                        if read_position()==220:
                            now = time.time()
                            logger.info('remove220to0:', SER.write(f'G00 Y00 F9000.0\r\nG00 Y220 F9000.0\r\n'.encode()), f' count:{count} time:{now-pre_time}')
                            count+=1
                            pre_time=now
                            time.sleep(2)

                    yield frame
            except:
                time.sleep(2)
                cv2.destroyAllWindows()
                cap = cv2.VideoCapture(0)

    main(*sys.argv)