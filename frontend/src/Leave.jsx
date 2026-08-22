import { useEffect, useState } from "react";
import "./Leave.css";

function Leave({ user, onBack }) {

  const [leaveType, setLeaveType] = useState("Sick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);


  // =====================================================
  // LOAD MY LEAVE REQUESTS
  // =====================================================

  const loadLeaves = async () => {

    if (!user?.id) {
      return;
    }

    try {

      const response = await fetch(
        `http://localhost:5000/api/leave/${user.id}`
      );

      const data = await response.json();

      console.log("MY LEAVES:", data);

      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        setMessage(
          data.message || "Unable to load leave requests"
        );
      }

    } catch (error) {

      console.error("LOAD LEAVES ERROR:", error);

      setMessage(
        "Unable to connect to server"
      );
    }
  };


  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {
    loadLeaves();
  }, [user]);


  // =====================================================
  // SUBMIT LEAVE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");


    // Check user

    if (!user?.id) {

      setMessage(
        "Employee information not found. Please login again."
      );

      return;
    }


    // Check dates

    if (!startDate || !endDate) {

      setMessage(
        "Please select start date and end date."
      );

      return;
    }


    // Check date order

    if (endDate < startDate) {

      setMessage(
        "End date cannot be before start date."
      );

      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        "http://localhost:5000/api/leave",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            employee_id: user.id,

            leave_type: leaveType,

            start_date: startDate,

            end_date: endDate,

            remarks: remarks

          })
        }
      );


      const data = await response.json();

      console.log(
        "SUBMIT LEAVE RESPONSE:",
        data
      );


      if (data.success) {

        setMessage(
          "Leave request submitted successfully."
        );


        // Clear form

        setLeaveType("Sick");
        setStartDate("");
        setEndDate("");
        setRemarks("");


        // Reload requests

        await loadLeaves();

      } else {

        setMessage(
          data.message ||
          "Unable to submit leave request."
        );
      }

    } catch (error) {

      console.error(
        "SUBMIT LEAVE ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server."
      );

    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (isNaN(formattedDate.getTime())) {
      return "-";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );
  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    const value = String(
      status || "Pending"
    ).toLowerCase();

    if (value === "approved") {
      return "approved";
    }

    if (value === "rejected") {
      return "rejected";
    }

    return "pending";
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="leave-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="leave-header">

        <div className="leave-brand">

          <h1>
            Dayflow
          </h1>

          <p>
            Every workday, perfectly aligned.
          </p>

        </div>


        <div className="leave-user">

          <span>
            👤 {user?.employee_id || "Employee"}
          </span>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="leave-container">


        {/* PAGE TITLE */}

        <div className="page-title">

          <h2>
            Leave Requests
          </h2>

          <p>
            Apply for leave and track your request status.
          </p>

        </div>


        {/* =================================================
            APPLY FOR LEAVE
        ================================================= */}

        <section className="leave-section">

          <div className="section-heading">

            <div>

              <h2>
                Apply for Leave
              </h2>

              <p>
                Submit a new leave request to your administrator.
              </p>

            </div>

          </div>


          <form
            className="leave-form"
            onSubmit={handleSubmit}
          >


            {/* LEAVE TYPE */}

            <div className="form-group">

              <label>
                Leave Type
              </label>

              <select
                value={leaveType}
                onChange={(e) =>
                  setLeaveType(e.target.value)
                }
              >

                <option value="Sick">
                  Sick Leave
                </option>

                <option value="Paid">
                  Paid Leave
                </option>

                <option value="Casual">
                  Casual Leave
                </option>

                <option value="Unpaid">
                  Unpaid Leave
                </option>

              </select>

            </div>


            {/* DATES */}

            <div className="date-row">


              <div className="form-group">

                <label>
                  Start Date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  End Date
                </label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  required
                />

              </div>


            </div>


            {/* REMARKS */}

            <div className="form-group">

              <label>
                Reason / Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(e) =>
                  setRemarks(e.target.value)
                }
                placeholder="Enter reason for leave..."
                rows="5"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="submit-leave-button"
              disabled={loading}
            >

              {loading
                ? "Submitting..."
                : "Submit Leave Request"
              }

            </button>


          </form>


          {/* MESSAGE */}

          {message && (

            <div className="leave-message">

              {message}

            </div>

          )}

        </section>


        {/* =================================================
            MY LEAVE REQUESTS
        ================================================= */}

        <section className="leave-section">

          <div className="my-leaves-header">

            <div>

              <h2>
                My Leave Requests
              </h2>

              <p>
                View your submitted leave requests and their status.
              </p>

            </div>


            <div className="request-count">

              {leaves.length}

              {" "}

              Request{leaves.length !== 1 ? "s" : ""}

            </div>

          </div>


          {/* NO REQUESTS */}

          {leaves.length === 0 ? (

            <div className="empty-leave">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No leave requests yet
              </h3>

              <p>
                Your submitted leave requests will appear here.
              </p>

            </div>

          ) : (


            /* REQUEST LIST */

            <div className="leave-list">

              {leaves.map((leave) => (

                <div
                  className="leave-card"
                  key={leave.id}
                >


                  <div className="leave-card-header">

                    <div>

                      <h3>
                        {leave.leave_type || "Leave"} Leave
                      </h3>

                      <p className="leave-date">

                        {formatDate(
                          leave.start_date
                        )}

                        {"  →  "}

                        {formatDate(
                          leave.end_date
                        )}

                      </p>

                    </div>


                    <span
                      className={`leave-status ${getStatusClass(
                        leave.status
                      )}`}
                    >

                      {leave.status || "Pending"}

                    </span>

                  </div>


                  <div className="leave-card-details">

                    <p>

                      <strong>
                        Reason:
                      </strong>

                      {" "}

                      {leave.remarks ||
                        "No reason provided"}

                    </p>


                    {leave.admin_comment && (

                      <p>

                        <strong>
                          Admin Comment:
                        </strong>

                        {" "}

                        {leave.admin_comment}

                      </p>

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

export default Leave;