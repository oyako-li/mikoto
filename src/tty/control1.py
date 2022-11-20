from sys import flags
import serial
from pynput import keyboard

FLAG=True
SER = None
STEP = 1

def press(key):
    global FLAG
    global SER
    global STEP
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
        # print("ate", str(key))
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
    SER.write("G91\r\n".encode())
    key_listener = keyboard.Listener(
        on_press=press,
        on_release=release
    )

    key_listener.start()

    while FLAG: pass
    key_listener.stop()
    SER.close()

if __name__ == '__main__':
    import sys
    start(sys.argv)

