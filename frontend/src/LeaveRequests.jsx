import { useEffect, useState } from "react";
import "./LeaveRequests.css";

function LeaveRequests({ user, onBack }) {
  const [leaveType, setLeaveType] = useState("Sick");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadLeaves = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/leave/${user.id}`
      );

      const data = await response.json();

      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server");
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadLeaves();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!startDate || !endDate) {
      setMessage("Please select both dates.");
      return;
    }

    if (endDate < startDate) {
      setMessage("End date cannot be before start date.");
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

      if (data.success) {
        setMessage("Leave request submitted successfully.");

        setStartDate("");
        setEndDate("");
        setRemarks("");

        loadLeaves();
      } else {
        setMessage(data.message || "Failed to submit leave.");
      }

    } catch (error) {
      console.error(error);
      setMessage("Server error while submitting leave.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="leave-page">

      <header className="leave-header">

        <div>
          <h1>Dayflow</h1>
          <p>Every workday, perfectly aligned.</p>
        </div>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

      </header>

      <main className="leave-container">

        <h2>Leave Requests</h2>

        <p className="page-subtitle">
          Apply for leave and check your status.
        </p>


        {/* APPLY */}

        <section className="leave-section">

          <h2>Apply for Leave</h2>

          <form onSubmit={handleSubmit}>

            <label>Leave Type</label>

            <select
              value={leaveType}
              onChange={(e) =>
                setLeaveType(e.target.value)
              }
            >
              <option value="Sick">Sick Leave</option>
              <option value="Paid">Paid Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
              <option value="Casual">Casual Leave</option>
            </select>


            <div className="date-row">

              <div>
                <label>Start Date</label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label>End Date</label>

                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  required
                />
              </div>

            </div>


            <label>Reason / Remarks</label>

            <textarea
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
              placeholder="Enter reason for leave"
            />


            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Leave Request"}
            </button>

          </form>

          {message && (
            <p className="leave-message">
              {message}
            </p>
          )}

        </section>


        {/* MY LEAVES */}

        <section className="leave-section">

          <div className="leave-title-row">

            <div>
              <h2>My Leave Requests</h2>

              <p>
                View your submitted leave requests.
              </p>
            </div>

            <span>
              {leaves.length} Request
              {leaves.length !== 1 ? "s" : ""}
            </span>

          </div>


          {leaves.length === 0 ? (

            <div className="empty-leaves">
              📅
              <h3>No leave requests yet</h3>
              <p>
                Your leave requests will appear here.
              </p>
            </div>

          ) : (

            <div className="leave-list">

              {leaves.map((leave) => (

                <div
                  className="leave-card"
                  key={leave.id}
                >

                  <div className="leave-card-header">

                    <div>
                      <h3>
                        {leave.leave_type} Leave
                      </h3>

                      <p>
                        {formatDate(leave.start_date)}
                        {" → "}
                        {formatDate(leave.end_date)}
                      </p>
                    </div>

                    <span
                      className={`status ${leave.status.toLowerCase()}`}
                    >
                      {leave.status}
                    </span>

                  </div>


                  <p>
                    <strong>Reason:</strong>{" "}
                    {leave.remarks || "No reason provided"}
                  </p>


                  {leave.admin_comment && (
                    <p>
                      <strong>Admin Comment:</strong>{" "}
                      {leave.admin_comment}
                    </p>
                  )}

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default LeaveRequests;