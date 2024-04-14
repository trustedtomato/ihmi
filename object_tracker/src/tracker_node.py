#!/home/tue/pytorch_env/pytorch_env/bin/python3
import rospy
import cv2
import object_tracker.msg

from ultralytics import YOLO


class TrackerNode:
    def __init__(self):
        self.model = YOLO("models/yolov8n.pt")
        self.model.to("cuda")
        self.pub = rospy.Publisher('tracker_node', object_tracker.msg.Boxes, queue_size=10)
        self.msg = object_tracker.msg.Boxes()
        self.msg.bboxes_cls = object_tracker.msg.UInt16List()
        self.msg.bboxes_conf = object_tracker.msg.Float32List()
        self.msg.bboxes_xywh = object_tracker.msg.Float32List()
        self.msg.tracking_ids = object_tracker.msg.UInt16List()
        rospy.init_node('tracker_node', anonymous=True)
        rospy.loginfo('Tracker node started')

    def run(self):
        cap = cv2.VideoCapture("http://words-irc.gl.at.ply.gg:9756/video")
        while not rospy.is_shutdown():
            ret, frame = cap.read()
            if ret:
                results = self.model.track(frame, persist=True, verbose=False)
                boxes = results[0].boxes
                self.msg.bboxes_cls.data = boxes.cls.int().cpu().tolist()
                self.msg.bboxes_conf.data = boxes.conf.cpu().tolist()
                self.msg.tracking_ids.data = []
                bboxes_xywh = boxes.xywh.cpu().tolist()
                bboxes_xywh_list = []
                for box in bboxes_xywh:
                    bbox_xywh = object_tracker.msg.Float32List()
                    bbox_xywh.data = box
                    bboxes_xywh_list.append(bbox_xywh)
                self.msg.bboxes_xywh = bboxes_xywh_list
                if boxes.id is not None:
                    self.msg.tracking_ids.data = boxes.id.int().cpu().tolist()    
                annotated_frame = results[0].plot()
                cv2.imshow("YOLOv8 Tracking", annotated_frame)
                self.pub.publish(self.msg)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        cap.release()
        cv2.destroyAllWindows()    

if __name__ == '__main__':
    tracker_node = TrackerNode()
    tracker_node.run()
