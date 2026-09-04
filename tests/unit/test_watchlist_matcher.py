import pytest
from backend.services.camera_registry.models import WatchlistEntity, WatchlistAlias
from backend.services.watchlist.matcher import watchlist_matcher, calculate_similarity, levenshtein_distance

def test_similarity_calculation():
    assert calculate_similarity("GJ01AB1234", "GJ01AB1234") == 1.0
    assert calculate_similarity("GJ01AB1234", "GJ01AB1235") == 0.9  # 1 char diff in 10 chars
    assert levenshtein_distance("ABCD", "ABCE") == 1
    assert levenshtein_distance("ABCD", "ABCD") == 0

def test_exact_watchlist_match(db_session):
    entity = WatchlistEntity(
        entity_type="VEHICLE",
        identifier="GJ 01 AB 1234",
        normalized_identifier="GJ01AB1234",
        category="STOLEN",
        priority="CRITICAL",
        status="ACTIVE"
    )
    db_session.add(entity)
    db_session.commit()

    res = watchlist_matcher.match_plate(
        raw_plate="GJ 01 AB 1234",
        ocr_confidence=0.95,
        db=db_session
    )
    assert res.matched is True
    assert res.match_type == "EXACT"
    assert res.similarity_score == 1.0
    assert res.entity.id == entity.id

def test_alias_match(db_session):
    entity = WatchlistEntity(
        entity_type="VEHICLE",
        identifier="MH 02 XY 9999",
        normalized_identifier="MH02XY9999",
        category="WANTED",
        priority="HIGH",
        status="ACTIVE"
    )
    db_session.add(entity)
    db_session.flush()

    alias = WatchlistAlias(
        entity_id=entity.id,
        alias="MH02XY9990",  # Common fake/clone alias
        normalization_type="PLATE_NORMALIZED"
    )
    db_session.add(alias)
    db_session.commit()

    res = watchlist_matcher.match_plate(
        raw_plate="MH02XY9990",
        ocr_confidence=0.92,
        db=db_session
    )
    assert res.matched is True
    assert res.match_type == "EXACT"
    assert res.entity.id == entity.id

def test_bounded_fuzzy_match(db_session):
    entity = WatchlistEntity(
        entity_type="VEHICLE",
        identifier="GJ 05 CD 8888",
        normalized_identifier="GJ05CD8888",
        category="SUSPECT",
        priority="HIGH",
        status="ACTIVE"
    )
    db_session.add(entity)
    db_session.commit()

    # Query with 1 character difference (GJ05CD8889) and high OCR confidence
    res = watchlist_matcher.match_plate(
        raw_plate="GJ05CD8889",
        ocr_confidence=0.90,
        db=db_session
    )
    assert res.matched is True
    assert res.match_type == "FUZZY"
    assert res.similarity_score >= 0.88

def test_low_ocr_confidence_fuzzy_rejection(db_session):
    entity = WatchlistEntity(
        entity_type="VEHICLE",
        identifier="GJ 01 XX 1111",
        normalized_identifier="GJ01XX1111",
        category="SUSPECT",
        priority="MEDIUM",
        status="ACTIVE"
    )
    db_session.add(entity)
    db_session.commit()

    # Query with typo and very low OCR confidence (0.40)
    res = watchlist_matcher.match_plate(
        raw_plate="GJ01XX1112",
        ocr_confidence=0.40,
        db=db_session
    )
    assert res.matched is False
