import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please login.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/weak-password":
        return "Password must contain at least 6 characters.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "Registration failed. Please try again.";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    if (!formData.consent) {
      alert("Please accept the privacy consent.");
      return;
    }

    try {
      setIsSubmitting(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "patients", user.uid), {
        uid: user.uid,
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        address: formData.address.trim(),
        role: "patient",
        createdAt: serverTimestamp(),
      });

      alert("Patient account created successfully!");

      setFormData({
        fullName: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
        consent: false,
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert(getErrorMessage(error.code));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-heading">
          <h1>Patient Registration</h1>

          <p>
            Create your GreenMediQueue patient account to book appointments
            and track live queue status.
          </p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>

              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                placeholder="Enter Age"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>

              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>

                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter 10-digit Phone Number"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                maxLength="10"
                title="Enter a valid 10-digit phone number"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>

            <textarea
              id="address"
              name="address"
              rows="3"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <label className="consent-row">
            <input
              name="consent"
              type="checkbox"
              checked={formData.consent}
              onChange={handleChange}
              required
            />

            <span>
              I agree to the privacy policy and consent to secure storage of
              my appointment information.
            </span>
          </label>

          <button
            type="submit"
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Patient Account"}
          </button>
        </form>

        <p className="login-text">
          Already registered? <Link to="/login">Login Here</Link>
        </p>

        <Link to="/" className="register-home-link">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Register;