from fastapi import APIRouter, Depends, Query
from auth import token_required
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

def calc_readiness_score(sleep, fatigue, stress, soreness):
    avg = (sleep + (6 - fatigue) + (6 - stress) + (6 - soreness)) / 4.0
    return round(avg * 20, 1)

def get_status(score):
    if score >= 60:
        return "green"
    elif score >= 40:
        return "yellow"
    return "red"

def calc_acwr(loads):
    if len(loads) < 28:
        return None
    acute = sum(l["total_load"] for l in loads[:7]) / 7.0
    chronic = sum(l["total_load"] for l in loads[:28]) / 28.0
    if chronic == 0:
        return None
    return round(acute / chronic, 2)

@router.get("/team-readiness")
async def team_readiness(user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name FROM users WHERE role = 'athlete' ORDER BY name")
    athletes = cur.fetchall()
    results = []
    for a in athletes:
        cur.execute(
            "SELECT sleep, fatigue, stress, soreness FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (a["id"],),
        )
        w = cur.fetchone()
        # Check for open injuries
        cur.execute(
            "SELECT severity FROM injury_logs WHERE user_id = ? AND status = 'open'",
            (a["id"],),
        )
        open_rows = cur.fetchall()
        injury_count = len(open_rows)
        max_severity = max((r["severity"] for r in open_rows), default=0)

        if w:
            score = calc_readiness_score(w["sleep"], w["fatigue"], w["stress"], w["soreness"])
            status = get_status(score)
            # Downgrade only if open injuries with severity > 2
            if injury_count > 0 and max_severity > 2:
                if status == "green":
                    status = "yellow"
                elif status == "yellow":
                    status = "red"
            results.append({"user_id": a["id"], "name": a["name"], "readiness_score": score, "status": status, "open_injuries": injury_count, "max_severity": max_severity})
        else:
            results.append({"user_id": a["id"], "name": a["name"], "readiness_score": 0, "status": "red", "open_injuries": injury_count, "max_severity": max_severity})
    db.close()
    return results

@router.get("/acwr")
async def acwr(user_id: int = Query(...), user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM training_loads WHERE user_id = ? ORDER BY date DESC LIMIT 28", (user_id,))
    loads = [dict(r) for r in cur.fetchall()]
    loads.reverse()
    ratio = calc_acwr(loads)
    db.close()
    return {"user_id": user_id, "acwr": ratio}

@router.get("/trends")
async def trends(user_id: int = Query(...), days: int = Query(7), user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT date, sleep, fatigue, stress, soreness FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT ?",
        (user_id, days),
    )
    wellness = [dict(r) for r in cur.fetchall()]
    cur.execute(
        "SELECT date, total_load, rpe, duration FROM training_loads WHERE user_id = ? ORDER BY date DESC LIMIT ?",
        (user_id, days),
    )
    training = [dict(r) for r in cur.fetchall()]
    db.close()
    return {"wellness": wellness, "training": training}

@router.get("/summary")
async def summary(user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE role = 'athlete'")
    total_athletes = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM wellness_logs WHERE date = date('now')")
    today_checkins = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM injury_logs WHERE status = 'open'")
    open_injuries = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM users WHERE role = 'athlete'")
    athlete_rows = cur.fetchall()
    green = yellow = red = 0
    for a in athlete_rows:
        cur.execute(
            "SELECT sleep, fatigue, stress, soreness FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (a["id"],),
        )
        w = cur.fetchone()
        # Check for open injuries
        cur.execute(
            "SELECT severity FROM injury_logs WHERE user_id = ? AND status = 'open'",
            (a["id"],),
        )
        open_rows = cur.fetchall()
        injury_count = len(open_rows)
        max_severity = max((r["severity"] for r in open_rows), default=0)

        if w:
            score = calc_readiness_score(w["sleep"], w["fatigue"], w["stress"], w["soreness"])
            s = get_status(score)
            # Downgrade only if open injuries with severity > 2
            if injury_count > 0 and max_severity > 2:
                if s == "green":
                    s = "yellow"
                elif s == "yellow":
                    s = "red"
        else:
            s = "red"

        if s == "green":
            green += 1
        elif s == "yellow":
            yellow += 1
        else:
            red += 1
    db.close()
    return {
        "total_athletes": total_athletes,
        "today_checkins": today_checkins,
        "open_injuries": open_injuries,
        "green": green,
        "yellow": yellow,
        "red": red,
    }

@router.get("/athlete-overview")
async def athlete_overview(user: dict = Depends(token_required)):
    """รวมข้อมูล wellness + injury analysis รายบุคคล เพื่อแสดงผลภาพรวม"""
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name FROM users WHERE role = 'athlete' ORDER BY name")
    athletes = cur.fetchall()
    results = []
    for a in athletes:
        # Latest wellness
        cur.execute(
            "SELECT sleep, fatigue, stress, soreness FROM wellness_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1",
            (a["id"],),
        )
        w = cur.fetchone()
        # All injuries (non-resolved)
        cur.execute(
            "SELECT id, body_part, severity, status, reported_at FROM injury_logs WHERE user_id = ? AND status != 'resolved' ORDER BY reported_at DESC",
            (a["id"],),
        )
        injuries = [dict(r) for r in cur.fetchall()]
        open_injuries = [i for i in injuries if i["status"] == "open"]
        recovering = [i for i in injuries if i["status"] == "recovering"]

        # Readiness score
        if w:
            score = calc_readiness_score(w["sleep"], w["fatigue"], w["stress"], w["soreness"])
        else:
            score = 0

        # Status: ถ้ามี open injury แต่ severity สูง (>=3) = ไม่พร้อม
        has_open = len(open_injuries) > 0
        has_recovering = len(recovering) > 0

        # ถ้า open injuries ทุกอัน severity <= 2 (เล็กน้อย) = พร้อมฝึกซ้อม
        if has_open:
            max_severity = max(i["severity"] for i in open_injuries)
            if max_severity <= 2:
                # บาดเจ็บเล็กน้อย ยังพร้อมฝึกซ้อมได้
                if w:
                    status = get_status(score)
                else:
                    status = "red"
            else:
                status = "red"
        elif w:
            status = get_status(score)
        else:
            status = "red"

        results.append({
            "user_id": a["id"],
            "name": a["name"],
            "readiness_score": score,
            "status": status,
            "open_injuries": len(open_injuries),
            "recovering_injuries": len(recovering),
            "injuries": injuries,
            "has_injury": has_open or has_recovering,
            "max_severity": max((i["severity"] for i in open_injuries), default=0),
            "sleep": w["sleep"] if w else None,
            "fatigue": w["fatigue"] if w else None,
            "stress": w["stress"] if w else None,
            "soreness": w["soreness"] if w else None,
        })
    db.close()
    return results
