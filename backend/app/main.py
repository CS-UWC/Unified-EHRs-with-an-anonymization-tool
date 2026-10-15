# Application entry point.

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base
from app.core.database import engine

# Importing API routers
from app.api.auth import (router as auth_router)
from app.api.patients import (router as patient_router)
from app.api.medical_records import (router as medical_router)
from app.api.appointments import (router as appointment_router)
from app.api.prescriptions import (router as prescription_router)
from app.api.lab_results import (router as lab_result_router)
from app.api.fhir import (router as fhir_router)
from app.api.access_requests import router as access_request_router
from app.api import research_data
from app.api.diabetes import router as diabetes_router

# Import models
from app.models import User
from app.models import Patient
from app.models.medical_image import MedicalImage
from app.models.research_data import ResearchData

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Unified EHR API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)
app.mount(
    "/uploads",
    StaticFiles(
        directory="uploads"
    ),
    name="uploads"
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(medical_router)
app.include_router(appointment_router)
app.include_router(prescription_router)
app.include_router(lab_result_router)
app.include_router(fhir_router)
app.include_router(access_request_router)
app.include_router(research_data.router)
app.include_router(diabetes_router)


@app.get("/")
def home():

    return {
        "message": "Unified EHR Backend Running"
    }

from app.core.dependencies import get_current_user
from app.models import User

@app.get("/me")
def read_me(
    current_user: User = Depends(get_current_user)
):

    return current_user 
