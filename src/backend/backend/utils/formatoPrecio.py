from decimal import Decimal

def formato_ars(valor):
    if valor is None:
        return "Sin información"

    if Decimal(valor) == Decimal("0"):
        return "0"

    return f"${Decimal(valor):,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
