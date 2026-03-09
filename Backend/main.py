from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
import psycopg2
import json
import bcrypt
import jwt
import datetime
import os
from dotenv import load_dotenv

# ===============================
# ENVIRONMENT
# ===============================

load_dotenv()

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

# ===============================
# APP INIT
# ===============================
app = FastAPI()
# ===============================
# CORS
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ===============================
# DATABASE CONNECTION
# ===============================
def get_connection():
    return psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=DB_PORT
    )
# ===============================
# AUTH SECURITY
# ===============================

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ===============================
# AUTH MODELS
# ===============================
class RegisterRequest(BaseModel):
    email: str
    password: str
class LoginRequest(BaseModel):
    email: str
    password: str
# ===============================
# AUTH ROUTES
# ===============================
@app.post("/register")
def register(data: RegisterRequest):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (data.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")
    hashed = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    cur.execute(
        "INSERT INTO users (email, hashed_password, role) VALUES (%s,%s,%s)",
        (data.email, hashed, "public")
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "User registered successfully"}
@app.post("/login")
def login(data: LoginRequest):

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, hashed_password, role FROM users WHERE email=%s",
        (data.email,)
    )

    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id, hashed_password, role = user
    if not bcrypt.checkpw(data.password.encode(), hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = jwt.encode(
        {
            "user_id": user_id,
            "role": role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token}
# ===============================
# INCIDENT MODELS
# ===============================
class IncidentCreate(BaseModel):
    latitude: float
    longitude: float
    crime_type: str
    description: str
# ===============================
# INCIDENT ROUTES
# ===============================
@app.get("/incidents")
def get_incidents():

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, crime_type, ST_AsGeoJSON(location), description, verified
        FROM incidents;
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row[2]),
            "properties": {
                "id": row[0],
                "crime_type": row[1],
                "description": row[3],
                "verified": row[4]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }
@app.post("/incidents")
def create_incident(
    incident: IncidentCreate,
    user = Depends(get_current_user)
):

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO incidents (location, crime_type, description, verified)
        VALUES (
            ST_SetSRID(ST_MakePoint(%s,%s),4326)::geography,
            %s,
            %s,
            false
        )
    """, (
        incident.longitude,
        incident.latitude,
        incident.crime_type,
        incident.description
    ))
    conn.commit()

    cur.close()
    conn.close()
    return {"message": "Incident submitted"}
# ===============================
# DASHBOARD
# ===============================
@app.get("/dashboard")
def get_dashboard():

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM incidents")
    total = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM incidents WHERE verified=true")
    verified = cur.fetchone()[0]
    cur.execute("""
        SELECT crime_type, COUNT(*) as count
        FROM incidents
        GROUP BY crime_type
        ORDER BY count DESC
        LIMIT 1
    """)

    top_crime = cur.fetchone()
    cur.close()
    conn.close()
    return {
        "total_incidents": total,
        "verified_incidents": verified,
        "top_crime_type": top_crime[0] if top_crime else None,
        "top_crime_count": top_crime[1] if top_crime else 0
    }
# ===============================
# HEATMAP
# ===============================
@app.get("/heatmap")
def get_heatmap():

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT
            ST_AsGeoJSON(
                ST_Centroid(ST_Collect(location::geometry))
            ),
            COUNT(*)
        FROM incidents
        GROUP BY ST_SnapToGrid(location::geometry,0.005)
    """)
    rows = cur.fetchall()

    cur.close()
    conn.close()
    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(row[0]),
            "properties": {
                "count": row[1]
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }
# ===============================
# ROUTE RISK
# ===============================
class RouteRequest(BaseModel):
    coordinates: List[List[float]]

@app.post("/route-risk")
def calculate_route_risk(route: RouteRequest):

    conn = get_connection()
    cur = conn.cursor()
    total_risk = 0
    for lat, lng in route.coordinates:

        cur.execute("""
            SELECT COUNT(*)
            FROM incidents
            WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(%s,%s),4326)::geography,
                300
            )
        """,(lng,lat))

        count = cur.fetchone()[0]
        total_risk += count
    cur.close()
    conn.close()
    if total_risk < 20:
        level = "Low"
    elif total_risk < 60:
        level = "Medium"
    else:
        level = "High"
    return {
        "risk_score": total_risk,
        "risk_level": level
    }
