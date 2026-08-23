import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../firebase";
import "../styles/Queue.css";

function Queue() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const appointmentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAppointments(appointmentList);
        setLoading(false);
      },
      (error) => {
        console.error("Queue loading error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const waitingAppointments = appointments.filter(
    (appointment) =>
      appointment.queueStatus === "Waiting" ||
      appointment.status === "Booked"
  );

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.queueStatus === "Completed" ||
      appointment.status === "Completed"
  );

  const currentAppointment =
    waitingAppointments.length > 0
      ? waitingAppointments[0]
      : null;

  const currentToken = currentAppointment
    ? currentAppointment.tokenNumber
    : "No Active Token";

  const patientsWaiting = waitingAppointments.length;

  const totalAppointments = appointments.length;

  const completed = completedAppointments.length;

  const pending = waitingAppointments.length;

  const estimatedWaitingTime = patientsWaiting * 10;

  return (
    <div className="queue-container">
      <h1>🏥 Live Queue Status</h1>

      {loading ? (
        <div className="queue-card">
          <h2>Loading queue...</h2>
        </div>
      ) : (
        <>
          <div className="queue-card">
            <h2>
              🎫 Current Token: {currentToken}
            </h2>

            <h2>
              👥 Patients Waiting: {patientsWaiting}
            </h2>

            <h2>
              ⏱️ Estimated Waiting Time:{" "}
              {estimatedWaitingTime} Minutes
            </h2>

            {currentAppointment && (
              <div className="current-patient">
                <p>
                  <strong>Doctor:</strong>{" "}
                  {currentAppointment.doctor}
                </p>

                <p>
                  <strong>Department:</strong>{" "}
                  {currentAppointment.department}
                </p>
              </div>
            )}

            <button
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              Refresh Queue
            </button>
          </div>

          <div className="queue-info">
            <div className="info-box">
              <h3>Total Appointments</h3>
              <p>{totalAppointments}</p>
            </div>

            <div className="info-box">
              <h3>Completed</h3>
              <p>{completed}</p>
            </div>

            <div className="info-box">
              <h3>Pending</h3>
              <p>{pending}</p>
            </div>
          </div>

          <div className="queue-list-section">
            <h2>Today's Queue</h2>

            {waitingAppointments.length === 0 ? (
              <p>No patients are currently waiting.</p>
            ) : (
              <div className="queue-list">
                {waitingAppointments.map(
                  (appointment, index) => (
                    <div
                      className="queue-patient-card"
                      key={appointment.id}
                    >
                      <div>
                        <span className="queue-position">
                          {index + 1}
                        </span>
                      </div>

                      <div>
                        <h3>
                          {appointment.tokenNumber}
                        </h3>

                        <p>
                          {appointment.patientName}
                        </p>
                      </div>

                      <div>
                        <p>
                          <strong>
                            {appointment.doctor}
                          </strong>
                        </p>

                        <p>
                          {appointment.department}
                        </p>
                      </div>

                      <div>
                        <p>
                          {appointment.appointmentTime}
                        </p>

                        <span className="waiting-badge">
                          Waiting
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Queue;