"""Prepare the pinned MediaPipe files and serve the app on localhost."""
import argparse
from functools import partial
from hashlib import sha256
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent
VISION_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/"
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)
ASSETS = {
    "hand_landmarker.task": "fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1",
    "vision_bundle.mjs": "e77f281f9619150d937023c355bae170e9120e3b9e43f1e23a2a7bee07197669",
    "wasm/vision_wasm_internal.js": "9440cf0cc0cea21800e31581ec32aeedcc5fbf9df4509796bbc7d3f99e52ab9c",
    "wasm/vision_wasm_internal.wasm": "f82a8e6c05e08a44cc9f9e7ec5f845935bcbb1b1500ebe8c2f4812fb4e2917dc",
    "wasm/vision_wasm_nosimd_internal.js": "abe9b6fbeaf86fcb53a5edce3926c82ccb0619e18fed4d9d9ce561ee7f55e054",
    "wasm/vision_wasm_nosimd_internal.wasm": "38b61feab2fd7934e05cbe9f68baa308978a5e3b7f85c1913bb8ae89b8ef8b97",
}


def prepare():
    for name, checksum in ASSETS.items():
        target = ROOT / "tracking" / name
        if target.is_file() and sha256(target.read_bytes()).hexdigest() == checksum:
            continue
        url = MODEL_URL if name == "hand_landmarker.task" else VISION_URL + name
        target.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading {name}", flush=True)
        with tempfile.TemporaryDirectory(dir=target.parent) as temp:
            download = Path(temp) / "download"
            subprocess.run(
                ["curl", "--fail", "--location", "--silent", "--show-error",
                 "--max-time", "120", "--retry", "2", "--output", str(download), url],
                check=True,
            )
            if sha256(download.read_bytes()).hexdigest() != checksum:
                raise SystemExit(f"Unexpected download checksum for {name}")
            download.replace(target)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prepare-only", action="store_true")
    parser.add_argument("--port", type=int, default=8642)
    args = parser.parse_args()
    prepare()
    if not args.prepare_only:
        handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
        with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
            print(f"Open http://127.0.0.1:{server.server_port}/", flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass
