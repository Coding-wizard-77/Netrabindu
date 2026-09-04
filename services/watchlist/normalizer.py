import re
from typing import Tuple

# Standard Indian State and UT 2-letter codes
INDIAN_STATE_CODES = {
    "AN", "AP", "AR", "AS", "BR", "CH", "CG", "DD", "DL", "DN",
    "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD",
    "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "PB", "PY", "RJ",
    "SK", "TN", "TR", "TS", "UK", "UP", "WB"
}

CHAR_TO_DIGIT = {
    'O': '0', 'D': '0', 'Q': '0',
    'I': '1', 'L': '1', 'T': '1',
    'Z': '2',
    'B': '8',
    'S': '5',
    'G': '6'
}

DIGIT_TO_CHAR = {
    '0': 'O',
    '1': 'I',
    '8': 'B',
    '5': 'S',
    '2': 'Z',
    '6': 'G'
}

def remove_punctuation_and_spaces(text: str) -> str:
    """Remove all spaces, dots, dashes, slashes, and special symbols."""
    return re.sub(r'[^A-Za-z0-9]', '', text).upper()

def normalize_plate(raw: str) -> str:
    """
    Context-aware Indian license plate normalization.
    Preserves valid characters and maps confusions only when positionally sound.
    Format 1: SS DD AA NNNN (e.g., GJ01AB1234)
    Format 2: YY BH NNNN AA (e.g., 22BH1234AA)
    """
    if not raw:
        return ""

    cleaned = remove_punctuation_and_spaces(raw)
    if len(cleaned) < 4:
        return cleaned

    chars = list(cleaned)

    # Check for Bharat Series (e.g. 22BH...)
    is_bh_series = (
        len(chars) >= 8 and
        (chars[0].isdigit() or chars[0] in CHAR_TO_DIGIT) and
        (chars[1].isdigit() or chars[1] in CHAR_TO_DIGIT) and
        chars[2] in ('B', '8') and
        chars[3] in ('H', '4')
    )

    if is_bh_series:
        chars[0] = CHAR_TO_DIGIT.get(chars[0], chars[0])
        chars[1] = CHAR_TO_DIGIT.get(chars[1], chars[1])
        chars[2] = 'B'
        chars[3] = 'H'
        # Next 4 are digits
        for i in range(4, min(8, len(chars))):
            chars[i] = CHAR_TO_DIGIT.get(chars[i], chars[i])
        # Trailing 1-2 are letters
        for i in range(8, len(chars)):
            chars[i] = DIGIT_TO_CHAR.get(chars[i], chars[i])
        return "".join(chars)

    # Standard State Series: SS DD [Letters] [Digits]
    # Pos 0 & 1: State code (Must be Alphabetic)
    if len(chars) >= 2:
        chars[0] = DIGIT_TO_CHAR.get(chars[0], chars[0])
        chars[1] = DIGIT_TO_CHAR.get(chars[1], chars[1])

    # Pos 2 & 3: District RTO code (Must be Digits)
    if len(chars) >= 4:
        chars[2] = CHAR_TO_DIGIT.get(chars[2], chars[2])
        chars[3] = CHAR_TO_DIGIT.get(chars[3], chars[3])

    # Suffix handling: separate remaining into intermediate letters (series) and trailing digits (number)
    # Example: GJ01AB1234 -> series: AB, number: 1234
    suffix = "".join(chars[4:])
    if not suffix:
        return "".join(chars[:4])

    # In Indian registration, number at the end is 1 to 4 digits.
    # Take the trailing 1-4 characters as number candidates, and earlier characters as series.
    # If suffix length is <= 4 and characters are mostly digits, it's number only.
    if len(suffix) <= 4 and all(c.isdigit() or c in ('O', 'D', 'I', 'L', 'T', 'Z', 'S') for c in suffix):
        number_norm = "".join(CHAR_TO_DIGIT.get(c, c) for c in suffix)
        return "".join(chars[:4]) + number_norm

    # For suffix with series + number (e.g. AB1234 or A1234 or ABC1234):
    # Trailing number is up to 4 characters from end
    num_len = min(4, len(suffix) - 1)
    # Check if there is an obvious transition to digits
    split_idx = len(suffix) - num_len
    # If earlier characters exist, treat them as series
    series_part = suffix[:split_idx]
    number_part = suffix[split_idx:]

    # Map series to letters (0->O, 1->I, 8->B, etc.)
    series_norm = "".join(DIGIT_TO_CHAR.get(c, c) for c in series_part)
    # Map number to digits (O->0, I->1, B->8, etc.)
    number_norm = "".join(CHAR_TO_DIGIT.get(c, c) for c in number_part)
    return "".join(chars[:4]) + series_norm + number_norm

def validate_indian_plate_shape(plate: str) -> bool:
    """Returns True if normalized plate strictly follows Indian standard shapes."""
    norm = normalize_plate(plate)
    # Standard: 2 letters, 2 digits, 1-3 letters, 1-4 digits
    std_regex = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$'
    # Bharat Series: 2 digits, BH, 4 digits, 1-2 letters
    bh_regex = r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$'
    return bool(re.match(std_regex, norm) or re.match(bh_regex, norm))
