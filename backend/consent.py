from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from supabase import create_client
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()
import uuid
from datetime import datetime

router = APIRouter(prefix="/consent", tags=["Consent"])

# Environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)


# ---------------------------
# REQUEST MODEL
# ---------------------------
class ConsentRequest(BaseModel):
    patient_id: str
    language: str
    literacy_level: str
    notes: str | None = None


# ---------------------------
# GENERATE CONSENT USING AI
# ---------------------------
@router.post("/generate")
async def generate_consent(data: ConsentRequest):

    prompt = f"""
    Generate a clinical informed consent form.

    Language: {data.language}
    Literacy Level: {data.literacy_level}
    Patient ID: {data.patient_id}
    Notes: {data.notes}

    Make it clear, ethical and medically accurate.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )

    consent_text = response.choices[0].message.content

    filename = f"{data.patient_id}_{uuid.uuid4()}.txt"

    supabase.storage.from_("consent_generated").upload(
        filename,
        consent_text.encode("utf-8")
    )

    supabase.table("consents").insert({
        "patient_id": data.patient_id,
        "language": data.language,
        "literacy_level": data.literacy_level,
        "notes_text": data.notes,
        "consent_generated_url": filename,
        "consented": False,
        "created_at": datetime.utcnow()
    }).execute()

    return {
        "message": "Consent generated",
        "consent_text": consent_text
    }


# ---------------------------
# UPLOAD SIGNED CONSENT
# ---------------------------
@router.post("/upload-signed/{patient_id}")
async def upload_signed(patient_id: str, file: UploadFile = File(...)):

    contents = await file.read()
    filename = f"{patient_id}_{uuid.uuid4()}_{file.filename}"

    supabase.storage.from_("signed_consents").upload(
        filename,
        contents
    )

    supabase.table("consents") \
        .update({
            "signed_consent_url": filename,
            "consented": True,
            "updated_at": datetime.utcnow()
        }) \
        .eq("patient_id", patient_id) \
        .execute()

    return {"message": "Signed consent uploaded successfully"}


# ---------------------------
# DECLINE CONSENT
# ---------------------------
@router.post("/decline/{patient_id}")
async def decline(patient_id: str):

    supabase.table("consents") \
        .update({
            "consented": False,
            "updated_at": datetime.utcnow()
        }) \
        .eq("patient_id", patient_id) \
        .execute()

    return {"message": "Consent declined"}