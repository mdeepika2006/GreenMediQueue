import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebase";
import "../styles/Booking.css";

function Booking() {
  const navigate = useNavigate();

  const doctorMap = {
    Cardiology: ["Dr. Priya Sharma"],
    Pediatrics: ["Dr. Anitha Reddy"],
    Neurology: ["Dr. Rahul Kumar"],
    Orthopedics: ["Dr. Arjun Varma"],
    Dermatology: ["Dr. Meena Rao"],
    "General Medicine": ["Dr. Kiran Patel"],
  };

  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    email: "",
    department: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    symptoms: "",
  });

  const [isBooking, setIsBooking] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "department") {
      setFormData((previousData) => ({
        ...previousData,
        department: value,
        doctor: "",
      }));
    } else {
      setFormData((previousData) => ({
        ...previousData,
        [name]: value,
      }));
    }
  };

  const generateToken = () => {
    const randomNumber = Math.floor(
      100 + Math.random() * 900
    );

    return "GMQ-" + randomNumber;
  };

  const calculateNoShowRisk = (time) => {
    const hour = parseInt(time.split(":")[0]);

    if (hour >= 8 && hour < 12) {
      return "Low";
    }

    if (hour >= 12 && hour < 17) {
      return "Medium";
    }

    return "High";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsBooking(true);

      const tokenNumber = generateToken();

      const noShowRisk =
        calculateNoShowRisk(
          formData.appointmentTime
        );

      await addDoc(
        collection(db, "appointments"),
        {
          patientId: auth.currentUser
            ? auth.currentUser.uid
            : null,

          patientName:
            formData.patientName.trim(),

          phone: formData.phone.trim(),

          email: formData.email
            .trim()
            .toLowerCase(),

          department:
            formData.department,

          doctor: formData.doctor,

          appointmentDate:
            formData.appointmentDate,

          appointmentTime:
            formData.appointmentTime,

          symptoms:
            formData.symptoms.trim(),

          tokenNumber: tokenNumber,

          status: "Booked",

          queueStatus: "Waiting",

          noShowRisk: noShowRisk,

          createdAt:
            serverTimestamp(),
        }
      );

      alert(
        "Appointment booked successfully!\nYour Token Number: " +
          tokenNumber +
          "\nNo-Show Risk: " +
          noShowRisk
      );

      setFormData({
        patientName: "",
        phone: "",
        email: "",
        department: "",
        doctor: "",
        appointmentDate: "",
        appointmentTime: "",
        symptoms: "",
      });

      navigate("/queue");
    } catch (error) {
      console.error(
        "Booking error:",
        error
      );

      alert(
        "Appointment booking failed. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="booking-container">
      <h1>Book an Appointment</h1>

      <p>
        Fill in the details below to
        schedule your appointment.
      </p>

      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="patientName"
          placeholder="Enter Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Enter Phone Number"
          value={formData.phone}
          onChange={handleChange}
          pattern="[0-9]{10}"
          maxLength="10"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Enter Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">
            Select Department
          </option>

          <option value="Cardiology">
            Cardiology
          </option>

          <option value="Neurology">
            Neurology
          </option>

          <option value="Pediatrics">
            Pediatrics
          </option>

          <option value="Dermatology">
            Dermatology
          </option>

          <option value="Orthopedics">
            Orthopedics
          </option>

          <option value="General Medicine">
            General Medicine
          </option>
        </select>

        <select
          name="doctor"
          value={formData.doctor}
          onChange={handleChange}
          required
          disabled={
            !formData.department
          }
        >
          <option value="">
            {formData.department
              ? "Select Doctor"
              : "Select Department First"}
          </option>

          {formData.department &&
            doctorMap[
              formData.department
            ]?.map((doctor) => (
              <option
                key={doctor}
                value={doctor}
              >
                {doctor}
              </option>
            ))}
        </select>

        <input
          type="date"
          name="appointmentDate"
          value={
            formData.appointmentDate
          }
          onChange={handleChange}
          required
        />

        <input
          type="time"
          name="appointmentTime"
          value={
            formData.appointmentTime
          }
          onChange={handleChange}
          required
        />

        <textarea
          name="symptoms"
          rows="5"
          placeholder="Describe your symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          required
        ></textarea>

        <button
          type="submit"
          disabled={isBooking}
        >
          {isBooking
            ? "Booking Appointment..."
            : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default Booking;