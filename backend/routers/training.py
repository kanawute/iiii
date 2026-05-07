from fastapi import APIRouter, HTTPException, Depends
from auth import token_required
from models import TrainingCreate, TrainingUpdate
from database import get_db

router = APIRouter(prefix="/api/training", tags=["training"])

@router.post("/")
async def create_training(data: TrainingCreate, user: dict = Depends(token_required)):
    total_load = data.rpe * data.duration
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO training_loads (user_id, date, session_type, rpe, duration, total_load) VALUES (?, ?, ?, ?, ?, ?)",
        (data.user_id, data.date, data.session_type, data.rpe, data.duration, total_load),
    )
    db.commit()
    db.close()
    return {"message": "Training load created", "id": cur.lastrowid, "total_load": total_load}

@router.get("/user/{user_id}")
async def get_training(user_id: int, days: int = 30, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """SELECT * FROM training_loads WHERE user_id = ?
           ORDER BY date DESC LIMIT ?""",
        (user_id, days),
    )
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.get("/{log_id}")
async def get_training_log(log_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM training_loads WHERE id = ?", (log_id,))
    row = cur.fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Log not found")
    return dict(row)

@router.put("/{log_id}")
async def update_training(log_id: int, data: TrainingUpdate, user: dict = Depends(token_required)):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "rpe" in updates or "duration" in updates:
        cur = db.cursor()
        cur.execute("SELECT rpe, duration FROM training_loads WHERE id = ?", (log_id,))
        row = cur.fetchone()
        if row:
            rpe = updates.get("rpe", row["rpe"])
            duration = updates.get("duration", row["duration"])
            updates["total_load"] = rpe * duration
    fields = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [log_id]
    db.execute(f"UPDATE training_loads SET {fields} WHERE id = ?", values)
    db.commit()
    db.close()
    return {"message": "Training load updated"}

@router.delete("/{log_id}")
async def delete_training(log_id: int, user: dict = Depends(token_required)):
    db = get_db()
    db.execute("DELETE FROM training_loads WHERE id = ?", (log_id,))
    db.commit()
    db.close()
    return {"message": "Training load deleted"}
