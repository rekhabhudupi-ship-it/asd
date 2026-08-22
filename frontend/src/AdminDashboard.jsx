import { useEffect, useState } from "react";

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("admins");

  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API = "http://localhost:5000/api";

  // =========================================================
  // LOAD ADMINS
  // =========================================================

  const loadAdmins = async () => {
    try {
      const response = await fetch(`${API}/admin/admins`);
      const data = await response.json();

      console.log("ADMINS:", data);

      if (data.success) {
        setAdmins(data.admins || []);
      } else {
        setAdmins([]);
      }
    } catch (error) {
      console.error("LOAD ADMINS ERROR:", error);
      setAdmins([]);
    }
  };

  // =========================================================
  // LOAD EMPLOYEES
  // =========================================================

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API}/admin/employees`);
      const data = await response.json();

      console.log("EMPLOYEES:", data);

      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error("LOAD EMPLOYEES ERROR:", error);
      setEmployees([]);
    }
  };

  // =========================================================
  // LOAD ATTENDANCE
  // =========================================================

  const loadAttendance = async () => {
    try {
      const response = await fetch(`${API}/admin/attendance`);
      const data = await response.json();

      console.log("ATTENDANCE:", data);

      if (data.success) {
        setAttendance(data.attendance || []);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("LOAD ATTENDANCE ERROR:", error);
      setAttendance([]);
    }
  };

  // =========================================================
  // LOAD LEAVES
  // =========================================================

  const loadLeaves = async () => {
    try {
      const response = await fetch(`${API}/admin/leaves`);
      const data = await response.json();

      console.log("LEAVES:", data);

      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error("LOAD LEAVES ERROR:", error);
      setLeaves([]);
    }
  };

  // =========================================================
  // LOAD ALL DATA
  // =========================================================

  const loadAllData = async () => {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all([
        loadAdmins(),
        loadEmployees(),
        loadAttendance(),
        loadLeaves()
      ]);

      setMessage("Data refreshed successfully.");
    } catch (error) {
      console.error("LOAD ALL DATA ERROR:", error);
      setMessage("Unable to load dashboard data.");
    }

    setLoading(false);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAllData();
  }, []);

  // =========================================================
  // RELOAD DATA WHEN TAB CHANGES
  // =========================================================

  useEffect(() => {
    if (activeTab === "admins") {
      loadAdmins();
    }

    if (activeTab === "employees") {
      loadEmployees();
    }

    if (activeTab === "attendance") {
      loadAttendance();
    }

    if (activeTab === "leaves") {
      loadLeaves();
    }
  }, [activeTab]);

  // =========================================================
  // APPROVE LEAVE
  // =========================================================

  const approveLeave = async (id) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}/admin/leaves/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      console.log("APPROVE RESPONSE:", data);

      if (data.success) {
        setMessage("Leave approved successfully.");

        // Reload leaves immediately
        await loadLeaves();
      } else {
        setMessage(
          data.message || "Unable to approve leave."
        );
      }
    } catch (error) {
      console.error("APPROVE LEAVE ERROR:", error);

      setMessage(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REJECT LEAVE
  // =========================================================

  const rejectLeave = async (id) => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API}/admin/leaves/${id}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      console.log("REJECT RESPONSE:", data);

      if (data.success) {
        setMessage("Leave rejected successfully.");

        // Reload leaves immediately
        await loadLeaves();
      } else {
        setMessage(
          data.message || "Unable to reject leave."
        );
      }
    } catch (error) {
      console.error("REJECT LEAVE ERROR:", error);

      setMessage(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (time) => {
    if (!time) {
      return "--:--";
    }

    return String(time).substring(0, 8);
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-header">

        <div className="admin-brand">

          <h1>Dayflow</h1>

          <p>
            Admin Management System
          </p>

        </div>


        <div className="admin-user">

          <div className="admin-user-icon">
            👨‍💼
          </div>

          <div>

            <strong>
              {user?.employee_id || "Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

          <button
            onClick={onLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-container">

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="admin-title">

          <div>

            <h2>
              Admin Dashboard
            </h2>

            <p>
              Manage employees, attendance and leave requests.
            </p>

          </div>


          <button
            className="refresh-button"
            onClick={loadAllData}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="admin-stats">

          <div className="stat-card">

            <div className="stat-icon">
              👨‍💼
            </div>

            <div>

              <span>
                Administrators
              </span>

              <strong>
                {admins.length}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              👥
            </div>

            <div>

              <span>
                Employees
              </span>

              <strong>
                {employees.length}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              🕐
            </div>

            <div>

              <span>
                Attendance Records
              </span>

              <strong>
                {attendance.length}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon">
              📅
            </div>

            <div>

              <span>
                Leave Requests
              </span>

              <strong>
                {leaves.length}
              </strong>

            </div>

          </div>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="admin-message">
            {message}
          </div>

        )}


        {/* =================================================
            TABS
        ================================================= */}

        <div className="admin-tabs">

          <button
            className={
              activeTab === "admins"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("admins")}
          >
            👨‍💼 Admin Control
          </button>


          <button
            className={
              activeTab === "employees"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("employees")}
          >
            👥 Employees
          </button>


          <button
            className={
              activeTab === "attendance"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("attendance")}
          >
            🕐 Attendance
          </button>


          <button
            className={
              activeTab === "leaves"
                ? "active"
                : ""
            }
            onClick={() => setActiveTab("leaves")}
          >
            📅 Leave Requests
          </button>

        </div>


        {/* =================================================
            ADMIN CONTROL
        ================================================= */}

        {activeTab === "admins" && (

          <section className="admin-section">

            <div className="section-heading">

              <div>

                <h3>
                  Admin Control
                </h3>

                <p>
                  Manage administrator accounts.
                </p>

              </div>

            </div>


            {admins.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  👨‍💼
                </div>

                <h3>
                  No admin accounts found
                </h3>

                <p>
                  No administrators available.
                </p>

              </div>

            ) : (

              <div className="admin-grid">

                {admins.map((admin) => (

                  <div
                    className="admin-card"
                    key={admin.id}
                  >

                    <div className="admin-card-top">

                      <div className="profile-circle">

                        {admin.name
                          ? admin.name
                              .charAt(0)
                              .toUpperCase()
                          : "A"}

                      </div>

                      <span className="role-badge">
                        ADMIN
                      </span>

                    </div>


                    <h3>
                      {admin.name || "Admin"}
                    </h3>


                    <div className="admin-detail">

                      <span>
                        Admin ID
                      </span>

                      <strong>
                        {admin.employee_id || "-"}
                      </strong>

                    </div>


                    <div className="admin-detail">

                      <span>
                        Email
                      </span>

                      <strong>
                        {admin.email || "-"}
                      </strong>

                    </div>


                    <div className="admin-detail">

                      <span>
                        Department
                      </span>

                      <strong>
                        {admin.department || "-"}
                      </strong>

                    </div>


                    <div className="admin-detail">

                      <span>
                        Designation
                      </span>

                      <strong>
                        {admin.designation || "-"}
                      </strong>

                    </div>


                    <div className="admin-detail">

                      <span>
                        Phone
                      </span>

                      <strong>
                        {admin.phone || "-"}
                      </strong>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* =================================================
            EMPLOYEES
        ================================================= */}

        {activeTab === "employees" && (

          <section className="admin-section">

            <div className="section-heading">

              <div>

                <h3>
                  All Employees
                </h3>

                <p>
                  View employee information.
                </p>

              </div>

            </div>


            {employees.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  👥
                </div>

                <h3>
                  No employees found
                </h3>

              </div>

            ) : (

              <div className="employee-grid">

                {employees.map((employee) => (

                  <div
                    className="employee-card"
                    key={employee.id}
                  >

                    <div className="profile-circle">

                      {employee.name
                        ? employee.name
                            .charAt(0)
                            .toUpperCase()
                        : "E"}

                    </div>


                    <h3>
                      {employee.name || "Employee"}
                    </h3>


                    <p>
                      <strong>
                        Employee ID:
                      </strong>{" "}
                      {employee.employee_id || "-"}
                    </p>


                    <p>
                      <strong>
                        Email:
                      </strong>{" "}
                      {employee.email || "-"}
                    </p>


                    <p>
                      <strong>
                        Department:
                      </strong>{" "}
                      {employee.department || "-"}
                    </p>


                    <p>
                      <strong>
                        Designation:
                      </strong>{" "}
                      {employee.designation || "-"}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}


        {/* =================================================
            ATTENDANCE
        ================================================= */}

        {activeTab === "attendance" && (

          <section className="admin-section">

            <div className="section-heading">

              <div>

                <h3>
                  Attendance
                </h3>

                <p>
                  View employee attendance records.
                </p>

              </div>

              <strong>
                Total Records: {attendance.length}
              </strong>

            </div>


            {attendance.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  🕐
                </div>

                <h3>
                  No attendance records
                </h3>

                <p>
                  Attendance records will appear here
                  after employees check in.
                </p>

              </div>

            ) : (

              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Employee
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Check In
                      </th>

                      <th>
                        Check Out
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {attendance.map((record) => (

                      <tr key={record.id}>

                        <td>

                          <strong>
                            {record.name || "Unknown"}
                          </strong>

                          <small>
                            {record.employee_code ||
                              record.employee_id ||
                              "-"}
                          </small>

                        </td>


                        <td>
                          {formatDate(record.date)}
                        </td>


                        <td>
                          {formatTime(record.check_in)}
                        </td>


                        <td>
                          {formatTime(record.check_out)}
                        </td>


                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              record.status
                            )}`}
                          >
                            {record.status || "Unknown"}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </section>

        )}


        {/* =================================================
            LEAVE REQUESTS
        ================================================= */}

        {activeTab === "leaves" && (

          <section className="admin-section">

            <div className="section-heading">

              <div>

                <h3>
                  Leave Requests
                </h3>

                <p>
                  Review and manage employee leave requests.
                </p>

              </div>

              <strong>
                Total Requests: {leaves.length}
              </strong>

            </div>


            {leaves.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  📅
                </div>

                <h3>
                  No leave requests
                </h3>

                <p>
                  Employee leave requests will appear here.
                </p>

              </div>

            ) : (

              <div className="leave-admin-list">

                {leaves.map((leave) => (

                  <div
                    className="leave-admin-card"
                    key={leave.id}
                  >

                    <div className="leave-content">

                      <div className="leave-admin-title">

                        <h3>
                          {leave.name || "Employee"}
                        </h3>

                        <span
                          className={`status-badge ${getStatusClass(
                            leave.status
                          )}`}
                        >
                          {leave.status || "Pending"}
                        </span>

                      </div>


                      <p>
                        <strong>
                          Employee ID:
                        </strong>{" "}
                        {leave.employee_id || "-"}
                      </p>


                      <p>
                        <strong>
                          Leave:
                        </strong>{" "}
                        {leave.leave_type || "-"}
                      </p>


                      <p>
                        <strong>
                          From:
                        </strong>{" "}
                        {formatDate(leave.start_date)}
                      </p>


                      <p>
                        <strong>
                          To:
                        </strong>{" "}
                        {formatDate(leave.end_date)}
                      </p>


                      <p>
                        <strong>
                          Reason:
                        </strong>{" "}
                        {leave.remarks || "-"}
                      </p>


                      {leave.admin_comment && (

                        <p>
                          <strong>
                            Admin Comment:
                          </strong>{" "}
                          {leave.admin_comment}
                        </p>

                      )}

                    </div>


                    {/* =================================================
                        APPROVE / REJECT BUTTONS
                    ================================================= */}

                    {String(leave.status || "")
                      .toLowerCase() === "pending" && (

                      <div className="leave-actions">

                        <button
                          className="approve-button"
                          onClick={() =>
                            approveLeave(leave.id)
                          }
                          disabled={loading}
                        >
                          ✓ Approve
                        </button>


                        <button
                          className="reject-button"
                          onClick={() =>
                            rejectLeave(leave.id)
                          }
                          disabled={loading}
                        >
                          ✕ Reject
                        </button>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

      </main>

    </div>
  );
}

export default AdminDashboard;