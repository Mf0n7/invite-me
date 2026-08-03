"""Validação e re-encode das imagens de evento antes de armazenar.

Segurança: **todo** upload é aberto pelo Pillow e re-escrito como JPEG novo.
Isso descarta qualquer conteúdo que não seja pixel — metadados EXIF, comentários,
payloads escondidos em chunks do PNG, arquivos polyglot (um GIF que também é
HTML/PHP válido). O que é gravado em disco é um arquivo gerado por nós, não o
que o usuário enviou.

Se o re-encode falhar, o upload é **rejeitado** (400) em vez de gravar o
original — nunca guardamos bytes não processados.

A redução para MAX_SIDE também limita o custo de armazenamento e banda.
"""
from io import BytesIO

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from PIL import Image, ImageOps

from apps.common.validators import validate_image_upload

MAX_SIDE = 1600
JPEG_QUALITY = 82


def process_event_photo(field_file) -> tuple[str, ContentFile]:
    """Valida e re-encoda a foto. Retorna (nome, conteúdo) ou levanta ValidationError."""
    validate_image_upload(field_file)

    try:
        field_file.seek(0)
        image = Image.open(field_file)
        image = ImageOps.exif_transpose(image)  # respeita a orientação da câmera
        image = image.convert("RGB")            # descarta alpha/paleta e metadados
        image.thumbnail((MAX_SIDE, MAX_SIDE))   # mantém proporção
        buffer = BytesIO()
        # Sem `exif=` e sem `icc_profile=`: o arquivo final não carrega metadado
        # nenhum do original (inclusive geolocalização da foto).
        image.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        buffer.seek(0)
    except ValidationError:
        raise
    except Exception as exc:  # noqa: BLE001 — Pillow levanta vários tipos
        raise ValidationError("Não foi possível processar a imagem enviada.") from exc

    return "photo.jpg", ContentFile(buffer.read())
