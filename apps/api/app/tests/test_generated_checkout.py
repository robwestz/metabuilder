
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_checkout_list_user_happy():
    r = client.get("/checkout/user")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_checkout_create_user_edge():
    r = client.post("/checkout/user", json={"role": "ADMIN"})
    assert r.status_code == 200
    body = r.json()
    assert "id" in body and body["role"] == "ADMIN"

def test_checkout_get_user_negative_404():
    r = client.get("/checkout/user/__nope__")
    assert r.status_code == 404

# --- New validation tests (typed models + invariants)

def test_checkout_create_user_invalid_role_negative():
    r = client.post("/checkout/user", json={"role": "HACKER"})
    assert r.status_code == 422  # Literal[...] validation

def test_checkout_create_order_invariant_negative_total():
    r = client.post("/checkout/order", json={"total": -1})
    assert r.status_code == 422  # @model_validator triggered

def test_checkout_update_order_invariant_negative_total():
    # create valid first
    created = client.post("/checkout/order", json={"total": 1.0})
    assert created.status_code == 200
    oid = created.json()["id"]
    # update with invalid total
    updated = client.put(f"/checkout/order/{oid}", json={"total": -5})
    assert updated.status_code == 422
