import { useEffect, useState } from "react";

function Dashboard({
  user,
  onLogout,
  onProfile,
  onAttendance,
  onLeave
}) {
  const [attendance, setAttendance] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // GET TODAY'S DATE IN INDIA
  // ==================================================

  const getTodayIndia = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
  };

  // ==================================================
  // LOAD ATTENDANCE
  // ==================================================

  const loadAttendance = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/attendance/${user.id}`
      );

      const data = await response.json();

      console.log("ATTENDANCE RESPONSE:", data);

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Unable to load attendance"
        );
        return;
      }

      const records = data.attendance || [];

      const today = getTodayIndia();

      console.log("TODAY INDIA:", today);

      // Find today's record
      const todayRecord = records.find((record) => {
        if (!record.date) {
          return false;
        }

        const recordDate = new Date(
          record.date
        ).toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata"
        });

        console.log(
          "RECORD DATE INDIA:",
          recordDate
        );

        return recordDate === today;
      });

      console.log(
        "TODAY ATTENDANCE:",
        todayRecord
      );

      if (todayRecord) {
        setAttendance(todayRecord);
      } else {
        setAttendance(null);
      }

    } catch (error) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD ATTENDANCE WHEN DASHBOARD OPENS
  // ==================================================

  useEffect(() => {
    loadAttendance();
  }, [user?.id]);

  // ==================================================
  // CHECK IN
  // ==================================================

  const handleCheckIn = async () => {
    try {
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/attendance/check-in",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            employee_id: user.id
          })
        }
      );

      const data = await response.json();

      console.log(
        "CHECK IN RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Check-in failed"
        );

        // If already checked in,
        // load the existing record.
        await loadAttendance();

        return;
      }

      setMessage(
        "Check-in successful!"
      );

      await loadAttendance();

    } catch (error) {
      console.error(
        "CHECK IN ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    }
  };

  // ==================================================
  // CHECK OUT
  // ==================================================

  const handleCheckOut = async () => {
    try {
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/attendance/check-out",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            employee_id: user.id
          })
        }
      );

      const data = await response.json();

      console.log(
        "CHECK OUT RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Check-out failed"
        );

        await loadAttendance();

        return;
      }

      setMessage(
        "Check-out successful!"
      );

      await loadAttendance();

    } catch (error) {
      console.error(
        "CHECK OUT ERROR:",
        error
      );

      setMessage(
        "Unable to connect to server"
      );
    }
  };

  // ==================================================
  // DASHBOARD
  // ==================================================

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">

        <div>
          <h1>Dayflow</h1>

          <p>
            Every workday, perfectly aligned.
          </p>
        </div>

        <div className="user-section">

          <span>
            👤 {user?.employee_id}
          </span>

          <button onClick={onLogout}>
            Logout
          </button>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="dashboard-content">

        <h2>
          Welcome back, {user?.employee_id}!
        </h2>

        <p className="dashboard-subtitle">
          Here's your workday overview.
        </p>


        {/* ================= CARDS ================= */}

        <div className="dashboard-cards">


          {/* PROFILE */}

          <div className="dashboard-card">

            <div className="card-icon">
              👤
            </div>

            <h3>
              Profile
            </h3>

            <p>
              View your personal and job details.
            </p>

            <button onClick={onProfile}>
              View Profile
            </button>

          </div>


          {/* ATTENDANCE */}

          <div className="dashboard-card">

            <div className="card-icon">
              🕐
            </div>

            <h3>
              Attendance
            </h3>

            <p>
              View your daily and weekly attendance.
            </p>

            <button
              onClick={onAttendance}
            >
              View Attendance
            </button>


            <div
              style={{
                marginTop: "30px"
              }}
            >

              {/* CHECK IN */}

              <button
                onClick={handleCheckIn}
                disabled={
                  loading ||
                  !!attendance?.check_in
                }
              >
                Check In
              </button>


              {/* CHECK OUT */}

              <button
                onClick={handleCheckOut}
                disabled={
                  loading ||
                  !attendance?.check_in ||
                  !!attendance?.check_out
                }
                style={{
                  marginLeft: "10px"
                }}
              >
                Check Out
              </button>

            </div>

          </div>


          {/* LEAVE */}

          <div className="dashboard-card">

            <div className="card-icon">
              📅
            </div>

            <h3>
              Leave Requests
            </h3>

            <p>
              Apply for leave and check your status.
            </p>

            <button onClick={onLeave}>
              Manage Leave
            </button>

          </div>

        </div>


        {/* ================= MESSAGE ================= */}

        {message && (
          <p className="attendance-message">
            {message}
          </p>
        )}


        {/* ================= TODAY'S ATTENDANCE ================= */}

        <section className="dashboard-section">

          <h2>
            Today's Attendance
          </h2>

          <div className="attendance-box">


            {/* CHECK IN */}

            <div>

              <span>
                Check-in
              </span>

              <strong>
                {attendance?.check_in
                  ? attendance.check_in
                  : "Not checked in"}
              </strong>

            </div>


            {/* CHECK OUT */}

            <div>

              <span>
                Check-out
              </span>

              <strong>
                {attendance?.check_out
                  ? attendance.check_out
                  : "--:--"}
              </strong>

            </div>


            {/* STATUS */}

            <div>

              <span>
                Status
              </span>

              <strong>
                {attendance?.status
                  ? attendance.status
                  : "Not marked"}
              </strong>

            </div>

          </div>

        </section>


        {/* ================= RECENT ACTIVITY ================= */}

        <section className="dashboard-section">

          <h2>
            Recent Activity
          </h2>

          <div className="activity-box">

            {attendance ? (

              <p>
                🔔 Attendance marked for today.
              </p>

            ) : (

              <p>
                🔔 No recent activity.
              </p>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;