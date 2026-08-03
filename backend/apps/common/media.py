"""Servidor de mídia endurecido.

O Django serve os uploads em produção (volume persistente montado em
MEDIA_ROOT). O `django.views.static.serve` cru adivinha o Content-Type pelo
nome do arquivo — o que transforma qualquer arquivo que tenha escapado da
validação num vetor de XSS armazenado. Aqui:

* só extensões de imagem são servidas (o resto vira 404);
* o Content-Type vem de uma tabela fixa, nunca de `mimetypes.guess_type`;
* `nosniff` + `Content-Disposition: inline` com nome saneado.
"""
from __future__ import annotations

from pathlib import PurePosixPath

from django.conf import settings
from django.http import Http404
from django.views.static import serve

CONTENT_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
}

CACHE_SECONDS = 7 * 24 * 3600


def serve_media(request, path: str):
    name = PurePosixPath(path).name
    content_type = CONTENT_TYPES.get(PurePosixPath(path).suffix.lower())
    if not content_type:
        raise Http404("Arquivo não disponível.")

    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    if response.status_code == 200:
        response["Content-Type"] = content_type
        response["X-Content-Type-Options"] = "nosniff"
        response["Content-Disposition"] = f'inline; filename="{name}"'
        response["Cache-Control"] = f"public, max-age={CACHE_SECONDS}"
    return response
