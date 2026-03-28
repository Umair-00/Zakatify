import anthropic, base64, subprocess, os, time, re

client = anthropic.Anthropic()

PDF_PATH = "Zakat Guide.pdf"
OUTPUT_FILE = "zakat_extracted.txt"
DPI = 250
PAGE_DIR = "/tmp/zakat_pages"
TEST_ONLY = False                  # set to False for full run

os.makedirs(PAGE_DIR, exist_ok=True)

# Step 1: Convert PDF pages to images
print("Converting PDF to images...")
subprocess.run([
    "pdftoppm", "-jpeg", "-r", str(DPI),
    PDF_PATH, f"{PAGE_DIR}/page"
], check=True)

pages = sorted([f for f in os.listdir(PAGE_DIR) if f.endswith(".jpg")])
print(f"Found {len(pages)} pages total")

if TEST_ONLY:
    pages = pages[:10]
    print("TEST MODE: processing first 10 pages only")

SYSTEM_PROMPT = """You are transcribing a scholarly Islamic text on zakat jurisprudence.
Extract the text from the page image with maximum accuracy.

Rules:
- Preserve all transliteration diacritics exactly (ā, ī, ū, ẓ, ḥ, etc.)
- Preserve Arabic script exactly as written if it appears
- Preserve all footnote markers and footnote text
- Preserve chapter headings, section titles, and numbering
- Do not summarize, paraphrase, or add commentary
- Output only the transcribed text, nothing else
- If any word or phrase is unclear due to image quality, mark it as [unclear: your best guess]
- If you are uncertain between two readings, write [unclear: option1 or option2]"""

all_text = []

for i, page_file in enumerate(pages):
    page_path = f"{PAGE_DIR}/{page_file}"

    with open(page_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    print(f"Processing page {i+1}/{len(pages)}...")

    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": "image/jpeg",
                        "data": image_data
                    }
                },
                {
                    "type": "text",
                    "text": f"Transcribe page {i+1} exactly."
                }
            ]
        }]
    )

    page_text = response.content[0].text
    all_text.append(f"--- PAGE {i+1} ---\n{page_text}")
    time.sleep(0.5)

# Step 2: Write output file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n\n".join(all_text))

print(f"\nDone. Saved to {OUTPUT_FILE}")

# Step 3: Validation report — print all flagged unclear spots
full_text = "\n\n".join(all_text)
flags = [(m.start(), m.group()) for m in re.finditer(r'\[unclear[^\]]*\]', full_text)]
print(f"Flagged unclear spots: {len(flags)}")
for pos, flag in flags:
    snippet = full_text[max(0, pos-80):pos+80].replace("\n", " ")
    print(f"  {flag} → ...{snippet}...")
