from sys import flags
import serial
import time
from pynput import keyboard

import threading


def set_interval(func, sec): 
    def func_wrapper():
        set_interval(func, sec) 
        func()  
    t = threading.Timer(sec, func_wrapper)
    t.start()
    return t


FLAG=True
SER = None
STEP = 1
STROKE=False
COUNT=0


def read_seliar():
    global SER
    SER.write(f'M114\r\n'.encode())
    bytesToRead = SER.inWaiting()
    position = SER.read(bytesToRead).decode("utf-8")
    try:
        if float(position.split(' ')[1].split(':')[1])==220.00:
            return 220
        elif float(position.split(' ')[1].split(':')[1])==0.00:
            return 0
    except Exception:
        return False 

def stroke():
    global STROKE
    global SER
    global COUNT
    while STROKE:
        result = read_seliar()
        if result == 220:
            print("COUNT=", COUNT)
            SER.write(f'G00 Y-220 F8000.0;\r\n'.encode())
            COUNT+=1
        elif result == 0:
            SER.write(f'G00 Y220 F8000.0;\r\n'.encode())
        else:
            SER.write(f'G00 Y220 F8000.0;\r\n'.encode())

        time.sleep(3)

def press(key):
    global FLAG
    global SER
    global STEP
    global STROKE
    global COUNT
    try:

        if key.char == None: return
        if key.char == 'u':
            print('hight', STEP)
            SER.write(f'G01 Z{STEP}\r\n'.encode())
            return
        elif key.char == 'd':
            print('low', STEP)
            SER.write(f'G01 Z-{STEP}\r\n'.encode())
            return
        elif key.char == ':':
            if STEP>50: return
            STEP+=1
            print('pow', STEP)
            return
        elif key.char == ';':
            if STEP<2: return
            STEP-=1
            print('log', STEP)
            return
        elif key.char == 'h':
            print('home', STEP)
            SER.write('G28\r\n'.encode())
            SER.write(f'G01 Z{STEP}\r\n'.encode())

            return
        elif key.char == 's':
            print('start of stroke')
            STROKE=True
            return

        elif key.char == 'k':
            print('start of stroke')
            return

        return
    except AttributeError:
        if str(key)=='Key.esc':
            FLAG = False
            return
        if str(key) == 'Key.up':
            print('up', STEP)
            SER.write(f'G01 Y{STEP}\r\n'.encode())
            return
        elif str(key) == 'Key.down':
            print('down', STEP)
            SER.write(f'G01 Y-{STEP}\r\n'.encode())
            return
        elif str(key) == 'Key.right':
            print('right', STEP)
            SER.write(f'G01 X{STEP}\r\n'.encode())
            return
        elif str(key) == 'Key.left':
            print('left', STEP)
            SER.write(f'G01 X-{STEP}\r\n'.encode())
            return
        elif str(key) == 'Key.space':
            print('space stpo')
            STROKE=False
            COUNT=0
            return
        return

def release(key):
    try:
        if key.char == None:
            return
    except AttributeError:
        pass


def start(_serial):
    global FLAG
    global SER
    print(_serial)
    SER = serial.Serial(_serial[1], _serial[2])
    SER.write("G91\r\nM203 X200 Y200 Z300 E10000\r\n".encode())
    key_listener = keyboard.Listener(
        on_press=press,
        on_release=release
    )

    key_listener.start()
    set_interval(stroke, 15)

    while FLAG: pass
    key_listener.stop()
    SER.close()

if __name__ == '__main__':
    import sys
    start(sys.argv)

