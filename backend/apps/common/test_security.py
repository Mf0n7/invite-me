"""Testes das proteções de segurança: rate limit, bruteforce e upload.

Rodar:  pytest apps/common/test_security.py
"""
from io import BytesIO

import pytest
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image

from apps.common.ratelimit import client_ip
from apps.common.validators import validate_image_upload

# Cada teste começa com o cache limpo — o rate limit é estado compartilhado.
pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def _clean_cache():
    cache.clear()
    yield
    cache.clear()


def png_bytes(size=(64, 64)) -> bytes:
    buffer = BytesIO()
    Image.new("RGB", size, "red").save(buffer, format="PNG")
    return buffer.getvalue()


def post_login(client, email="alvo@convida.app", password="errada", ip="203.0.113.10"):
    return client.post(
        reverse("v1:rest_login"),
        {"email": email, "password": password},
        content_type="application/json",
        HTTP_X_FORWARDED_FOR=f"9.9.9.9, {ip}",
        HTTP_HOST="localhost",
    )


# ------------------------------------------------------------------ bruteforce
def test_login_bloqueia_na_11a_tentativa(client):
    """10 tentativas passam (400 = credencial inválida); a 11ª vira 429."""
    codes = [post_login(client).status_code for _ in range(11)]
    assert codes[:10] == [400] * 10
    assert codes[10] == 429


def test_apos_bloqueio_limite_cai_para_5(client):
    from apps.common.ratelimit import clear
    from apps.common.throttling import LoginBruteForceThrottle

    for _ in range(11):
        post_login(client)

    # Simula a passagem da janela de 60s: some a contagem, fica a flag estrita.
    window_key, _ = LoginBruteForceThrottle._keys("203.0.113.10", "alvo@convida.app")
    clear(window_key)

    codes = [post_login(client).status_code for _ in range(6)]
    assert codes[:5] == [400] * 5, "modo estrito deve permitir 5"
    assert codes[5] == 429, "a 6ª deve ser bloqueada no modo estrito"


def test_login_sem_barra_final_tambem_e_limitado(client):
    """Regressão: `/auth/login` (sem a barra) resolvia para a view do
    dj-rest-auth, sem throttle — dava para burlar o bloqueio apagando um
    caractere da URL. Os padrões em apps/accounts/urls.py usam `/?$`."""
    codes = []
    for _ in range(11):
        codes.append(
            client.post(
                "/api/v1/auth/login",
                {"email": "alvo@convida.app", "password": "errada"},
                content_type="application/json",
                HTTP_X_FORWARDED_FOR="9.9.9.9, 203.0.113.44",
                HTTP_HOST="localhost",
            ).status_code
        )
    assert codes[10] == 429


def test_ips_diferentes_nao_compartilham_o_limite(client):
    for _ in range(11):
        post_login(client, ip="203.0.113.10")
    assert post_login(client, ip="203.0.113.77").status_code != 429


def test_login_valido_zera_a_contagem(client, django_user_model):
    django_user_model.objects.create_user(email="ana@convida.app", password="Senha!Forte123")

    for _ in range(9):
        post_login(client, email="ana@convida.app")

    ok = post_login(client, email="ana@convida.app", password="Senha!Forte123")
    assert ok.status_code == 200

    # Janela zerada: as 10 tentativas seguintes voltam a caber.
    codes = [post_login(client, email="ana@convida.app").status_code for _ in range(10)]
    assert 429 not in codes


# ------------------------------------------------------------------ rate limit por IP
def test_middleware_barra_burst_por_ip(client, settings):
    limit = settings.RATE_LIMIT["BURST"]
    url = reverse("v1:billing:tiers")
    codes = [
        client.get(
            url, HTTP_X_FORWARDED_FOR="9.9.9.9, 198.51.100.5", HTTP_HOST="localhost"
        ).status_code
        for _ in range(limit + 1)
    ]
    assert codes[:limit] == [200] * limit
    assert codes[limit] == 429


def test_healthcheck_isento_do_rate_limit(client):
    codes = [
        client.get("/healthz/", HTTP_X_FORWARDED_FOR="9.9.9.9, 198.51.100.6",
                   HTTP_HOST="localhost").status_code
        for _ in range(120)
    ]
    assert set(codes) == {200}


def test_ip_real_vem_do_ultimo_salto_do_xff(rf):
    request = rf.get("/", REMOTE_ADDR="10.0.0.1", HTTP_X_FORWARDED_FOR="6.6.6.6, 203.0.113.9")
    # 6.6.6.6 seria o valor forjado pelo cliente; o proxy anexa o IP real no fim.
    assert client_ip(request) == "203.0.113.9"


# ------------------------------------------------------------------ upload de imagem
def test_imagem_valida_e_aceita():
    validate_image_upload(SimpleUploadedFile("f.png", png_bytes(), content_type="image/png"))


@pytest.mark.parametrize(
    "name,content,content_type",
    [
        ("shell.jpg", b"<?php system($_GET['c']); ?>", "image/jpeg"),
        ("x.svg", b"<svg onload=alert(1)>", "image/svg+xml"),
        ("p.gif", b"GIF89a<script>alert(1)</script>", "image/gif"),
        ("nota.pdf", b"%PDF-1.4 fake", "application/pdf"),
    ],
)
def test_arquivo_que_nao_e_imagem_e_rejeitado(name, content, content_type):
    with pytest.raises(ValidationError):
        validate_image_upload(SimpleUploadedFile(name, content, content_type=content_type))


def test_extensao_dupla_e_rejeitada():
    with pytest.raises(ValidationError):
        validate_image_upload(
            SimpleUploadedFile("foto.png.html", png_bytes(), content_type="image/png")
        )


def test_imagem_acima_do_limite_de_tamanho_e_rejeitada():
    from apps.common.validators import MAX_IMAGE_BYTES

    grande = SimpleUploadedFile(
        "g.png", b"\x89PNG" + b"0" * MAX_IMAGE_BYTES, content_type="image/png"
    )
    with pytest.raises(ValidationError):
        validate_image_upload(grande)


def test_nome_do_arquivo_e_gerado_pelo_servidor():
    """O nome enviado pelo usuário é descartado — sem traversal nem dupla extensão."""
    from apps.events.models import event_photo_path

    class FakeEvent:
        uuid = "abc"

    path = event_photo_path(FakeEvent(), "../../../etc/passwd")
    assert path.startswith("events/abc/")
    assert path.endswith(".jpg")
    assert ".." not in path


def test_media_so_serve_extensao_de_imagem(client):
    resp = client.get("/media/events/x/shell.php", HTTP_HOST="localhost")
    assert resp.status_code == 404


# ------------------------------------------------------------------ rotas públicas
def test_confirmacao_publica_tem_teto_de_escrita(client, settings, django_user_model):
    from django.utils import timezone

    from apps.events.models import Event

    owner = django_user_model.objects.create_user(email="dono@convida.app", password="x1234567!")
    event = Event.objects.create(
        owner=owner, title="Festa", address="Rua 1", starts_at=timezone.now()
    )
    link = event.ensure_link()

    url = reverse("v1:rsvps:public-confirm", args=[link.token])
    codes = []
    for i in range(14):
        resp = client.post(
            url,
            {"name": f"Convidado {i}"},
            content_type="application/json",
            HTTP_X_FORWARDED_FOR=f"9.9.9.9, 198.51.100.{20}",
            HTTP_HOST="localhost",
        )
        codes.append(resp.status_code)

    assert codes[:12] == [201] * 12, "12/min devem passar"
    assert codes[12] == 429, "a 13ª confirmação do mesmo IP deve ser barrada"
