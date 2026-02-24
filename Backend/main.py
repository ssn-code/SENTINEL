from fastapi import FastAPI
import psycopg2
import json
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

def get_connection():
    return psycopg2.connect(
        dbname="securesphere",
        user="shiva",
        password="ssn1412",
        host="localhost",
        port="5432"
    )
@app.get("/incidents")
def get_incidents():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id,
               crime_type,
               ST_AsGeoJSON(location),
               description,
               verified
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)