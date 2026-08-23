from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore


app = FastAPI(
    title="GreenMediQueue Backend",
    version="1.0.0"
)


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


if not firebase_admin._apps:
    cred = credentials.Certificate(
        "serviceAccountKey.json"
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()


class NoShowRequest(BaseModel):
    appointmentTime: str


class AppointmentRequest(BaseModel):
    patientName: str
    phone: str
    email: str
    department: str
    doctor: str
    appointmentDate: str
    appointmentTime: str
    symptoms: str


@app.get("/")
def home():
    return {
        "message": "GreenMediQueue Backend is Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "success",
        "message": "Backend server is working"
    }


@app.get("/firebase-test")
def firebase_test():
    try:
        users = (
            db.collection("users")
            .limit(5)
            .stream()
        )

        user_list = []

        for user in users:
            user_list.append({
                "id": user.id,
                "data": user.to_dict()
            })

        return {
            "status": "success",
            "message": "Firebase connected successfully",
            "users": user_list
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


@app.get("/appointments")
def get_appointments():
    try:
        docs = (
            db.collection("appointments")
            .stream()
        )

        appointments = []

        for doc in docs:
            data = doc.to_dict()

            appointments.append({
                "id": doc.id,
                "patientName": data.get("patientName", ""),
                "phone": data.get("phone", ""),
                "email": data.get("email", ""),
                "department": data.get("department", ""),
                "doctor": data.get("doctor", ""),
                "appointmentDate": data.get("appointmentDate", ""),
                "appointmentTime": data.get("appointmentTime", ""),
                "symptoms": data.get("symptoms", ""),
                "tokenNumber": data.get("tokenNumber", ""),
                "status": data.get("status", ""),
                "queueStatus": data.get("queueStatus", ""),
                "noShowRisk": data.get("noShowRisk", "")
            })

        return {
            "status": "success",
            "total": len(appointments),
            "appointments": appointments
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


def calculate_no_show_risk(appointment_time):
    try:
        hour = int(
            appointment_time.split(":")[0]
        )

        if 8 <= hour < 12:
            risk = "Low"
            score = 20

        elif 12 <= hour < 17:
            risk = "Medium"
            score = 50

        else:
            risk = "High"
            score = 80

        return {
            "risk": risk,
            "score": score
        }

    except Exception:
        return {
            "risk": "Unknown",
            "score": 0
        }


@app.post("/predict-no-show")
def predict_no_show(request: NoShowRequest):
    prediction = calculate_no_show_risk(
        request.appointmentTime
    )

    return {
        "status": "success",
        "appointmentTime": request.appointmentTime,
        "noShowRisk": prediction["risk"],
        "riskScore": prediction["score"]
    }


def generate_next_token():
    docs = (
        db.collection("appointments")
        .stream()
    )

    highest_number = 0

    for doc in docs:
        data = doc.to_dict()

        token = data.get(
            "tokenNumber",
            ""
        )

        if token.startswith("GMQ-"):
            try:
                number = int(
                    token.split("-")[1]
                )

                if number > highest_number:
                    highest_number = number

            except ValueError:
                pass

    next_number = highest_number + 1

    return f"GMQ-{next_number:03d}"


@app.post("/create-appointment")
def create_appointment(
    request: AppointmentRequest
):
    try:
        token_number = generate_next_token()

        prediction = calculate_no_show_risk(
            request.appointmentTime
        )

        appointment_data = {
            "patientName": request.patientName.strip(),
            "phone": request.phone.strip(),
            "email": request.email.strip().lower(),
            "department": request.department,
            "doctor": request.doctor,
            "appointmentDate": request.appointmentDate,
            "appointmentTime": request.appointmentTime,
            "symptoms": request.symptoms.strip(),

            "tokenNumber": token_number,

            "status": "Booked",

            "queueStatus": "Waiting",

            "noShowRisk": prediction["risk"],

            "riskScore": prediction["score"],

            "createdAt": datetime.now()
        }

        document = (
            db.collection("appointments")
            .document()
        )

        document.set(
            appointment_data
        )

        return {
            "status": "success",
            "message": "Appointment created successfully",
            "appointmentId": document.id,
            "tokenNumber": token_number,
            "noShowRisk": prediction["risk"],
            "riskScore": prediction["score"]
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


@app.get("/waiting-time")
def get_waiting_time():
    try:
        docs = (
            db.collection("appointments")
            .stream()
        )

        waiting_patients = 0

        for doc in docs:
            data = doc.to_dict()

            status = data.get(
                "status",
                ""
            )

            queue_status = data.get(
                "queueStatus",
                ""
            )

            if (
                status == "Booked"
                and queue_status == "Waiting"
            ):
                waiting_patients += 1

        average_consultation_time = 10

        estimated_waiting_time = (
            waiting_patients
            * average_consultation_time
        )

        return {
            "status": "success",
            "patientsWaiting": waiting_patients,
            "averageConsultationTime":
                average_consultation_time,
            "estimatedWaitingTime":
                estimated_waiting_time,
            "unit": "minutes"
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }


@app.get("/live-queue")
def get_live_queue():
    try:
        docs = (
            db.collection("appointments")
            .stream()
        )

        queue = []

        for doc in docs:
            data = doc.to_dict()

            status = data.get(
                "status",
                ""
            )

            queue_status = data.get(
                "queueStatus",
                ""
            )

            if (
                status == "Booked"
                and queue_status in [
                    "Waiting",
                    "In Consultation"
                ]
            ):
                queue.append({
                    "id": doc.id,

                    "patientName":
                        data.get(
                            "patientName",
                            ""
                        ),

                    "doctor":
                        data.get(
                            "doctor",
                            ""
                        ),

                    "department":
                        data.get(
                            "department",
                            ""
                        ),

                    "tokenNumber":
                        data.get(
                            "tokenNumber",
                            ""
                        ),

                    "appointmentDate":
                        data.get(
                            "appointmentDate",
                            ""
                        ),

                    "appointmentTime":
                        data.get(
                            "appointmentTime",
                            ""
                        ),

                    "queueStatus":
                        queue_status
                })

        queue.sort(
            key=lambda item: (
                item["appointmentDate"],
                item["appointmentTime"]
            )
        )

        waiting_patients = [
            patient
            for patient in queue
            if patient["queueStatus"] == "Waiting"
        ]

        consultation_patients = [
            patient
            for patient in queue
            if patient["queueStatus"]
            == "In Consultation"
        ]

        current_patient = None

        if consultation_patients:
            current_patient = consultation_patients[0]

        elif waiting_patients:
            current_patient = waiting_patients[0]

        current_token = (
            current_patient["tokenNumber"]
            if current_patient
            else "No Active Token"
        )

        estimated_waiting_time = (
            len(waiting_patients) * 10
        )

        return {
            "status": "success",
            "currentToken": current_token,
            "patientsWaiting":
                len(waiting_patients),
            "estimatedWaitingTime":
                estimated_waiting_time,
            "unit": "minutes",
            "queue": queue
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error)
        }