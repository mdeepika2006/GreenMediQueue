import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import { db, auth } from "../firebase";
import "../styles/Admin.css";

function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const appointmentQuery = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc")
    );

    const unsubscribeAppointments = onSnapshot(
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
        console.error("Appointments loading error:", error);
        setLoading(false);
      }
    );

    const unsubscribePatients = onSnapshot(
      collection(db, "patients"),
      (snapshot) => {
        const patientData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setPatients(patientData);
      },
      (error) => {
        console.error("Patients loading error:", error);
      }
    );

    return () => {
      unsubscribeAppointments();
      unsubscribePatients();
    };
  }, []);

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Completed" ||
      appointment.queueStatus === "Completed"
  );

  const waitingAppointments = appointments.filter(
    (appointment) =>
      appointment.queueStatus === "Waiting" &&
      appointment.status !== "Completed" &&
      appointment.status !== "Cancelled"
  );

  const cancelledAppointments = appointments.filter(
    (appointment) => appointment.status === "Cancelled"
  );

  const noShowAppointments = appointments.filter(
    (appointment) => appointment.status === "No-Show"
  );

  const lowRiskAppointments = appointments.filter(
    (appointment) => appointment.noShowRisk === "Low"
  );

  const mediumRiskAppointments = appointments.filter(
    (appointment) => appointment.noShowRisk === "Medium"
  );

  const highRiskAppointments = appointments.filter(
    (appointment) => appointment.noShowRisk === "High"
  );

  const totalAppointments = appointments.length;
  const totalPatients = patients.length;

  const totalDoctors = 6;

  const currentAppointment =
    waitingAppointments.length > 0
      ? waitingAppointments[waitingAppointments.length - 1]
      : null;

  const currentToken = currentAppointment
    ? currentAppointment.tokenNumber
    : "No Active Token";

  const estimatedWaitingTime = waitingAppointments.length * 10;

  const getPercentage = (value) => {
    if (appointments.length === 0) {
      return 0;
    }

    return Math.round((value / appointments.length) * 100);
  };

  const lowRiskPercentage = getPercentage(lowRiskAppointments.length);
  const mediumRiskPercentage = getPercentage(
    mediumRiskAppointments.length
  );
  const highRiskPercentage = getPercentage(highRiskAppointments.length);

  const markCompleted = async (appointmentId) => {
    try {
      const appointmentReference = doc(
        db,
        "appointments",
        appointmentId
      );

      await updateDoc(appointmentReference, {
        status: "Completed",
        queueStatus: "Completed",
      });

      alert("Appointment marked as completed.");
    } catch (error) {
      console.error("Update error:", error);
      alert("Unable to update appointment.");
    }
  };

  const markCancelled = async (appointmentId) => {
    try {
      const appointmentReference = doc(
        db,
        "appointments",
        appointmentId
      );

      await updateDoc(appointmentReference, {
        status: "Cancelled",
        queueStatus: "Cancelled",
      });

      alert("Appointment cancelled.");
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Unable to cancel appointment.");
    }
  };

  const setNoShowRisk = async (
    appointmentId,
    riskValue
  ) => {
    try {
      const appointmentReference = doc(
        db,
        "appointments",
        appointmentId
      );

      await updateDoc(appointmentReference, {
        noShowRisk: riskValue,
      });
    } catch (error) {
      console.error("Risk update error:", error);
      alert("Unable to update no-show risk.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>GreenMediQueue</h2>
          <p>Hospital Admin</p>
        </div>

        <nav className="admin-menu">
          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/doctors">
            Doctors
          </Link>

          <Link to="/booking">
            Appointments
          </Link>

          <Link to="/queue">
            Live Queue
          </Link>

          <a href="#analytics">
            No-Show Analytics
          </a>

          <a href="#reports">
            Daily Reports
          </a>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Monitor hospital appointments,
              queue flow and operational analytics.
            </p>
          </div>

          <div className="admin-profile">
            <div>
              <strong>
                Administrator
              </strong>

              <span>
                Hospital Management
              </span>
            </div>

            <div className="profile-circle">
              A
            </div>
          </div>
        </header>

        {loading ? (
          <div className="dashboard-panel">
            <h2>
              Loading hospital data...
            </h2>
          </div>
        ) : (
          <>
            <section className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon">
                  👥
                </div>

                <div>
                  <h3>
                    Total Patients
                  </h3>

                  <p>
                    {totalPatients}
                  </p>

                  <span>
                    Registered patients
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  👨‍⚕️
                </div>

                <div>
                  <h3>
                    Total Doctors
                  </h3>

                  <p>
                    {totalDoctors}
                  </p>

                  <span>
                    Hospital doctors
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  📅
                </div>

                <div>
                  <h3>
                    Total Appointments
                  </h3>

                  <p>
                    {totalAppointments}
                  </p>

                  <span>
                    {completedAppointments.length} completed
                  </span>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon">
                  ⏱️
                </div>

                <div>
                  <h3>
                    Estimated Waiting
                  </h3>

                  <p>
                    {estimatedWaitingTime} Min
                  </p>

                  <span>
                    Based on live queue
                  </span>
                </div>
              </div>
            </section>

            <section className="admin-content-grid">
              <div className="dashboard-panel">
                <div className="panel-title">
                  <h2>
                    Live Queue Overview
                  </h2>

                  <Link to="/queue">
                    Open Queue
                  </Link>
                </div>

                <div className="queue-overview">
                  <div>
                    <span>
                      Current Token
                    </span>

                    <strong>
                      {currentToken}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Patients Waiting
                    </span>

                    <strong>
                      {waitingAppointments.length}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Completed
                    </span>

                    <strong>
                      {completedAppointments.length}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pending
                    </span>

                    <strong>
                      {waitingAppointments.length}
                    </strong>
                  </div>
                </div>
              </div>

              <div
                className="dashboard-panel"
                id="analytics"
              >
                <h2>
                  No-Show Risk Distribution
                </h2>

                <div className="risk-list">
                  <div className="risk-item">
                    <span>
                      Low Risk
                    </span>

                    <div className="risk-bar">
                      <div
                        className="low-risk-bar"
                        style={{
                          width:
                            lowRiskPercentage + "%",
                        }}
                      ></div>
                    </div>

                    <strong>
                      {lowRiskPercentage}%
                    </strong>
                  </div>

                  <div className="risk-item">
                    <span>
                      Medium Risk
                    </span>

                    <div className="risk-bar">
                      <div
                        className="medium-risk-bar"
                        style={{
                          width:
                            mediumRiskPercentage +
                            "%",
                        }}
                      ></div>
                    </div>

                    <strong>
                      {mediumRiskPercentage}%
                    </strong>
                  </div>

                  <div className="risk-item">
                    <span>
                      High Risk
                    </span>

                    <div className="risk-bar">
                      <div
                        className="high-risk-bar"
                        style={{
                          width:
                            highRiskPercentage +
                            "%",
                        }}
                      ></div>
                    </div>

                    <strong>
                      {highRiskPercentage}%
                    </strong>
                  </div>
                </div>

                <div className="prediction-note">
                  <strong>
                    Model Status:
                  </strong>{" "}
                  No-show prediction analytics
                  connected to appointment records.
                </div>
              </div>
            </section>

            <section className="dashboard-panel appointment-panel">
              <div className="panel-title">
                <h2>
                  Appointment Management
                </h2>

                <span>
                  {totalAppointments} Records
                </span>
              </div>

              <div className="appointment-table">
                <div className="table-row admin-table-header">
                  <span>
                    Patient
                  </span>

                  <span>
                    Doctor
                  </span>

                  <span>
                    Date / Time
                  </span>

                  <span>
                    Token
                  </span>

                  <span>
                    Status
                  </span>

                  <span>
                    Actions
                  </span>
                </div>

                {appointments.length === 0 ? (
                  <p className="no-appointments">
                    No appointments available.
                  </p>
                ) : (
                  appointments.map(
                    (appointment) => (
                      <div
                        className="table-row admin-data-row"
                        key={appointment.id}
                      >
                        <span>
                          {appointment.patientName}
                        </span>

                        <span>
                          {appointment.doctor}
                        </span>

                        <span>
                          {appointment.appointmentDate}
                          <br />
                          {appointment.appointmentTime}
                        </span>

                        <span>
                          {appointment.tokenNumber}
                        </span>

                        <span
                          className={`status ${
                            appointment.status ===
                            "Completed"
                              ? "completed"
                              : appointment.status ===
                                "Cancelled"
                              ? "risk"
                              : "waiting"
                          }`}
                        >
                          {appointment.status}
                        </span>

                        <div className="admin-actions">
                          {appointment.status !==
                            "Completed" &&
                            appointment.status !==
                              "Cancelled" && (
                              <>
                                <button
                                  className="complete-button"
                                  onClick={() =>
                                    markCompleted(
                                      appointment.id
                                    )
                                  }
                                >
                                  Complete
                                </button>

                                <button
                                  className="cancel-button"
                                  onClick={() =>
                                    markCancelled(
                                      appointment.id
                                    )
                                  }
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                          <select
                            className="risk-select"
                            value={
                              appointment.noShowRisk ===
                              "Pending"
                                ? ""
                                : appointment.noShowRisk ||
                                  ""
                            }
                            onChange={(event) =>
                              setNoShowRisk(
                                appointment.id,
                                event.target.value
                              )
                            }
                          >
                            <option value="">
                              Risk
                            </option>

                            <option value="Low">
                              Low
                            </option>

                            <option value="Medium">
                              Medium
                            </option>

                            <option value="High">
                              High
                            </option>
                          </select>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </section>

            <section
              className="reports-section"
              id="reports"
            >
              <div className="report-card">
                <h3>
                  Total Appointments
                </h3>

                <p>
                  {totalAppointments}
                </p>
              </div>

              <div className="report-card">
                <h3>
                  Completed Consultations
                </h3>

                <p>
                  {completedAppointments.length}
                </p>
              </div>

              <div className="report-card">
                <h3>
                  No-Shows
                </h3>

                <p>
                  {noShowAppointments.length}
                </p>
              </div>

              <div className="report-card">
                <h3>
                  Cancelled
                </h3>

                <p>
                  {cancelledAppointments.length}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Admin;