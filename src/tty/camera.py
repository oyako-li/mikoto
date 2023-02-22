import cv2
from base_camera import BaseCamera


class Camera(BaseCamera):
    def __init__(self):
        super().__init__()
        self.camera = cv2.VideoCapture(0)

    def frames(self):
        if not self.camera.isOpened():
            raise RuntimeError('Could not start camera.')

        while True:
            # read current frame
            _, frame = self.camera.read()
            if not _: continue
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _,frame = cv2.threshold(frame, 127, 225, cv2.THRESH_TOZERO)
            if not _: continue

            # encode as a jpeg image and return it
            yield frame
    
    @staticmethod
    def frames():
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            raise RuntimeError('Could not start camera.')

        while True:
            # read current frame
            _, frame = camera.read()
            if not _: continue
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _,frame = cv2.threshold(frame, 127, 225, cv2.THRESH_TOZERO)
            if not _: continue

            # encode as a jpeg image and return it
            yield frame