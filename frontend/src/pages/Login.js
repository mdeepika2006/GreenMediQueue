import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/invalid-credential":
        return "Incorrect email or password.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/too-many-requests":
        return "Too many login attempts. Please try again later.";

      case "auth/network-request-failed":
        return "Please check your internet connection.";

      default:
        return "Login failed. Please check your email and password.";
    }
  };

  const findUserRole = async (userEmail) => {
    const normalizedEmail = userEmail
      .trim()
      .toLowerCase();

    console.log(
      "Searching Firestore for email:",
      normalizedEmail
    );

    // -------------------------------
    // CHECK USERS COLLECTION
    // -------------------------------

    const usersSnapshot = await getDocs(
      collection(db, "users")
    );

    console.log(
      "Total users documents:",
      usersSnapshot.size
    );

    usersSnapshot.forEach((document) => {
      console.log(
        "USER DOCUMENT:",
        document.id,
        document.data()
      );
    });

    for (const userDocument of usersSnapshot.docs) {
      const userData = userDocument.data();

      const databaseEmail = String(
        userData.email || ""
      )
        .trim()
        .toLowerCase();

      console.log(
        "Comparing:",
        databaseEmail,
        "with",
        normalizedEmail
      );

      if (databaseEmail === normalizedEmail) {
        console.log(
          "User matched:",
          userData
        );

        return {
          role: String(
            userData.role || ""
          )
            .trim()
            .toLowerCase(),

          name:
            userData.name ||
            "GreenMediQueue User",
        };
      }
    }

    // -------------------------------
    // CHECK PATIENTS COLLECTION
    // -------------------------------

    const patientsSnapshot = await getDocs(
      collection(db, "patients")
    );

    console.log(
      "Total patient documents:",
      patientsSnapshot.size
    );

    patientsSnapshot.forEach((document) => {
      console.log(
        "PATIENT DOCUMENT:",
        document.id,
        document.data()
      );
    });

    for (const patientDocument of patientsSnapshot.docs) {
      const patientData =
        patientDocument.data();

      const databaseEmail = String(
        patientData.email || ""
      )
        .trim()
        .toLowerCase();

      if (databaseEmail === normalizedEmail) {
        console.log(
          "Patient matched:",
          patientData
        );

        return {
          role: "patient",

          name:
            patientData.fullName ||
            patientData.name ||
            "Patient",
        };
      }
    }

    console.log(
      "No matching Firestore user found for:",
      normalizedEmail
    );

    return null;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!role) {
      alert(
        "Please select a user role."
      );

      return;
    }

    try {
      setIsLoggingIn(true);

      const normalizedEmail = email
        .trim()
        .toLowerCase();

      console.log(
        "Trying Firebase Authentication:",
        normalizedEmail
      );

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password
        );

      console.log(
        "Firebase Authentication successful:",
        userCredential.user.email
      );

      const accountInfo =
        await findUserRole(
          normalizedEmail
        );

      console.log(
        "Account info:",
        accountInfo
      );

      if (!accountInfo) {
        await signOut(auth);

        alert(
          "Your account role information was not found in the database."
        );

        return;
      }

      const selectedRole = role
        .trim()
        .toLowerCase();

      console.log(
        "Selected role:",
        selectedRole
      );

      console.log(
        "Database role:",
        accountInfo.role
      );

      if (
        accountInfo.role !== selectedRole
      ) {
        await signOut(auth);

        alert(
          "Wrong role selected.\nThis account is registered as " +
            accountInfo.role +
            "."
        );

        return;
      }

      sessionStorage.setItem(
        "greenMediQueueRole",
        accountInfo.role
      );

      sessionStorage.setItem(
        "greenMediQueueUserName",
        accountInfo.name
      );

      sessionStorage.setItem(
        "greenMediQueueUserEmail",
        normalizedEmail
      );

      if (rememberMe) {
        localStorage.setItem(
          "greenMediQueueRememberEmail",
          normalizedEmail
        );
      } else {
        localStorage.removeItem(
          "greenMediQueueRememberEmail"
        );
      }

      alert("Login successful!");

      if (
        accountInfo.role === "admin"
      ) {
        navigate("/admin");
      } else if (
        accountInfo.role === "doctor"
      ) {
        navigate(
          "/doctor-dashboard"
        );
      } else if (
        accountInfo.role === "patient"
      ) {
        navigate("/home");
      }
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      alert(
        getErrorMessage(
          error.code
        )
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-container">
      <form
        className="login-box"
        onSubmit={handleLogin}
      >
        <h1>
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Login to access GreenMediQueue
        </p>

        <label htmlFor="role">
          Select Role
        </label>

        <select
          id="role"
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value
            )
          }
          required
        >
          <option
            value=""
            disabled
          >
            Select User Role
          </option>

          <option value="patient">
            Patient
          </option>

          <option value="doctor">
            Doctor
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <label htmlFor="email">
          Email Address
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter Email Address"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          required
        />

        <label htmlFor="password">
          Password
        </label>

        <input
          id="password"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          required
        />

        <div className="login-options">
          <label className="remember-option">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(
                  event.target.checked
                )
              }
            />

            Remember Me
          </label>

          <button
            type="button"
            className="forgot-button"
            onClick={() =>
              alert(
                "Forgot Password functionality will be added later."
              )
            }
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="login-button"
          disabled={isLoggingIn}
        >
          {isLoggingIn
            ? "Logging In..."
            : "Login"}
        </button>

        <p className="register-text">
          New patient?{" "}
          <Link to="/register">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;