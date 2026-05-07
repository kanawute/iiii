from fastapi import APIRouter, HTTPException, Depends
from auth import hash_password, verify_password, create_token, token_required, role_required
from models import RegisterRequest, LoginRequest, LoginResponse, UserProfileUpdate, TeamCreate
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
async def register(data: RegisterRequest):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role, team_id) VALUES (?, ?, ?, ?, ?)",
            (data.name, data.email, hash_password(data.password), data.role, data.team_id),
        )
        db.commit()
        return {"message": "สร้างผู้ใช้สำเร็จ", "user_id": cur.lastrowid}
    except Exception as e:
        if "UNIQUE constraint" in str(e):
            raise HTTPException(status_code=400, detail="อีเมลนี้มีผู้ใช้งานแล้ว")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.post("/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, password_hash, role FROM users WHERE email = ?", (data.email,))
    user = cur.fetchone()
    db.close()
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    token = create_token(user["id"], user["role"], user["email"])
    return LoginResponse(
        token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
    )

@router.get("/me")
async def get_me(user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, role, team_id, age, height, weight, position, sport, phone, emergency_contact, medical_notes, created_at FROM users WHERE id = ?", (user["user_id"],))
    result = cur.fetchone()
    db.close()
    if not result:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้งาน")
    return dict(result)

@router.put("/profile")
async def update_profile(data: UserProfileUpdate, user: dict = Depends(token_required)):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="ไม่มีข้อมูลที่จะแก้ไข")
    fields = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [user["user_id"]]
    db.execute(f"UPDATE users SET {fields} WHERE id = ?", values)
    db.commit()
    db.close()
    return {"message": "แก้ไขข้อมูลสำเร็จ"}

@router.get("/athletes")
async def list_athletes(user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, age, height, weight, position, sport, phone, team_id FROM users WHERE role = 'athlete' ORDER BY name")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.get("/athletes/{athlete_id}")
async def get_athlete(athlete_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, age, height, weight, position, sport, phone, emergency_contact, medical_notes, team_id, created_at FROM users WHERE id = ? AND role = 'athlete'", (athlete_id,))
    row = cur.fetchone()
    db.close()
    if not row:
        raise HTTPException(status_code=404, detail="ไม่พบนักกีฬา")
    return dict(row)

@router.delete("/athletes/{athlete_id}")
async def delete_athlete(athlete_id: int, user: dict = Depends(role_required("admin"))):
    db = get_db()
    db.execute("DELETE FROM users WHERE id = ? AND role = 'athlete'", (athlete_id,))
    db.commit()
    db.close()
    return {"message": "ลบนักกีฬาสำเร็จ"}

# --- Teams ---
@router.post("/teams")
async def create_team(data: TeamCreate, user: dict = Depends(role_required("admin", "coach"))):
    db = get_db()
    cur = db.cursor()
    cur.execute("INSERT INTO teams (name, sport, coach_id) VALUES (?, ?, ?)", (data.name, data.sport, data.coach_id))
    db.commit()
    db.close()
    return {"message": "สร้างทีมสำเร็จ", "id": cur.lastrowid}

@router.get("/teams")
async def list_teams(user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT t.*, u.name as coach_name FROM teams t LEFT JOIN users u ON t.coach_id = u.id")
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows

@router.get("/teams/{team_id}/athletes")
async def get_team_athletes(team_id: int, user: dict = Depends(token_required)):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, email, age, position FROM users WHERE role = 'athlete' AND team_id = ? ORDER BY name", (str(team_id),))
    rows = [dict(r) for r in cur.fetchall()]
    db.close()
    return rows
