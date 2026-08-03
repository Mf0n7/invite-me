"""Compressão de imagens de evento antes de armazenar.

Reduz o maior lado para MAX_SIDE e re-encoda como JPEG (qualidade JPEG_QUALITY),
aplicando a orientação EXIF. Um upload de vários MB vira ~100-300 KB, mantendo
boa qualidade para exibição.
"""
from io import BytesIO
from pathlib import Path

from django.core.files.base import ContentFile
from PIL import Image, ImageOps

MAX_SIDE = 1600
JPEG_QUALITY = 82


def compress_event_photo(field_file):
    """Retorna (nome, ContentFile) da foto comprimida, ou None se não der."""
    try:
        image = Image.open(field_file)
        image = ImageOps.exif_transpose(image)  # respeita a orientação da câmera
        image = image.convert("RGB")
        image.thumbnail((MAX_SIDE, MAX_SIDE))  # mantém proporção
        buffer = BytesIO()
        image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        buffer.seek(0)
        name = f"{Path(field_file.name).stem}.jpg"
        return name, ContentFile(buffer.read())
    except Exception:  # noqa: BLE001 — falha na compressão não deve quebrar o evento
        return None
