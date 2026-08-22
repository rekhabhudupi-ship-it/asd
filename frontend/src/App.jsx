import "./App.css";
import { useState } from "react";

import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Attendance from "./Attendance";
import Leave from "./Leave";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";


function App() {

  const [user, setUser] = useState(null);

  const [loginType, setLoginType] = useState("EMPLOYEE");

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [showRegister, setShowRegister] = useState(false);
  const [registerType, setRegisterType] = useState("EMPLOYEE");

  const [showProfile, setShowProfile] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showLeave, setShowLeave] = useState(false);


  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            employee_id: loginId,
            password: password
          })
        }
      );

      const data = await response.json();


      if (!data.success) {

        setError(
          data.message || "Invalid login details"
        );

        return;
      }


      // Check selected login type

      if (
        loginType === "ADMIN" &&
        data.user.role !== "ADMIN"
      ) {

        setError(
          "This account is not an Admin account."
        );

        return;
      }


      if (
        loginType === "EMPLOYEE" &&
        data.user.role !== "EMPLOYEE"
      ) {

        setError(
          "Please select Admin Login for this account."
        );

        return;
      }


      // Login successful

      setUser(data.user);

      setLoginId("");
      setPassword("");
      setError("");

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        "Unable to connect to server"
      );

    }

  };


  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {

    setUser(null);

    setLoginId("");
    setPassword("");

    setError("");

    setLoginType("EMPLOYEE");

    setShowRegister(false);
    setShowProfile(false);
    setShowAttendance(false);
    setShowLeave(false);

  };


  // ==================================================
  // REGISTER PAGE
  // ==================================================

  if (!user && showRegister) {

    return (

      <Register
        role={registerType}

        onBackToLogin={() => {

          setShowRegister(false);
          setError("");

        }}
      />

    );

  }


  // ==================================================
  // ADMIN DASHBOARD
  // ==================================================

  if (
    user &&
    user.role === "ADMIN"
  ) {

    return (

      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />

    );

  }


  // ==================================================
  // PROFILE
  // ==================================================

  if (
    user &&
    showProfile
  ) {

    return (

      <Profile
        user={user}
        onBack={() =>
          setShowProfile(false)
        }
      />

    );

  }


  // ==================================================
  // ATTENDANCE
  // ==================================================

  if (
    user &&
    showAttendance
  ) {

    return (

      <Attendance
        user={user}
        onBack={() =>
          setShowAttendance(false)
        }
      />

    );

  }


  // ==================================================
  // LEAVE
  // ==================================================

  if (
    user &&
    showLeave
  ) {

    return (

      <Leave
        user={user}
        onBack={() =>
          setShowLeave(false)
        }
      />

    );

  }


  // ==================================================
  // EMPLOYEE DASHBOARD
  // ==================================================

  if (user) {

    return (

      <Dashboard
        user={user}

        onLogout={handleLogout}

        onProfile={() =>
          setShowProfile(true)
        }

        onAttendance={() =>
          setShowAttendance(true)
        }

        onLeave={() =>
          setShowLeave(true)
        }

      />

    );

  }


  // ==================================================
  // LOGIN PAGE
  // ==================================================

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>
          Dayflow
        </h1>

        <p>
          Employee Management System
        </p>


        <form onSubmit={handleLogin}>


          {/* LOGIN TYPE */}

          <label>
            Login As
          </label>

          <select
            value={loginType}
            onChange={(e) => {

              setLoginType(e.target.value);
              setLoginId("");
              setPassword("");
              setError("");

            }}
          >

            <option value="EMPLOYEE">
              Employee
            </option>

            <option value="ADMIN">
              Admin
            </option>

          </select>


          {/* ID */}

          <input
            type="text"
            placeholder={
              loginType === "ADMIN"
                ? "Admin ID"
                : "Employee ID"
            }
            value={loginId}
            onChange={(e) =>
              setLoginId(e.target.value)
            }
            required
          />


          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />


          {/* ERROR */}

          {error && (

            <p className="login-error">
              {error}
            </p>

          )}


          {/* LOGIN */}

          <button type="submit">
            Login
          </button>

        </form>


        {/* CREATE ACCOUNT */}

        <div className="register-section">

          <p>
            {loginType === "ADMIN"
              ? "New admin?"
              : "New employee?"}
          </p>

          <button
            type="button"
            className="register-button"
            onClick={() => {

              setRegisterType(loginType);

              setShowRegister(true);

              setError("");

            }}
          >
            Create New Account
          </button>

        </div>


      </div>

    </div>

  );

}


export default App;