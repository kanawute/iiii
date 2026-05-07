from fastapi import APIRouter, HTTPException, Depends
from auth import token_required
from models import WellnessCreate, WellnessUpdate
from database import get_db
from notifications import check_red_flag, build_alert_message, send_line_notify

router = APIRouter(prefix="/api/wellness", tags=["wellness"])

def calc_score(sleep, fatigue, stress, soreness):
    return (sleep + (6 - fatigue) + (6 - stress) + (6 - soreness)) / 4.0 * 20

@router.post("/")
async def create_wellness(data: WellnessCreate, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO wellness_logs (user_id, date, sleep, fatigue, stress, soreness) VALUES (?, ?, ?, ?, ?, ?)",
        (data.user_id, data.date, data.sleep, data.fatigue, data.stress, data.soreness),
    )
    db.commit()

    # Check red flag
    score = calc_score(data.sleep, data.fatigue, data.stress, data.soreness)
    cur.execute("SELECT total_load FROM training_loads WHERE user_id = ? ORDER BY date DESC LIMIT 28", (data.user_id,))
    loads = [dict(r) for r in cur.fetchall()]
    acwr = None
    if len(loads) >= 28:
        acute = sum(l["total_load"] for l in loads[:7]) / 7.0
        chronic = sum(l["total_load"] for l in loads[:28]) / 28.0
        if chronic > 0:
            acwr = round(acute / chronic, 2)

    cur.execute("SELECT COUNT(*) FROM injury_logs WHERE user_id = ? AND status = 'open'", (data.user_id,))
    open_injuries = cur.fetchone()[0]

    flag = check_red_flag(score, acwr, open_injuries)
    cur.execute("SELECT name FROM users WHERE id = ?", (data.user_id,))
    name = cur.fetchone()["name"]
    db.close()

    alert_msg = None
    if flag:
        alert_msg = build_alert_message(name, score, acwr, open_injuries)
        await send_line_notify(alert_msg)

    return {"message": "Wellness log created", "id": cur.lastrowid, "red_flag": flag, "alert": alert_msg}

@router.get("/user/{user_id}")
async def get_wellness(user_id: int, days: int = 30, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """SELECT * FROM wellness_logs WHERE user_id = ?
           ORDER BY date DESC LIMIT ?""",
        (user_id, days),
    )
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.get("/{log_id}")
async def get_wellness_log(log_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM wellness_logs WHERE id = ?", (log_id,))
    row = cur.fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="Log not found")
    return dict(row)

@router.put("/{log_id}")
async def update_wellness(log_id: int, data: WellnessUpdate, user: dict = Depends(token_required)):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    fields = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [log_id]
    db.execute(f"UPDATE wellness_logs SET {fields} WHERE id = ?", values)
    db.commit()
    db.close()
    return {"message": "Wellness log updated"}

@router.delete("/{log_id}")
async def delete_wellness(log_id: int, user: dict = Depends(token_required)):
    db = get_db()
    db.execute("DELETE FROM wellness_logs WHERE id = ?", (log_id,))
    db.commit()
    db.close()
    return {"message": "Wellness log deleted"}
