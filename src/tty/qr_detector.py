import cv2
import serial
import time
import sys


def main(args):
    SER = serial.Serial(args[1], args[2])
    SER.write("G90\r\n".encode())
    qcd = cv2.QRCodeDetector()
    cap = cv2.VideoCapture(0)

    def read_seliar():
        while True:
            try:
                SER.write(f'M114\r\n'.encode())
                bytesToRead = SER.inWaiting()
                position = SER.read(bytesToRead).decode("utf-8")
                position = float(position.split(' ')[1].split('Y:')[1])
                return position
            except Exception: pass

    position = read_seliar()
    print("first move"+str(SER.write(f'G00 Y220 F8000.0;\r\n'.encode())) if position<220 else f'first posision:{position}')
    count = 0
    pre_time = time.time()
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
                            now = time.time()
                            print('remove220to0:', SER.write(f'G00 Y00 F9000.0\r\nG00 Y220 F9000.0\r\n'.encode()), f' count:{count} time:{now-pre_time}')
                            count+=1
                            pre_time=now
                            time.sleep(2)


                cv2.imshow('qrcode_opencv', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'): 
                    cv2.destroyAllWindows()
                    SER.close()
                    return 0
        except:
            time.sleep(2)
            cv2.destroyAllWindows()
            cap = cv2.VideoCapture(0)



if __name__ == '__main__':
    main(sys.argv)