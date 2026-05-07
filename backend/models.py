from pydantic import BaseModel
from typing import Optional
from datetime import date

# --- Auth ---
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # athlete, coach, medical, admin
    team_id: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    position: Optional[str] = None
    sport: Optional[str] = None
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_notes: Optional[str] = None

class TeamCreate(BaseModel):
    name: str
    sport: Optional[str] = None
    coach_id: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user_id: int
    name: str
    email: str
    role: str

# --- Wellness ---
class WellnessCreate(BaseModel):
    user_id: int
    date: str
    sleep: int
    fatigue: int
    stress: int
    soreness: int

class WellnessUpdate(BaseModel):
    sleep: Optional[int] = None
    fatigue: Optional[int] = None
    stress: Optional[int] = None
    soreness: Optional[int] = None

# --- Training Load ---
class TrainingCreate(BaseModel):
    user_id: int
    date: str
    session_type: Optional[str] = None
    rpe: int
    duration: int

class TrainingUpdate(BaseModel):
    session_type: Optional[str] = None
    rpe: Optional[int] = None
    duration: Optional[int] = None

# --- Injury ---
class InjuryCreate(BaseModel):
    user_id: int
    body_part: str
    severity: int
    status: str = "open"
    mechanism: Optional[str] = None
    pain_type: Optional[str] = None
    swelling: Optional[int] = 0
    mobility: Optional[int] = 3
    affects_training: Optional[bool] = False

class InjuryUpdate(BaseModel):
    severity: Optional[int] = None
    status: Optional[str] = None
    body_part: Optional[str] = None
    mechanism: Optional[str] = None
    pain_type: Optional[str] = None
    swelling: Optional[int] = None
    mobility: Optional[int] = None
    affects_training: Optional[bool] = None

# --- Medical ---
class MedicalRecordCreate(BaseModel):
    user_id: int
    injury_id: Optional[int] = None
    diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    notes: Optional[str] = None
    recorded_by: int

# --- Rehab ---
class RehabCreate(BaseModel):
    user_id: int
    injury_id: Optional[int] = None
    date: str
    progress: int
    notes: Optional[str] = None

class RehabUpdate(BaseModel):
    progress: Optional[int] = None
    notes: Optional[str] = None

# --- Dashboard ---
class AthleteStatus(BaseModel):
    user_id: int
    name: str
    status: str  # green, yellow, red
    readiness_score: float
