import os
import sys
import warnings
import json

from img2table.document import Image
# from img2table.ocr import EasyOCR
from img2table.ocr import TesseractOCR


# img2table needs to pass an additional argument to the BeautifulSoup constructor to avoid a warning. Shouldn't affect the output.
warnings.filterwarnings("ignore", category=UserWarning, module='img2table')

# get current directory and remove the last folder from the path
configpath = os.path.dirname(os.path.dirname(os.path.realpath(__file__))) + "/config.json"

with open(configpath) as f:
    config = json.load(f)

print("OCR module loaded.")


def process_image(image_path):
    print("Processing image:", image_path)

    # Instantiation of OCR
    # ocr = EasyOCR(lang=[config["ocr_lang"]], kw={"gpu": config["use_gpu"]})
    ocr = TesseractOCR(n_threads=3, lang="eng")

    # Instantiation of document, either an image or a PDF
    doc = Image(image_path)

    # Extract tables from the document
    extracted_table = doc.extract_tables(ocr=ocr, min_confidence=config["min_confidence"])

    # Save the table to an HTML file
    table_name = os.path.splitext(image_path)[0] + ".html"
    with open(table_name, "w") as f:
        f.write(extracted_table[0].html)

    print("Table saved to:", table_name)

    return 0
    # return path to the table
    # return table_name

# Check if a command line argument was given
if len(sys.argv) > 1:
    process_image(sys.argv[1])
else:
    print("No image file provided.")