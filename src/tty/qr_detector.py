import cv2

qcd = cv2.QRCodeDetector()
cap = cv2.VideoCapture(0)
while cap.isOpened():
    _, frame = cap.read()
    if _:
        retval, decoded_info, points, straight_qrcode = qcd.detectAndDecodeMulti(frame)
        if retval:
            img = cv2.polylines(frame, points.astype(int), True, (0, 255, 0), 3)
            # print(retval, decoded_info)

            for s, p in zip(decoded_info, points):
                frame = cv2.putText(frame, s, p[0].astype(int),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

        cv2.imshow('data/dst/qrcode_opencv.jpg', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
cv2.destroyWindow('data/dst/qrcode_opencv.jpg')