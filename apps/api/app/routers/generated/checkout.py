
from fastapi import APIRouter, HTTPException
from typing import Literal
from pydantic import BaseModel, model_validator
from uuid import UUID, uuid4

router = APIRouter(prefix="/checkout", tags=["generated-checkout"])

# ==== Pydantic Models
# ==== Models for User
class UserCreate(BaseModel):
    id: UUID | None = None
    role: Literal["ADMIN", "USER"]

class UserUpdate(BaseModel):
    role: Literal["ADMIN", "USER"] | None = None

class UserRead(BaseModel):
    id: UUID
    role: Literal["ADMIN", "USER"]


# ==== Models for Order
class OrderCreate(BaseModel):
    id: UUID | None = None
    total: float

    @model_validator(mode="after")
    def _check_invariants(self):
        if not (self.total >= 0):
            raise ValueError("Invariant violated: Order.total >= 0")
        return self

class OrderUpdate(BaseModel):
    total: float | None = None

    @model_validator(mode="after")
    def _check_invariants(self):
        if self.total is not None and not (self.total >= 0):
            raise ValueError("Invariant violated: Order.total >= 0")
        return self

class OrderRead(BaseModel):
    id: UUID
    total: float


# ==== In-memory stores
from typing import Dict as dict  # alias to make type hints explicit
store_user: dict[str, dict] = {
  "user1": {"id":"user1", "role": "ADMIN"},
  "user2": {"id":"user2", "role": "USER"}
}

store_order: dict[str, dict] = {
  "order1": {"id":"order1", "total": 0.0},
  "order2": {"id":"order2", "total": 0.0}
}

# ---- User
@router.get("/user")
def list_user():
    return list(store_user.values())

@router.post("/user")
def create_user(body: UserCreate):
    data = body.model_dump()
    _id = str(data.get("id") or uuid4())
    data["id"] = _id
    store_user[_id] = data
    return data

@router.get("/user/{item_id}")
def get_user(item_id: str):
    obj = store_user.get(item_id)
    if not obj:
      raise HTTPException(status_code=404, detail="User not found")
    return obj

@router.put("/user/{item_id}")
def update_user(item_id: str, body: UserUpdate):
    if item_id not in store_user:
      raise HTTPException(status_code=404, detail="User not found")
    patch = body.model_dump(exclude_unset=True, exclude_none=True)
    patch.pop("id", None)
    store_user[item_id].update(patch)
    return store_user[item_id]

@router.delete("/user/{item_id}")
def delete_user(item_id: str):
    if item_id not in store_user:
      raise HTTPException(status_code=404, detail="User not found")
    del store_user[item_id]
    return {"ok": True}

# ---- Order
@router.get("/order")
def list_order():
    return list(store_order.values())

@router.post("/order")
def create_order(body: OrderCreate):
    data = body.model_dump()
    _id = str(data.get("id") or uuid4())
    data["id"] = _id
    store_order[_id] = data
    return data

@router.get("/order/{item_id}")
def get_order(item_id: str):
    obj = store_order.get(item_id)
    if not obj:
      raise HTTPException(status_code=404, detail="Order not found")
    return obj

@router.put("/order/{item_id}")
def update_order(item_id: str, body: OrderUpdate):
    if item_id not in store_order:
      raise HTTPException(status_code=404, detail="Order not found")
    patch = body.model_dump(exclude_unset=True, exclude_none=True)
    patch.pop("id", None)
    store_order[item_id].update(patch)
    return store_order[item_id]

@router.delete("/order/{item_id}")
def delete_order(item_id: str):
    if item_id not in store_order:
      raise HTTPException(status_code=404, detail="Order not found")
    del store_order[item_id]
    return {"ok": True}
