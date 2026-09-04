import os
import sys
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from backend.database import get_db_context
    from backend.services.camera_registry.service import camera_registry_service
except ImportError:
    from database import get_db_context
    from services.camera_registry.service import camera_registry_service

def import_csv(file_path: str):
    if not os.path.exists(file_path):
        print(f"[!] Error: File not found: {file_path}")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    with get_db_context() as db:
        result = camera_registry_service.import_from_csv_content(content, db)
        print(f"[*] Import Summary:")
        print(f"    Total Imported: {result.imported_count}")
        print(f"    Total Failed:   {result.failed_count}")
        if result.errors:
            print("[!] Errors encountered:")
            for err in result.errors:
                print(f"    - Row {err.get('row')}: {err.get('error')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import camera inventory from CSV")
    parser.add_argument("file", help="Path to CSV inventory file")
    args = parser.parse_args()
    import_csv(args.file)
