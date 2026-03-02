from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from drug_matching import process_uploaded_drug_csv
import os
import shutil
import eligibility_screening_only as es
import uuid

from drug_matcher import (
    run_from_csv,
    save_results_to_excel,
    DEFAULT_PARAMS,
    load_config
)

app = FastAPI(title="ClinicSync Eligibility API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "http://localhost:3001",
#         "http://127.0.0.1:3001",
#         "http://localhost:3002",
#         "http://127.0.0.1:3002"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        return {"error": "Only CSV files are allowed"}

    input_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(input_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    es.DATA_CSV = input_path
    es.OUTPUT_CSV = os.path.join(OUTPUT_DIR, "eligible_patients_with_id.csv")

    es.main()

    return FileResponse(
        path=es.OUTPUT_CSV,
        media_type="text/csv",
        filename="eligible_patients_with_id.csv"
    )


@app.post("/drug-matching")
async def drug_matching(file: UploadFile = File(...)):

    input_path = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4()}_{file.filename}"
    )

    with open(input_path, "wb") as f:
        f.write(await file.read())

    # ✅ USE WRAPPER INSTEAD
    output_path = process_uploaded_drug_csv(input_path)

    return FileResponse(
        output_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="drug_matching_results.xlsx"
    )