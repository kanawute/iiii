from fastapi import APIRouter, HTTPException, Depends
from auth import token_required, role_required
from models import InjuryCreate, InjuryUpdate
from database import get_db

router = APIRouter(prefix="/api/injury", tags=["injury"])

@router.post("/")
async def create_injury(data: InjuryCreate, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        """INSERT INTO injury_logs (user_id, body_part, severity, status, mechanism, pain_type, swelling, mobility, affects_training)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (data.user_id, data.body_part, data.severity, data.status,
         data.mechanism, data.pain_type, data.swelling, data.mobility,
         1 if data.affects_training else 0),
    )
    db.commit()
    db.close()
    return {"message": "รายงานอาการบาดเจ็บสำเร็จ", "id": cur.lastrowid}

@router.get("/user/{user_id}")
async def get_injuries(user_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM injury_logs WHERE user_id = ? ORDER BY reported_at DESC", (user_id,))
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.get("/all")
async def get_all_injuries(user: dict = Depends(role_required("coach", "medical", "admin"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("""SELECT i.*, u.name, u.team_id
                   FROM injury_logs i JOIN users u ON i.user_id = u.id
                   ORDER BY i.reported_at DESC""")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.put("/{log_id}")
async def update_injury(log_id: int, data: InjuryUpdate, user: dict = Depends(token_required)):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if 'affects_training' in updates:
        updates['affects_training'] = 1 if updates['affects_training'] else 0
    if not updates:
        raise HTTPException(status_code=400, detail="ไม่มีข้อมูลที่จะแก้ไข")
    fields = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [log_id]
    db.execute(f"UPDATE injury_logs SET {fields} WHERE id = ?", values)
    db.commit()
    db.close()
    return {"message": "แก้ไขข้อมูลสำเร็จ"}

# --- Injury Analysis ---
@router.get("/analysis")
async def injury_analysis(user: dict = Depends(role_required("coach", "medical", "admin"))):
    db = get_db()
    cur = db.cursor()

    # Total stats
    cur.execute("SELECT COUNT(*) as total FROM injury_logs")
    total = cur.fetchone()["total"]
    cur.execute("SELECT COUNT(*) as cnt FROM injury_logs WHERE status = 'open'")
    open_cnt = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM injury_logs WHERE status = 'recovering'")
    recovering = cur.fetchone()["cnt"]
    cur.execute("SELECT COUNT(*) as cnt FROM injury_logs WHERE status = 'resolved'")
    resolved = cur.fetchone()["cnt"]

    # By body part
    cur.execute("""SELECT body_part, COUNT(*) as cnt FROM injury_logs
                   WHERE body_part IS NOT NULL GROUP BY body_part ORDER BY cnt DESC""")
    by_part = [dict(r) for r in cur.fetchall()]

    # By severity
    cur.execute("""SELECT severity, COUNT(*) as cnt FROM injury_logs
                   GROUP BY severity ORDER BY severity""")
    by_severity = [dict(r) for r in cur.fetchall()]

    # By mechanism
    cur.execute("""SELECT mechanism, COUNT(*) as cnt FROM injury_logs
                   WHERE mechanism IS NOT NULL AND mechanism != ''
                   GROUP BY mechanism ORDER BY cnt DESC""")
    by_mechanism = [dict(r) for r in cur.fetchall()]

    # By month (trend)
    cur.execute("""SELECT strftime('%Y-%m', reported_at) as month, COUNT(*) as cnt
                   FROM injury_logs GROUP BY month ORDER BY month DESC LIMIT 12""")
    by_month = [dict(r) for r in cur.fetchall()]

    # Affected training count
    cur.execute("SELECT COUNT(*) as cnt FROM injury_logs WHERE affects_training = 1 AND status != 'resolved'")
    affected = cur.fetchone()["cnt"]

    db.close()
    return {
        "total": total,
        "open": open_cnt,
        "recovering": recovering,
        "resolved": resolved,
        "by_part": by_part,
        "by_severity": by_severity,
        "by_mechanism": by_mechanism,
        "by_month": by_month,
        "affected_training": affected,
    }
