import cv2
import numpy as np
from PIL import Image
import tempfile

def deskew(image):
    co_ords = np.column_stack(np.where(image > 0))
    angle = cv2.minAreaRect(co_ords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    (h, w) = image.shape[:2]

    center = (w // 2, h // 2)

    M = cv2.getRotationMatrix2D(center, angle, 1.0)

    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC,

    borderMode=cv2.BORDER_REPLICATE)

    return rotated

def set_image_dpi(file_path):

    im = Image.open(file_path)

    length_x, width_y = im.size

    factor = min(1, float(1024.0 / length_x))

    size = int(factor * length_x), int(factor * width_y)

    im_resized = im.resize(size, Image.ANTIALIAS)

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")

    temp_filename = temp_file.name

    im_resized.save(temp_filename, dpi=(300, 300))

    return temp_filename

def remove_noise(image):
    return cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 15)

def get_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def thresholding(image):
    return cv2.threshold(image, 0, 255, cv2.THRESH_BINARY +
    cv2.THRESH_OTSU) [1]

img = cv2.imread('image.jpg', cv2.IMREAD_UNCHANGED)
norm_img = np.zeros((img.shape[0], img.shape[1]))
img = cv2.normalize(img, norm_img, 0, 255, cv2.NORM_MINMAX)

gray = get_grayscale(img)
thresh = thresholding(gray)
deskewed = deskew(thresh)
dpi_set = set_image_dpi(deskewed)
noise_removed = remove_noise(dpi_set)


