import sys
import os
import json

if len(sys.argv) < 2:
    print(json.dumps({"error": "No file path provided"}))
    sys.exit(1)

file_path = sys.argv[1]

if not os.path.exists(file_path):
    print(json.dumps({"error": f"File not found: {file_path}"}))
    sys.exit(1)

# پردازش فایل (اینجا می‌توانید هر کاری انجام دهید)
file_name = os.path.basename(file_path)

# بازگشت پاسخ JSON
response = {
    "message": f"File processed successfully: {file_name}",
    "file_path": file_path,
    "status": "success"
}

print(json.dumps(response))
sys.exit(0)
