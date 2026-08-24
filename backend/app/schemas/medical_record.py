"""
medical record schema
"""
from pydantic import BaseModel
from typing import Optional


class MedicalRecordCreate(BaseModel):

    blood_type:str

    allergies:str

    current_medications:str

    medical_history:str

    current_conditions:str

    height:str

    weight:str

    emergency_contact:str

    primary_physician:str

    hospital_name:str

    province:str



class MedicalRecordResponse(BaseModel):

    id:int

    patient_id:int

    blood_type:str

    allergies:str

    current_medications:str

    medical_history:str

    current_conditions:str

    height:str

    weight:str

    emergency_contact:str

    primary_physician:str

    hospital_name:str

    province:str


    class Config:

        from_attributes = True