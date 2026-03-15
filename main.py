import os
import re
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

from chatbot import router as chatbot_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


STATE_ALIASES = {
    'uttarpradesh': 'Uttar Pradesh',
    'uttaranchal': 'Uttarakhand',
    'tamilnadu': 'Tamil Nadu',
    'telengana': 'Telangana',
    'meghalya': 'Meghalaya',
    'jammu kashmir': 'Jammu and Kashmir',
    'jammu and kashmir': 'Jammu and Kashmir',
    'orissa': 'Odisha',
    'a and n islands': 'Andaman and Nicobar Islands',
    'a n islands': 'Andaman and Nicobar Islands',
    'a&n islands': 'Andaman and Nicobar Islands',
    'andaman and nicobar': 'Andaman and Nicobar Islands',
    'd and n haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'd n haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'd&n haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'nct of delhi': 'Delhi',
    'pondicherry': 'Puducherry',
}


class FeedbackCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    rating: int = Field(ge=1, le=5)
    description: str = Field(min_length=10, max_length=1500)
    expectations: str = Field(min_length=5, max_length=1500)



def connect_db():
    database_url = os.getenv('DATABASE_URL', '').strip()
    if not database_url:
        raise RuntimeError('DATABASE_URL is required. This project is configured to use Neon only.')

    connect_timeout = int(os.getenv('POSTGRES_CONNECT_TIMEOUT', '5'))
    return psycopg2.connect(database_url, connect_timeout=connect_timeout)



def normalize_state_name(value: str) -> str:
    cleaned = re.sub(r'[^a-z0-9]+', ' ', value.lower()).strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return STATE_ALIASES.get(cleaned, cleaned.title())



def derive_safety_score(ipc_crimes: int) -> int:
    return max(10, min(100, round(100 - (ipc_crimes / 5000))))



def derive_safety_level(safety_score: int) -> str:
    if safety_score >= 81:
        return 'Safe'
    if safety_score >= 61:
        return 'Moderate'
    if safety_score >= 41:
        return 'Elevated'
    return 'High Risk'



def serialize_state(row: dict[str, Any]) -> dict[str, Any]:
    ipc_crimes = int(row['ipc_crimes'])
    women_crimes = int(row['women_crimes'])
    cyber_crimes = int(row['cyber_crimes'])
    safety_score = derive_safety_score(ipc_crimes)

    return {
        'id': int(row['id']),
        'state': normalize_state_name(str(row['state'])),
        'ipc_crimes': ipc_crimes,
        'women_crimes': women_crimes,
        'cyber_crimes': cyber_crimes,
        'safety_score': safety_score,
        'safety_level': derive_safety_level(safety_score),
    }



def serialize_feedback(row: dict[str, Any]) -> dict[str, Any]:
    created_at = row.get('created_at')
    return {
        'id': int(row['id']),
        'name': str(row['name']),
        'rating': int(row['rating']),
        'description': str(row['description']),
        'expectations': str(row['expectations']),
        'created_at': created_at.isoformat() if created_at else None,
    }



def fetch_state_rows() -> list[dict[str, Any]]:
    connection = connect_db()
    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                '''
                SELECT
                    id,
                    state,
                    women_crimes,
                    ipc_crimes,
                    cyber_crimes
                FROM state_crime_data
                ORDER BY ipc_crimes DESC
                '''
            )
            rows = cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to load state crime data: {exc}') from exc
    finally:
        connection.close()

    return [serialize_state(row) for row in rows]



def fetch_feedback_rows() -> list[dict[str, Any]]:
    connection = connect_db()
    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                '''
                SELECT
                    id,
                    name,
                    rating,
                    description,
                    expectations,
                    created_at
                FROM project_feedback
                ORDER BY created_at DESC, id DESC
                LIMIT 50
                '''
            )
            rows = cursor.fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to load feedback: {exc}') from exc
    finally:
        connection.close()

    return [serialize_feedback(row) for row in rows]



def get_client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get('x-forwarded-for', '').strip()
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()

    if request.client and request.client.host:
        return request.client.host.strip()

    return None



def create_feedback_row(payload: FeedbackCreate, request: Request) -> dict[str, Any]:
    connection = connect_db()
    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                '''
                INSERT INTO project_feedback (
                    name,
                    ip_address,
                    rating,
                    description,
                    expectations
                )
                VALUES (%s, %s, %s, %s, %s)
                RETURNING
                    id,
                    name,
                    rating,
                    description,
                    expectations,
                    created_at
                ''',
                (
                    payload.name.strip(),
                    get_client_ip(request),
                    payload.rating,
                    payload.description.strip(),
                    payload.expectations.strip(),
                ),
            )
            row = cursor.fetchone()
        connection.commit()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'Failed to save feedback: {exc}') from exc
    finally:
        connection.close()

    if not row:
        raise HTTPException(status_code=500, detail='Feedback could not be saved.')

    return serialize_feedback(row)



def build_dashboard_summary(states: list[dict[str, Any]]) -> dict[str, Any]:
    if not states:
        return {
            'total_ipc_crimes': 0,
            'regions_tracked': 0,
            'safest_state': 'N/A',
            'average_safety_score': 0,
        }

    safest_state = max(states, key=lambda state: (state['safety_score'], -state['ipc_crimes']))
    average_safety_score = round(
        sum(state['safety_score'] for state in states) / len(states),
        1,
    )

    return {
        'total_ipc_crimes': sum(state['ipc_crimes'] for state in states),
        'regions_tracked': len(states),
        'safest_state': safest_state['state'],
        'average_safety_score': average_safety_score,
    }


@app.get('/')
def home():
    return {'message': 'SENTINEL API running'}


@app.get('/states')
def get_states():
    return fetch_state_rows()


@app.get('/dashboard')
def get_dashboard():
    states = fetch_state_rows()
    return {
        'summary': build_dashboard_summary(states),
        'states': states,
    }


@app.get('/feedback')
def get_feedback():
    return {'reviews': fetch_feedback_rows()}


@app.post('/feedback', status_code=status.HTTP_201_CREATED)
def create_feedback(payload: FeedbackCreate, request: Request):
    return create_feedback_row(payload, request)


app.include_router(chatbot_router)
