
import cv2
import numpy as np

# CAMERA
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Webcam could not be opened.")
    exit()

# ARUCO DETECTOR
dictionary = cv2.aruco.getPredefinedDictionary(
    cv2.aruco.DICT_4X4_50
)

parameters = cv2.aruco.DetectorParameters()
detector = cv2.aruco.ArucoDetector(dictionary, parameters)

# Marker side length in arbitrary units.
# 1.0 means positions are measured in marker-side units,
# not centimetres or metres.
MARKER_LENGTH = 1.0
HALF = MARKER_LENGTH / 2

# Required corner order for SOLVEPNP_IPPE_SQUARE
object_points = np.array([
    [-HALF,  HALF, 0],
    [ HALF,  HALF, 0],
    [ HALF, -HALF, 0],
    [-HALF, -HALF, 0]
], dtype=np.float32)

camera_matrix = None
dist_coeffs = np.zeros((5, 1), dtype=np.float64)

print("WHEEL CART - 3D AR TRACKING")
print("Move and rotate your marker.")
print("Press Q to exit.")

while True:
    success, frame = cap.read()

    if not success:
        print("Camera unavailable.")
        break

    height, width = frame.shape[:2]

    # Approximate camera parameters.
    # Camera calibration will improve accuracy later.
    if camera_matrix is None:
        focal_length = float(max(width, height))

        camera_matrix = np.array([
            [focal_length, 0, width / 2],
            [0, focal_length, height / 2],
            [0, 0, 1]
        ], dtype=np.float64)

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    corners, ids, rejected = detector.detectMarkers(gray)

    if ids is not None:
        cv2.aruco.drawDetectedMarkers(frame, corners, ids)

        for i, marker_id in enumerate(ids.flatten()):

            image_points = corners[i].reshape(4, 2).astype(
                np.float32
            )

            solved, rvec, tvec = cv2.solvePnP(
                object_points,
                image_points,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_IPPE_SQUARE
            )

            if solved:

                # Draw 3D axes
                cv2.drawFrameAxes(
                    frame,
                    camera_matrix,
                    dist_coeffs,
                    rvec,
                    tvec,
                    MARKER_LENGTH * 0.5
                )

                # Position
                x, y, z = tvec.flatten()

                # Rotation angles
                rotation_matrix, _ = cv2.Rodrigues(rvec)
                angles = cv2.RQDecomp3x3(rotation_matrix)[0]

                rx, ry, rz = angles

                cv2.putText(
                    frame,
                    f"MARKER ID: {marker_id}",
                    (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (0, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"X: {x:.2f}  Y: {y:.2f}  Z: {z:.2f}",
                    (20, 70),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (255, 255, 0),
                    2
                )

                cv2.putText(
                    frame,
                    f"RX: {rx:.1f}  RY: {ry:.1f}  RZ: {rz:.1f}",
                    (20, 105),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.65,
                    (255, 255, 0),
                    2
                )

    else:
        cv2.putText(
            frame,
            "SEARCHING FOR MARKER...",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 0, 255),
            2
        )

    cv2.imshow("WHEEL CART - 3D AR TRACKING", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
