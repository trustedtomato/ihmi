import cv2
import numpy as np
from ultralytics import YOLO

cap = cv2.VideoCapture("http://words-irc.gl.at.ply.gg:9756/video")
model = YOLO("models/yolov8n.pt")
model.to("cuda")

while True:
    ret, frame = cap.read()

    if ret:
        results = model.track(frame, persist=True, verbose=False)
        boxes = results[0].boxes
        boxes_list = boxes.xywh.cpu().tolist()
        boxes_cls = boxes.cls.int().cpu().tolist()
        boxes_conf = boxes.conf.cpu().tolist()
        tracking_ids = []
        if boxes.id is not None:
            tracking_ids = boxes.id.int().cpu().tolist()    
        annotated_frame = results[0].plot()
        cv2.imshow("YOLOv8 Tracking", annotated_frame)        
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
