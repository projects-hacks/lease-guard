from pypdf import PdfReader

reader = PdfReader("/Users/ganeshthampi/Desktop/lease-guard/Foxit APIs.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

keywords = ["/tasks", "taskId", "GET /pdf-services/api/"]

print(f"Total pages: {len(reader.pages)}")

found_lines = []
for i, page in enumerate(reader.pages):
    page_text = page.extract_text()
    lines = page_text.split('\n')
    for line in lines:
        for kw in keywords:
            if kw in line:
                found_lines.append(f"Page {i+1}: {line.strip()}")

print("\n--- Relevant Lines Found ---")
for line in found_lines:
    print(line)
