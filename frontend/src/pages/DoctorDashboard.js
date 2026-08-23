import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import { db, auth } from "../firebase";
import "../styles/DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorName =
    sessionStorage.getItem("greenMediQueueUserName") || "Doctor";

  const doctorEmail =
    sessionStorage.getItem("greenMediQueueUserEmail") || "";

  useEffect(() => {
    if (!doctorName || doctorName === "Doctor") {
      setLoading(false);
      return;
    }

    const appointmentQuery = query(
      collection(db, "appointments"),
      where("doctor", "==", doctorName)
    );

    const unsubscribe = onSnapshot(
      appointmentQuery,
      (snapshot) => {
        const data = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        data.sort((a, b) => {
          const dateA =
            `${a.appointmentDate || ""} ${a.appointmentTime || ""}`;

          const dateB =
            `${b.appointmentDate || ""} ${b.appointmentTime || ""}`;

          return dateA.localeCompare(dateB);
        });

        setAppointments(data);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Doctor appointments loading error:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [doctorName]);

  const waitingAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Booked" &&
      appointment.queueStatus !== "Completed" &&
      appointment.queueStatus !== "Cancelled" &&
      appointment.queueStatus !== "No-Show"
  );

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Completed" ||
      appointment.queueStatus === "Completed"
  );

  const cancelledAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Cancelled" ||
      appointment.queueStatus === "Cancelled"
  );

  const noShowAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "No-Show" ||
      appointment.queueStatus === "No-Show"
  );

  const currentPatient =
    waitingAppointments.length > 0
      ? waitingAppointments[0]
      : null;

  const markInConsultation = async (appointmentId) => {
    try {
      await updateDoc(
        doc(db, "appointments", appointmentId),
        {
          queueStatus: "In Consultation",
        }
      );

      alert("Patient moved to consultation.");
    } catch (error) {
      console.error(error);
      alert("Unable to update consultation status.");
    }
  };

  const markCompleted = async (appointmentId) => {
    try {
      await updateDoc(
        doc(db, "appointments", appointmentId),
        {
          status: "Completed",
          queueStatus: "Completed",
        }
      );

      alert("Consultation completed successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to complete appointment.");
    }
  };

  const markNoShow = async (appointmentId) => {
    try {
      await updateDoc(
        doc(db, "appointments", appointmentId),
        {
          status: "No-Show",
          queueStatus: "No-Show",
          noShowRisk: "High",
        }
      );

      alert("Patient marked as No-Show.");
    } catch (error) {
      console.error(error);
      alert("Unable to update No-Show status.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      sessionStorage.removeItem("greenMediQueueRole");
      sessionStorage.removeItem("greenMediQueueUserName");
      sessionStorage.removeItem("greenMediQueueUserEmail");

      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="doctor-dashboard">
      <aside className="doctor-sidebar">
        <div className="doctor-sidebar-brand">
          <h2>GreenMediQueue</h2>
          <p>Doctor Portal</p>
        </div>

        <nav className="doctor-menu">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("doctor-appointments")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Appointments
          </button>

          <button
            type="button"
            onClick={() => navigate("/queue")}
          >
            Live Queue
          </button>

          <button
            type="button"
            className="doctor-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="doctor-main">
        <header className="doctor-header">
          <div>
            <h1>Doctor Dashboard</h1>

            <p>
              Manage appointments, consultation status and
              patient queue.
            </p>
          </div>

          <div className="logged-doctor-card">
            <div className="doctor-profile-circle">
              👨‍⚕️
            </div>

            <div>
              <strong>{doctorName}</strong>
              <span>{doctorEmail}</span>
            </div>
          </div>
        </header>

        <section className="doctor-summary-grid">
          <div className="doctor-summary-card">
            <span className="doctor-summary-icon">
              📅
            </span>

            <div>
              <h3>Total Appointments</h3>
              <p>{appointments.length}</p>
            </div>
          </div>

          <div className="doctor-summary-card">
            <span className="doctor-summary-icon">
              👥
            </span>

            <div>
              <h3>Waiting</h3>
              <p>{waitingAppointments.length}</p>
            </div>
          </div>

          <div className="doctor-summary-card">
            <span className="doctor-summary-icon">
              ✅
            </span>

            <div>
              <h3>Completed</h3>
              <p>{completedAppointments.length}</p>
            </div>
          </div>

          <div className="doctor-summary-card">
            <span className="doctor-summary-icon">
              🚫
            </span>

            <div>
              <h3>No-Shows</h3>
              <p>{noShowAppointments.length}</p>
            </div>
          </div>
        </section>

        <section className="doctor-current-section">
          <div className="doctor-panel">
            <h2>Current Queue Patient</h2>

            {currentPatient ? (
              <div className="current-doctor-patient">
                <div>
                  <span>Token Number</span>
                  <strong>
                    {currentPatient.tokenNumber}
                  </strong>
                </div>

                <div>
                  <span>Patient Name</span>
                  <strong>
                    {currentPatient.patientName}
                  </strong>
                </div>

                <div>
                  <span>Appointment Time</span>
                  <strong>
                    {currentPatient.appointmentTime}
                  </strong>
                </div>

                <div>
                  <span>Symptoms</span>
                  <strong>
                    {currentPatient.symptoms ||
                      "Not provided"}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="doctor-empty-message">
                No patients are currently waiting.
              </div>
            )}
          </div>

          <div className="doctor-panel">
            <h2>Today's Overview</h2>

            <div className="doctor-information">
              <p>
                <strong>Doctor:</strong>{" "}
                {doctorName}
              </p>

              <p>
                <strong>Waiting Patients:</strong>{" "}
                {waitingAppointments.length}
              </p>

              <p>
                <strong>Completed:</strong>{" "}
                {completedAppointments.length}
              </p>

              <p>
                <strong>Cancelled:</strong>{" "}
                {cancelledAppointments.length}
              </p>

              <p>
                <strong>Estimated Queue Time:</strong>{" "}
                {waitingAppointments.length * 10} Minutes
              </p>
            </div>
          </div>
        </section>

        <section
          className="doctor-panel doctor-appointments-panel"
          id="doctor-appointments"
        >
          <div className="doctor-panel-heading">
            <div>
              <h2>My Patient Appointments</h2>

              <p>
                Appointments assigned to {doctorName}
              </p>
            </div>

            <span>
              {appointments.length} Records
            </span>
          </div>

          {loading ? (
            <div className="doctor-empty-message">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="doctor-empty-message">
              No appointments are assigned to you yet.
            </div>
          ) : (
            <div className="doctor-table-wrapper">
              <div className="doctor-table-row doctor-table-header">
                <span>Patient</span>
                <span>Date / Time</span>
                <span>Token</span>
                <span>Symptoms</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              {appointments.map((appointment) => (
                <div
                  className="doctor-table-row"
                  key={appointment.id}
                >
                  <span>
                    <strong>
                      {appointment.patientName}
                    </strong>

                    <small>
                      {appointment.phone ||
                        appointment.email}
                    </small>
                  </span>

                  <span>
                    {appointment.appointmentDate}

                    <small>
                      {appointment.appointmentTime}
                    </small>
                  </span>

                  <span className="doctor-token">
                    {appointment.tokenNumber}
                  </span>

                  <span>
                    {appointment.symptoms ||
                      "Not provided"}
                  </span>

                  <span
                    className={`doctor-status ${
                      appointment.status ===
                      "Completed"
                        ? "doctor-completed"
                        : appointment.status ===
                          "Cancelled"
                        ? "doctor-cancelled"
                        : appointment.status ===
                          "No-Show"
                        ? "doctor-noshow"
                        : "doctor-waiting"
                    }`}
                  >
                    {appointment.queueStatus ||
                      appointment.status}
                  </span>

                  <div className="doctor-action-buttons">
                    {appointment.status ===
                      "Booked" && (
                      <>
                        <button
                          type="button"
                          className="consult-button"
                          onClick={() =>
                            markInConsultation(
                              appointment.id
                            )
                          }
                        >
                          Consult
                        </button>

                        <button
                          type="button"
                          className="doctor-complete-button"
                          onClick={() =>
                            markCompleted(
                              appointment.id
                            )
                          }
                        >
                          Complete
                        </button>

                        <button
                          type="button"
                          className="noshow-button"
                          onClick={() =>
                            markNoShow(
                              appointment.id
                            )
                          }
                        >
                          No-Show
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DoctorDashboard;