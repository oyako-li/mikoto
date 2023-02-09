import cv2
import serial
import time
import sys


def main(args):
    SER = serial.Serial(args[1], args[2])
    SER.write("G91\r\nM203 X200 Y200 Z300 E10000\r\n".encode())
    qcd = cv2.QRCodeDetector()
    cap = cv2.VideoCapture(0)

    def read_seliar():
        SER.write(f'M114\r\n'.encode())
        bytesToRead = SER.inWaiting()
        position = SER.read(bytesToRead).decode("utf-8")
        try:
            if float(position.split(' ')[1].split(':')[1])>=220.00:
                print('position:220')
                return 220
            elif float(position.split(' ')[1].split(':')[1])==0.00:
                print('position:0')
                return 0
        except Exception: return False

    print('moveto220:',SER.write(f'G00 Y220 F8000.0\r\n'.encode()) if read_seliar()!=220 else "")

    count = 0
    while True:
        try:
            while cap.isOpened():
                _, frame = cap.read()
                if not _: break 
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                _,frame = cv2.threshold(frame, 127, 225, cv2.THRESH_TOZERO)
                if _:
                    retval, decoded_info, points, straight_qrcode = qcd.detectAndDecodeMulti(frame)
                    if retval:
                        print('detected')
                        frame = cv2.polylines(frame, points.astype(int), True, (0, 255, 0), 3)
                        if read_seliar()==220:
                            print('remove220to0:', SER.write(f'G00 Y-220 F8000.0\r\nG00 Y220 F8000.0\r\n'.encode()), f' count:{count}')
                            count+=1
                            time.sleep(2)


                cv2.imshow('data/dst/qrcode_opencv.jpg', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'): 
                    cv2.destroyallWindows()
                    SER.close()
                    sys.exit()
        except:
            time.sleep(2)
            cap = cv2.VideoCapture(0)



if __name__ == '__main__':
    main(sys.argv)