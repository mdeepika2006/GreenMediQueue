import "../styles/Home.css";
import { Link } from "react-router-dom";

import logo from "../assets/hospital-logo.png";
import doctor1 from "../assets/doctor1.jpg";
import doctor2 from "../assets/doctor2.jpg";
import doctor3 from "../assets/doctor3.jpg";

function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="brand">
          <img
            src={logo}
            alt="GreenMediQueue Hospital Logo"
            className="navbar-logo"
          />

          <h2>GreenMediQueue</h2>
        </div>

        <ul>
          <li>
            <Link to="/home">Home</Link>
          </li>

          <li>
            <Link to="/doctors">Doctors</Link>
          </li>

          <li>
            <Link to="/booking">Book Appointment</Link>
          </li>

          <li>
            <Link to="/history">My Appointments</Link>
          </li>

          <li>
            <Link to="/queue">Live Queue</Link>
          </li>

          <li>
            <Link to="/admin">Admin</Link>
          </li>

          <li>
            <Link to="/login">Logout</Link>
          </li>
        </ul>
      </nav>

      <main className="home-content">
        <section className="hero-section">
          <img
            src={logo}
            alt="GreenMediQueue Hospital Logo"
            className="main-logo"
          />

          <h1>GreenMediQueue</h1>

          <h2>Sustainable Cloud Hospital Flow Predictor</h2>

          <p>
            Smart appointment booking, live queue tracking, waiting-time
            prediction and no-show analysis for better hospital management.
          </p>

          <Link to="/booking" className="primary-button-link">
            Book Appointment
          </Link>
        </section>

        <section className="services-section">
          <h3>Our Services</h3>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📅</div>

              <h4>Patient Booking</h4>

              <p>
                Book appointments with available doctors based on department.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">👨‍⚕️</div>

              <h4>Doctor Schedule</h4>

              <p>
                Check doctor specialization, experience and availability.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">🎫</div>

              <h4>Live Queue Token</h4>

              <p>
                Track your token number and estimated waiting time.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">📋</div>

              <h4>Appointment History</h4>

              <p>
                View your booked, completed and cancelled appointments.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">📊</div>

              <h4>No-Show Prediction</h4>

              <p>
                Analyse appointment behaviour and identify no-show risk.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">🖥️</div>

              <h4>Admin Dashboard</h4>

              <p>
                Monitor patient appointments, queues and operational reports.
              </p>
            </div>
          </div>
        </section>

        <section className="doctors-section">
          <h3>Featured Doctors</h3>

          <p className="section-description">
            Meet some of our experienced hospital doctors.
          </p>

          <div className="doctor-grid">
            <div className="doctor-card">
              <img
                src={doctor1}
                alt="Dr. Priya Sharma"
                className="doctor-image"
              />

              <h4>Dr. Priya Sharma</h4>

              <p className="specialization">
                Cardiologist
              </p>

              <p>
                Experience: 10 Years
              </p>

              <p className="availability">
                Available Today
              </p>
            </div>

            <div className="doctor-card">
              <img
                src={doctor2}
                alt="Dr. Anitha Reddy"
                className="doctor-image"
              />

              <h4>Dr. Anitha Reddy</h4>

              <p className="specialization">
                Pediatrician
              </p>

              <p>
                Experience: 8 Years
              </p>

              <p className="availability">
                Available Tomorrow
              </p>
            </div>

            <div className="doctor-card">
              <img
                src={doctor3}
                alt="Dr. Rahul Kumar"
                className="doctor-image"
              />

              <h4>Dr. Rahul Kumar</h4>

              <p className="specialization">
                Neurologist
              </p>

              <p>
                Experience: 12 Years
              </p>

              <p className="availability">
                Available Today
              </p>
            </div>
          </div>

          <Link
            to="/doctors"
            className="view-all-doctors"
          >
            View All Doctors
          </Link>
        </section>
      </main>
    </div>
  );
}

export default Home;