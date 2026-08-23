import "../styles/Doctors.css";
import { Link } from "react-router-dom";

import logo from "../assets/hospital-logo.png";
import doctor1 from "../assets/doctor1.jpg";
import doctor2 from "../assets/doctor2.jpg";
import doctor3 from "../assets/doctor3.jpg";
import doctor4 from "../assets/doctor4.jpg";
import doctor5 from "../assets/doctor5.jpg";
import doctor6 from "../assets/doctor6.jpg";

function Doctors() {
  const doctors = [
    {
      name: "Dr. Priya Sharma",
      specialization: "Cardiologist",
      experience: "10 Years",
      availability: "Available Today",
      image: doctor1,
    },
    {
      name: "Dr. Anitha Reddy",
      specialization: "Pediatrician",
      experience: "8 Years",
      availability: "Available Tomorrow",
      image: doctor2,
    },
    {
      name: "Dr. Rahul Kumar",
      specialization: "Neurologist",
      experience: "12 Years",
      availability: "Available Today",
      image: doctor3,
    },
    {
      name: "Dr. Arjun Varma",
      specialization: "Orthopedic Surgeon",
      experience: "11 Years",
      availability: "Available Today",
      image: doctor4,
    },
    {
      name: "Dr. Meena Rao",
      specialization: "Dermatologist",
      experience: "9 Years",
      availability: "Available Tomorrow",
      image: doctor5,
    },
    {
      name: "Dr. Kiran Patel",
      specialization: "General Physician",
      experience: "14 Years",
      availability: "Available Today",
      image: doctor6,
    },
  ];

  return (
    <div className="doctors-page">
      <nav className="doctors-navbar">
        <div className="doctors-brand">
          <img src={logo} alt="Hospital Logo" />
          <h2>GreenMediQueue</h2>
        </div>

        <div className="doctors-nav-links">
          <Link to="/home">Home</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/booking">Book Appointment</Link>
          <Link to="/queue">Live Queue</Link>
          <Link to="/login">Logout</Link>
        </div>
      </nav>

      <section className="doctors-header">
        <h1>Our Doctors</h1>

        <p>
          Choose an experienced doctor based on specialization and
          availability.
        </p>
      </section>

      <section className="all-doctors-grid">
        {doctors.map((doctor, index) => (
          <div className="all-doctor-card" key={index}>
            <img
              src={doctor.image}
              alt={doctor.name}
              className="all-doctor-image"
            />

            <h2>{doctor.name}</h2>

            <p className="doctor-specialization">
              {doctor.specialization}
            </p>

            <p>Experience: {doctor.experience}</p>

            <span className="doctor-availability">
              {doctor.availability}
            </span>

            <Link to="/booking" className="doctor-book-button">
              Book Appointment
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Doctors;