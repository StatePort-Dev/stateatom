"""Portable browser launcher for the prototype regression suites.

Default: Chromium installed by `python -m playwright install chromium`.
Optional CHROMIUM_EXECUTABLE selects an existing browser binary.
"""
import os
from pathlib import Path

def launch_browser(playwright):
    options = {}
    executable = os.environ.get("CHROMIUM_EXECUTABLE")
    if executable:
        path = Path(executable).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f"CHROMIUM_EXECUTABLE does not exist: {path}")
        options["executable_path"] = str(path)
    return playwright.chromium.launch(**options)
