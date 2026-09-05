import random
import string


def generate_account_number() -> str:
    return "".join(random.choices(string.digits, k=20))


def generate_card_number() -> str:
    prefix = "4"
    digits = [int(prefix)] + [random.randint(0, 9) for _ in range(14)]

    total = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        total += d
    check = (10 - (total % 10)) % 10
    digits.append(check)

    raw = "".join(map(str, digits))
    return " ".join(raw[i:i+4] for i in range(0, 16, 4))
