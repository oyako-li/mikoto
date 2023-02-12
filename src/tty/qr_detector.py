from email.policy import default
import os
import sys
import cv2
import time
import serial
import logging
from threading import Lock
# import numpy as np
from datetime import datetime
from flask import Flask, request, session, render_template, Response, send_from_directory, abort
from flask_socketio import SocketIO, emit
# import requests
# DIR_PATH = os.path.dirname(os.path.abspath(__file__))
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
app.secret_key = 'change_this! and dont include it in questions!'
async_mode=None
socketio = SocketIO(app, async_mode=async_mode)
thread = None
thread_lock = Lock()
# @app.errorhandler(404)
# def page_not_found(e):
#     # note that we set the 404 status explicitly
#     return render_template('404.html'), 404

@app.route('/')
def home():
   return render_template('index3.html', async_mode=socketio.async_mode)


@app.route('/get-files/<path:file_path>',methods = ['GET','POST'])
def get_files(file_path):
    global logger
    """Download a file."""
    try:
        return send_from_directory('../../.log/', f"{file_path}.log", as_attachment=True)
    except FileNotFoundError as e:
        logger.error(f"{e}, path:{file_path}")
        abort(404)

def frame_gen(env_func, *args, **kwargs):
    get_frame = env_func(*args, **kwargs)
    while True:
        frame = next(get_frame, None)
        if frame is None:
            break
        _, frame = cv2.imencode('.png', frame)
        frame = frame.tobytes()
        yield frame

# def render_browser(env_func):
#     global logger
#     def wrapper(*args, **kwargs):
#         # @socketio.on('broadcast_view')
#         def render_feed():
#             logger.debug('emit:broadcast')            
#             emit('broadcast_view',{'image':True, 'buffer':frame_gen(env_func, *args, **kwargs)}, broadcast=True)

#     return wrapper


# @render_browser
def main():
    global logger
    SER = serial.Serial(sys.argv[1], sys.argv[2])
    logger.info('set-g-code-G90:{}'.format(SER.write("G90\r\n".encode())))
    qcd = cv2.QRCodeDetector()
    cap = cv2.VideoCapture(0)

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
                        logger.info('remove220to0:{}, count:{}, time:{}'.format(SER.write("G00 Y00 F9000.0\r\nG00 Y220 F9000.0\r\n".encode()), count, now-pre_time))
                        count+=1
                        pre_time=now
                        time.sleep(2)
                _, frame = cv2.imencode('.png', frame)
                frame = frame.tobytes()
                emit('my responce',{'image':True, 'buffer':frame}, broadcast=True, namespace="/view")

        except Exception as e:
            logger.error(e)
            time.sleep(2)
        finally :
            cv2.destroyAllWindows()
            cap = cv2.VideoCapture(0)
            logger.warning('camera-reloading')

@socketio.event
def get_render(req):
    session['receive_count']=session.get('receive_count',0)+1
    emit('receivers',
        {'data': req['data'], 'count':session['receive_count']}
    )

@socketio.on('test')
def handle_message(data):
    global logger
    logger.info(f'message:{data}')
    emit('test_response', {'data':'Test complete'})

@socketio.on('broadcast')
def handle_broadcast(data):
    global logger
    logger.info(f'broadcasted:{data}')
    emit('broadcast_response', {'data': 'Broadcast sent'}, broadcast=True)

@socketio.on('connect', '/view')
def connect():
    global thread, logger
    logger.info('connect')
    with thread_lock:
        if thread is None:
            logger.info('start thread')
            thread = socketio.start_background_task(main)
    emit('my_response', {'data': 'connected', 'count':0})


# if __name__ == '__main__':
ctx = app.app_context()
ctx.push()

socketio.run(app, port=3001, debug=True)