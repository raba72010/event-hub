import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_pptx(pptx_path):
    if not os.path.exists(pptx_path):
        print(f"File not found: {pptx_path}")
        return

    text_runs = []
    with zipfile.ZipFile(pptx_path, 'r') as zip_ref:
        for item in zip_ref.namelist():
            if item.startswith('ppt/slides/slide') and item.endswith('.xml'):
                xml_content = zip_ref.read(item)
                root = ET.fromstring(xml_content)
                # The text is stored in <a:t> elements within the <a:r> elements
                for elem in root.iter():
                    if elem.tag.endswith('}t'):
                        if elem.text:
                            text_runs.append(elem.text)
                text_runs.append("\n--- SLIDE BREAK ---\n")
    
    print("\n".join(text_runs))

extract_text_from_pptx(sys.argv[1])
