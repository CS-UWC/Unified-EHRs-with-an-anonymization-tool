from pydantic import BaseModel


class AppointmentCreate(BaseModel):

    doctor_name:str
    appointment_date:str
    appointment_time:str



class AppointmentResponse(BaseModel):

    id:int
    doctor_name:str
    appointment_date:str
    appointment_time:str
    description:str
    status:str


    class Config:

        from_attributes = True