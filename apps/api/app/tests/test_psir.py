
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_psir_validate_happy():
    sample = """system S { @entity U(id:uuid) @force RL(on:U) @invariant U.id != null }"""
    r = client.post("/psir/validate", json={"text": sample})
    assert r.status_code == 200
    assert r.json()["ok"] is True

def test_psir_validate_edge_empty_props():
    sample = """system S { @entity U() @force F(on:U) @invariant U.v > 0 }"""
    r = client.post("/psir/validate", json={"text": sample})
    assert r.status_code == 200

def test_psir_validate_negative_unknown_entity():
    sample = """system S { @entity U() @force F(on:X) @invariant U.v > 0 }"""
    r = client.post("/psir/validate", json={"text": sample})
    assert r.status_code == 500
