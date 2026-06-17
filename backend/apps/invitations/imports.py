"""Parse de planilhas (xlsx/csv) para extrair nomes de convidados."""
import csv
import io

from openpyxl import load_workbook

HEADER_WORDS = {"nome", "name", "convidado", "guest", "nome do convidado"}


class ImportError_(ValueError):
    """Erro de importação com mensagem amigável."""


def parse_guest_names(uploaded_file) -> list[str]:
    filename = (getattr(uploaded_file, "name", "") or "").lower()
    if filename.endswith(".csv"):
        rows = _read_csv(uploaded_file)
    elif filename.endswith((".xlsx", ".xlsm")):
        rows = _read_xlsx(uploaded_file)
    else:
        raise ImportError_("Formato não suportado. Envie um arquivo .csv ou .xlsx.")
    return _clean(rows)


def _clean(values: list[str]) -> list[str]:
    names: list[str] = []
    for i, raw in enumerate(values):
        value = (raw or "").strip()
        if not value:
            continue
        if i == 0 and value.lower() in HEADER_WORDS:  # ignora cabeçalho
            continue
        names.append(value[:120])
    return names


def _read_csv(f) -> list[str]:
    data = f.read()
    if isinstance(data, bytes):
        data = data.decode("utf-8-sig", errors="replace")
    reader = csv.reader(io.StringIO(data))
    return [row[0] if row else "" for row in reader]


def _read_xlsx(f) -> list[str]:
    wb = load_workbook(f, read_only=True, data_only=True)
    ws = wb.active
    rows = [
        str(row[0]) if row and row[0] is not None else ""
        for row in ws.iter_rows(values_only=True)
    ]
    wb.close()
    return rows
