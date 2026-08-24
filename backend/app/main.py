# Application entry point.

from fastapi import FastAPI, Depends

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

# Import models
from app.models import User
from app.models import Patient

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Unified EHR API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(medical_router)
app.include_router(appointment_router)
app.include_router(prescription_router)
app.include_router(lab_result_router)
app.include_router(fhir_router)

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
