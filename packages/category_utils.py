from decimal import Decimal

from .models import Package


TARGET_CATEGORIES = [
    Package.ADVENTURE,
    Package.FAMILY,
    Package.LUXURY,
    Package.BUDGET,
    Package.CULTURAL,
    Package.RELIGIOUS,
]

RELIGIOUS_DESTINATIONS = {
    "amritsar",
    "aswan",
    "bodh gaya",
    "cappadocia",
    "chiang mai",
    "gyeongju",
    "jerusalem",
    "kyoto",
    "leh",
    "luang prabang",
    "madinah",
    "makkah",
    "meteora",
    "nara",
    "petra",
    "rishikesh",
    "tirupati",
    "varanasi",
    "vatican city",
    "yogyakarta",
}

HERITAGE_DESTINATIONS = {
    "aswan",
    "cappadocia",
    "edinburgh",
    "gyeongju",
    "gotland",
    "istanbul",
    "kyoto",
    "marrakech",
    "mont saint-michel",
    "nara",
    "oaxaca",
    "quebec city",
    "rome",
    "seville",
    "shirakawa-go",
    "tuscany",
    "yogyakarta",
}


def normalize_package_category(raw_category, vibe="", destination_name="", total_cost=0):
    category_text = str(raw_category or "").strip().lower()
    vibe_text = str(vibe or "").strip().lower()
    destination_text = str(destination_name or "").split(",")[0].strip().lower()
    amount = Decimal(str(total_cost or 0))

    if (
        destination_text in RELIGIOUS_DESTINATIONS
        or "religious" in category_text
        or "temple" in category_text
        or "pilgrim" in category_text
        or "monastery" in category_text
    ):
        return Package.RELIGIOUS
    if amount >= Decimal("3200") or (
        vibe_text == "couple"
        and any(token in category_text for token in ["beach", "ocean", "island", "lake"])
    ):
        return Package.LUXURY
    if amount <= Decimal("1200") or vibe_text == "solo":
        return Package.BUDGET
    if destination_text in HERITAGE_DESTINATIONS or any(token in category_text for token in ["city", "history"]):
        return Package.CULTURAL
    if vibe_text == "family":
        return Package.FAMILY
    return Package.ADVENTURE
