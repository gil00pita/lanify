from collections import OrderedDict
from hashlib import sha256
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, Response
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove


CACHE_SCHEMA_VERSION = "v2"
EDGE_PRESET_OPTIONS = {
    "off": {
        "alpha_matting": False,
        "alpha_matting_background_threshold": 10,
        "alpha_matting_erode_size": 0,
        "alpha_matting_foreground_threshold": 240,
    },
    "sharp": {
        "alpha_matting": True,
        "alpha_matting_background_threshold": 5,
        "alpha_matting_erode_size": 0,
        "alpha_matting_foreground_threshold": 250,
    },
    "balanced": {
        "alpha_matting": True,
        "alpha_matting_background_threshold": 12,
        "alpha_matting_erode_size": 8,
        "alpha_matting_foreground_threshold": 240,
    },
    "soft": {
        "alpha_matting": True,
        "alpha_matting_background_threshold": 24,
        "alpha_matting_erode_size": 20,
        "alpha_matting_foreground_threshold": 220,
    },
}
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
MAX_RESULT_CACHE_ENTRIES = 24
MODEL_SESSIONS = {}
RESULT_CACHE = OrderedDict()
SUPPORTED_MODELS = {"birefnet-portrait", "u2net_human_seg", "u2net"}
SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

app = FastAPI()


def get_session(model_name: str):
    session = MODEL_SESSIONS.get(model_name)

    if session is None:
        session = new_session(model_name)
        MODEL_SESSIONS[model_name] = session

    return session


def build_cache_key(contents: bytes, edge_preset: str, model_name: str, post_process_mask: str) -> str:
    digest = sha256()
    digest.update(CACHE_SCHEMA_VERSION.encode("utf-8"))
    digest.update(contents)
    digest.update(edge_preset.encode("utf-8"))
    digest.update(model_name.encode("utf-8"))
    digest.update(post_process_mask.encode("utf-8"))

    return digest.hexdigest()


def get_cached_result(cache_key: str) -> bytes | None:
    cached = RESULT_CACHE.get(cache_key)

    if cached is None:
        return None

    RESULT_CACHE.move_to_end(cache_key)
    return cached


def store_cached_result(cache_key: str, result: bytes) -> None:
    RESULT_CACHE[cache_key] = result
    RESULT_CACHE.move_to_end(cache_key)

    if len(RESULT_CACHE) > MAX_RESULT_CACHE_ENTRIES:
        RESULT_CACHE.popitem(last=False)


def refine_edges(image_bytes: bytes, edge_preset: str) -> bytes:
    if edge_preset == "off":
        return image_bytes

    image = Image.open(BytesIO(image_bytes)).convert("RGBA")
    alpha = image.getchannel("A")

    if edge_preset == "sharp":
        alpha = alpha.filter(ImageFilter.MinFilter(3))
        alpha = ImageOps.autocontrast(alpha)
        alpha = alpha.point(
            lambda value: 0 if value < 72 else 255 if value > 180 else min(255, int((value - 72) * 2.4))
        )
    elif edge_preset == "balanced":
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=1.5))
        alpha = ImageOps.autocontrast(alpha, cutoff=1)
        alpha = alpha.point(
            lambda value: 0 if value < 36 else 255 if value > 236 else value
        )
    elif edge_preset == "soft":
        alpha = alpha.filter(ImageFilter.GaussianBlur(radius=4.5))
        alpha = alpha.point(lambda value: int(value * 0.88) if value < 224 else value)

    image.putalpha(alpha)
    output = BytesIO()
    image.save(output, format="PNG")

    return output.getvalue()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/remove-background")
async def remove_background(
    image: UploadFile = File(...),
    edgePreset: str = "balanced",
    model: str = "birefnet-portrait",
    postProcessMask: str = "true",
) -> Response:
    if image.content_type not in SUPPORTED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Use a PNG, JPEG, or WebP image.")

    if edgePreset not in EDGE_PRESET_OPTIONS:
        raise HTTPException(status_code=400, detail="Choose a valid edge refinement option.")

    if model not in SUPPORTED_MODELS:
        raise HTTPException(status_code=400, detail="Choose a valid background removal model.")

    contents = await image.read()

    if not contents:
        raise HTTPException(status_code=400, detail="Upload an image before removing the background.")

    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Use an image smaller than 10MB.")

    cache_key = build_cache_key(contents, edgePreset, model, postProcessMask)
    cached_output = get_cached_result(cache_key)

    if cached_output is not None:
        return Response(content=cached_output, media_type="image/png")

    try:
        output = remove(
            contents,
            post_process_mask=postProcessMask == "true",
            session=get_session(model),
            **EDGE_PRESET_OPTIONS[edgePreset],
        )
        output = refine_edges(output, edgePreset)
    except Exception as error:  # pragma: no cover - defensive service boundary
        return JSONResponse(
            content={"error": f"Rembg failed to process the image: {error}"},
            status_code=500,
        )

    store_cached_result(cache_key, output)
    return Response(content=output, media_type="image/png")
