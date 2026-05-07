import sqlite3
from database import get_db

SQL_SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('athlete','coach','medical','admin')) NOT NULL,
    team_id TEXT,
    age INTEGER,
    height REAL,
    weight REAL,
    position TEXT,
    sport TEXT,
    phone TEXT,
    emergency_contact TEXT,
    medical_notes TEXT,
    baseline_metrics TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sport TEXT,
    coach_id INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wellness_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    sleep INTEGER CHECK(sleep BETWEEN 1 AND 5),
    fatigue INTEGER CHECK(fatigue BETWEEN 1 AND 5),
    stress INTEGER CHECK(stress BETWEEN 1 AND 5),
    soreness INTEGER CHECK(soreness BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_loads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    session_type TEXT,
    rpe INTEGER CHECK(rpe BETWEEN 1 AND 10),
    duration INTEGER,
    total_load INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS injury_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    body_part TEXT,
    severity INTEGER CHECK(severity BETWEEN 1 AND 5),
    status TEXT CHECK(status IN ('open','recovering','resolved')) DEFAULT 'open',
    mechanism TEXT,
    pain_type TEXT,
    swelling INTEGER CHECK(swelling BETWEEN 0 AND 3),
    mobility INTEGER CHECK(mobility BETWEEN 1 AND 5),
    affects_training INTEGER DEFAULT 0,
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    injury_id INTEGER REFERENCES injury_logs(id),
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rehab_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    injury_id INTEGER REFERENCES injury_logs(id),
    date TEXT NOT NULL,
    progress INTEGER CHECK(progress BETWEEN 0 AND 100),
    notes TEXT,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

def init_db():
    conn = sqlite3.connect("app.db")
    conn.executescript(SQL_SCHEMA)

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
    if cur.fetchone()[0] == 0:
        from auth import hash_password
        cur.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            ("Admin", "admin@sportsapp.com", hash_password("admin123"), "admin")
        )
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_db()
