import { useState } from "react";


function Register({ role, onBackToLogin }) {

  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");


  // ==================================================
  // CREATE ACCOUNT
  // ==================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");


    // Make sure role exists

    if (
      role !== "EMPLOYEE" &&
      role !== "ADMIN"
    ) {

      setError("Invalid account type.");

      return;

    }


    try {

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            employee_id: employeeId.trim(),

            name: name.trim(),

            email: email.trim(),

            password: password,

            phone: phone.trim(),

            address: address.trim(),

            department: department.trim(),

            designation: designation.trim(),

            joining_date: joiningDate,

            role: role

          })
        }
      );


      const data = await response.json();


      // ==================================================
      // SUCCESS
      // ==================================================

      if (response.ok && data.success) {

        setMessage(
          data.message
        );


        // Clear fields

        setEmployeeId("");
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setAddress("");
        setDepartment("");
        setDesignation("");
        setJoiningDate("");


      } else {

        setError(
          data.message ||
          "Account creation failed."
        );

      }


    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        "Unable to connect to server."
      );

    }

  };


  return (

    <div className="register-page">

      <div className="register-card">


        {/* ==================================================
            HEADER
        ================================================== */}

        <h1>
          Dayflow
        </h1>


        <h2>

          {role === "ADMIN"
            ? "Create Admin Account"
            : "Create Employee Account"}

        </h2>


        <p className="register-subtitle">
          Enter your details to register.
        </p>


        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleRegister}
          autoComplete="off"
        >


          {/* ID */}

          <div className="form-group">

            <label>
              {role === "ADMIN"
                ? "Admin ID"
                : "Employee ID"}
            </label>

            <input
              type="text"
              name="account-id"
              placeholder={
                role === "ADMIN"
                  ? "Enter Admin ID"
                  : "Enter Employee ID"
              }
              value={employeeId}
              onChange={(e) =>
                setEmployeeId(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* FULL NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="full-name"
              placeholder="Enter full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="account-email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="account-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="new-password"
              required
            />

          </div>


          {/* PHONE */}

          <div className="form-group">

            <label>
              Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* ADDRESS */}

          <div className="form-group">

            <label>
              Address
            </label>

            <textarea
              name="address"
              placeholder="Enter address"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              rows="3"
              required
            />

          </div>


          {/* DEPARTMENT */}

          <div className="form-group">

            <label>
              Department
            </label>

            <input
              type="text"
              name="department"
              placeholder="Enter department"
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* DESIGNATION */}

          <div className="form-group">

            <label>
              Designation
            </label>

            <input
              type="text"
              name="designation"
              placeholder="Enter designation"
              value={designation}
              onChange={(e) =>
                setDesignation(e.target.value)
              }
              autoComplete="off"
              required
            />

          </div>


          {/* JOINING DATE */}

          <div className="form-group">

            <label>
              Joining Date
            </label>

            <input
              type="date"
              name="joining-date"
              value={joiningDate}
              onChange={(e) =>
                setJoiningDate(e.target.value)
              }
              required
            />

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <p className="register-error">
              {error}
            </p>

          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {message && (

            <p className="register-success">
              {message}
            </p>

          )}


          {/* ==================================================
              CREATE
          ================================================== */}

          <button
            type="submit"
            className="create-account-button"
          >
            Create Account
          </button>


        </form>


        {/* ==================================================
            BACK
        ================================================== */}

        <button
          type="button"
          className="back-login-button"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>


      </div>

    </div>

  );

}


export default Register;