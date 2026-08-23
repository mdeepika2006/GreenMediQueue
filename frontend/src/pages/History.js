import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "../styles/History.css";

function History() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const appointmentQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      appointmentQuery,
      (snapshot) => {
        const appointmentData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setAppointments(appointmentData);
        setLoading(false);
      },
      (error) => {
        console.error("History loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1>My Appointments</h1>
          <p>
            View your appointment history, token numbers and current status.
          </p>
        </div>

        <div className="history-nav">
          <Link to="/home">Home</Link>
          <Link to="/booking">Book Appointment</Link>
          <Link to="/queue">Live Queue</Link>
        </div>
      </div>

      <div className="history-content">
        {loading ? (
          <div className="history-message">
            Loading your appointments...
          </div>
        ) : appointments.length === 0 ? (
          <div className="history-message">
            <h2>No Appointments Found</h2>

            <p>
              You have not booked any appointments yet.
            </p>

            <Link
              to="/booking"
              className="history-book-button"
            >
              Book Appointment
            </Link>
          </div>
        ) : (
          <div className="history-grid">
            {appointments.map((appointment) => (
              <div
                className="history-card"
                key={appointment.id}
              >
                <div className="history-card-top">
                  <div>
                    <h2>{appointment.doctor}</h2>
                    <p>{appointment.department}</p>
                  </div>

                  <span
                    className={`history-status ${
                      appointment.status === "Completed"
                        ? "history-completed"
                        : appointment.status === "Cancelled"
                        ? "history-cancelled"
                        : "history-booked"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="history-details">
                  <div>
                    <span>Patient</span>
                    <strong>
                      {appointment.patientName}
                    </strong>
                  </div>

                  <div>
                    <span>Token Number</span>
                    <strong>
                      {appointment.tokenNumber}
                    </strong>
                  </div>

                  <div>
                    <span>Date</span>
                    <strong>
                      {appointment.appointmentDate}
                    </strong>
                  </div>

                  <div>
                    <span>Time</span>
                    <strong>
                      {appointment.appointmentTime}
                    </strong>
                  </div>

                  <div>
                    <span>Queue Status</span>
                    <strong>
                      {appointment.queueStatus}
                    </strong>
                  </div>

                  <div>
                    <span>No-Show Risk</span>
                    <strong>
                      {appointment.noShowRisk || "Pending"}
                    </strong>
                  </div>
                </div>

                {appointment.symptoms && (
                  <div className="history-symptoms">
                    <span>Symptoms</span>

                    <p>
                      {appointment.symptoms}
                    </p>
                  </div>
                )}

                {appointment.status === "Booked" && (
                  <Link
                    to="/queue"
                    className="history-queue-button"
                  >
                    View Live Queue
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;