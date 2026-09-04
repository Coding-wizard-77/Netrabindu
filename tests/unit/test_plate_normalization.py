import pytest
from backend.services.watchlist.normalizer import (
    normalize_plate, validate_indian_plate_shape, remove_punctuation_and_spaces
)

def test_remove_punctuation_and_spaces():
    assert remove_punctuation_and_spaces("GJ-01-AB-1234") == "GJ01AB1234"
    assert remove_punctuation_and_spaces("GJ.01 AB 1234") == "GJ01AB1234"
    assert remove_punctuation_and_spaces("gj 01/ab/1234") == "GJ01AB1234"

def test_standard_plate_normalization():
    assert normalize_plate("GJ 01 AB 1234") == "GJ01AB1234"
    assert normalize_plate("MH-12-CD-5678") == "MH12CD5678"
    assert normalize_plate("DL-04-A-0001") == "DL04A0001"
    assert normalize_plate("GJ 27 BH 9999") == "GJ27BH9999"

def test_bharat_series_normalization():
    assert normalize_plate("22 BH 1234 AA") == "22BH1234AA"
    assert normalize_plate("22-bh-1234-a") == "22BH1234A"

def test_context_aware_ocr_confusion_correction():
    # Pos 0 & 1 (State code): Digits mapped to letters (0->O, 1->I)
    # Pos 2 & 3 (RTO code): Letters mapped to digits (O->0, I->1, B->8, S->5, Z->2)
    # Number part: Letters mapped to digits (O->0, I->1, B->8)
    assert normalize_plate("GJO1AB1234") == "GJ01AB1234"  # 'O' in district code -> '0'
    assert normalize_plate("GJI1AB1234") == "GJ11AB1234"  # 'I' in district code -> '1'
    assert normalize_plate("GJ01AB123O") == "GJ01AB1230"  # 'O' in number -> '0'
    assert normalize_plate("GJ01AB123I") == "GJ01AB1231"  # 'I' in number -> '1'

def test_validate_indian_plate_shape():
    assert validate_indian_plate_shape("GJ01AB1234") is True
    assert validate_indian_plate_shape("MH12CD5678") is True
    assert validate_indian_plate_shape("22BH1234AA") is True
    assert validate_indian_plate_shape("INVALID123") is False
    assert validate_indian_plate_shape("1234567") is False
