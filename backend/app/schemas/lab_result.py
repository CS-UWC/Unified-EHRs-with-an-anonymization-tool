from pydantic import BaseModel


class LabResultCreate(BaseModel):

    test_name:str
    result:str
    normal_range:str
    laboratory_name:str



class LabResultResponse(BaseModel):

    id:int
    patient_id:int
    test_name:str
    result:str
    normal_range:str
    laboratory_name:str
    status:str


    class Config:

        from_attributes = True