from fastapi import APIRouter, HTTPException, Depends
from auth import token_required
from models import MedicalRecordCreate, RehabCreate, RehabUpdate
from database import get_db

router = APIRouter(prefix="/api/medical", tags=["medical"])

@router.post("/records")
async def create_record(data: MedicalRecordCreate, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO medical_records (user_id, injury_id, diagnosis, treatment_plan, notes, recorded_by) VALUES (?, ?, ?, ?, ?, ?)",
        (data.user_id, data.injury_id, data.diagnosis, data.treatment_plan, data.notes, data.recorded_by),
    )
    db.commit()
    db.close()
    return {"message": "Medical record created", "id": cur.lastrowid}

@router.get("/records/{user_id}")
async def get_records(user_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT m.*, u.name as recorded_by_name FROM medical_records m LEFT JOIN users u ON m.recorded_by = u.id WHERE m.user_id = ? ORDER BY m.recorded_at DESC",
        (user_id,),
    )
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.post("/rehab")
async def create_rehab(data: RehabCreate, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO rehab_sessions (user_id, injury_id, date, progress, notes) VALUES (?, ?, ?, ?, ?)",
        (data.user_id, data.injury_id, data.date, data.progress, data.notes),
    )
    db.commit()
    db.close()
    return {"message": "Rehab session created", "id": cur.lastrowid}

@router.get("/rehab/{user_id}")
async def get_rehab(user_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT * FROM rehab_sessions WHERE user_id = ? ORDER BY date DESC",
        (user_id,),
    )
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.put("/rehab/{session_id}")
async def update_rehab(session_id: int, data: RehabUpdate, user: dict = Depends(token_required)):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [session_id]
    db.execute(f"UPDATE rehab_sessions SET {fields} WHERE id = ?", values)
    db.commit()
    db.close()
    return {"message": "Rehab session updated"}
