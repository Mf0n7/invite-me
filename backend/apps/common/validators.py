"""Validação de entradas vindas do usuário — uploads e URLs.

O ORM já nos protege de SQL injection; o vetor real que sobra é **arquivo**:
a foto do evento e a planilha de convidados. As regras aqui são de lista branca
(o que é permitido), nunca de lista negra.
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import urlsplit

from django.core.exceptions import ValidationError
from PIL import Image

# --------------------------------------------------------------- imagens
MAX_IMAGE_BYTES = 5 * 1024 * 1024          # 5 MB no upload
MAX_IMAGE_PIXELS = 40_000_000              # ~40 MP: barra "decompression bomb"
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

# Teto global do Pillow (levanta DecompressionBombError acima disso).
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def validate_image_upload(uploaded) -> None:
    """Valida a foto do evento antes de qualquer processamento.

    Checa, nesta ordem: tamanho, extensão, content-type declarado e —
    o que realmente importa — o **formato real detectado pelo Pillow**.
    Um `.jpg` que na verdade é HTML, PHP ou SVG morre aqui.
    """
    size = getattr(uploaded, "size", None)
    if size is not None and size > MAX_IMAGE_BYTES:
        raise ValidationError(
            f"Imagem muito grande ({size // 1024} KB). O limite é "
            f"{MAX_IMAGE_BYTES // (1024 * 1024)} MB."
        )

    name = (getattr(uploaded, "name", "") or "").lower()
    if Path(name).suffix not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            "Formato não suportado. Envie JPG, PNG, WEBP ou GIF."
        )

    content_type = (getattr(uploaded, "content_type", "") or "").lower().split(";")[0]
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("Tipo de arquivo não suportado. Envie uma imagem.")

    _assert_real_image(uploaded)


def _assert_real_image(uploaded) -> None:
    """Abre o arquivo com o Pillow e confere o formato/dimensões reais."""
    try:
        uploaded.seek(0)
        with Image.open(uploaded) as probe:
            image_format = probe.format
            width, height = probe.size
            probe.verify()  # detecta arquivo truncado/corrompido
    except ValidationError:
        raise
    except Exception as exc:  # noqa: BLE001 — Pillow levanta vários tipos
        raise ValidationError("Arquivo de imagem inválido ou corrompido.") from exc
    finally:
        try:
            uploaded.seek(0)
        except Exception:  # noqa: BLE001
            pass

    if image_format not in ALLOWED_IMAGE_FORMATS:
        raise ValidationError("Formato não suportado. Envie JPG, PNG, WEBP ou GIF.")
    if width * height > MAX_IMAGE_PIXELS:
        raise ValidationError("Imagem com resolução acima do permitido.")


# --------------------------------------------------------------- planilhas
MAX_SPREADSHEET_BYTES = 2 * 1024 * 1024
MAX_SPREADSHEET_ROWS = 5_000
ALLOWED_SPREADSHEET_EXTENSIONS = {".csv", ".xlsx", ".xlsm"}


def validate_spreadsheet_upload(uploaded) -> None:
    size = getattr(uploaded, "size", None)
    if size is not None and size > MAX_SPREADSHEET_BYTES:
        raise ValidationError(
            f"Arquivo muito grande. O limite é {MAX_SPREADSHEET_BYTES // (1024 * 1024)} MB."
        )
    name = (getattr(uploaded, "name", "") or "").lower()
    if Path(name).suffix not in ALLOWED_SPREADSHEET_EXTENSIONS:
        raise ValidationError("Formato não suportado. Envie um arquivo .csv ou .xlsx.")


# --------------------------------------------------------------- URLs
SAFE_URL_SCHEMES = {"http", "https"}


def validate_safe_url(value: str) -> str:
    """Só http/https. Barra `javascript:`, `data:` e afins vindos do usuário."""
    if not value:
        return value
    scheme = urlsplit(value).scheme.lower()
    if scheme not in SAFE_URL_SCHEMES:
        raise ValidationError("Informe um link começando com http:// ou https://.")
    return value
