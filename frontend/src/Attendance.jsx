import { useEffect, useState } from "react";

function Attendance({ user, onBack }) {

  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);


  // ==================================================
  // LOAD ATTENDANCE
  // ==================================================

  const loadAttendance = async () => {

    try {

      setLoading(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/attendance/${user.id}`
      );

      const data = await response.json();

      if (data.success) {

        setAttendance(data.attendance || []);

      } else {

        setMessage(
          data.message || "Unable to load attendance"
        );

      }

    } catch (error) {

      console.error(
        "ATTENDANCE ERROR:",
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
  // LOAD WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {

    if (user?.id) {
      loadAttendance();
    }

  }, [user]);


  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (time) => {

    if (!time) {
      return "--:--";
    }

    return time;

  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();

  };


  // ==================================================
  // PAGE
  // ==================================================

  return (

    <div className="dashboard">


      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="dashboard-header">

        <div>

          <h1>
            Dayflow
          </h1>

          <p>
            Every workday, perfectly aligned.
          </p>

        </div>


        <button onClick={onBack}>
          ← Back to Dashboard
        </button>

      </header>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <main className="dashboard-content">

        <h2>
          Attendance
        </h2>

        <p className="dashboard-subtitle">
          View your daily and weekly attendance.
        </p>


        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (

          <p className="attendance-message">
            {message}
          </p>

        )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (

          <p>
            Loading attendance...
          </p>

        )}


        {/* ==================================================
            NO RECORDS
        ================================================== */}

        {!loading &&
          !message &&
          attendance.length === 0 && (

            <div className="activity-box">

              <p>
                No attendance records found.
              </p>

            </div>

        )}


        {/* ==================================================
            ATTENDANCE TABLE
        ================================================== */}

        {!loading &&
          attendance.length > 0 && (

            <section className="dashboard-section">

              <h2>
                Attendance History
              </h2>


              <div
                style={{
                  overflowX: "auto"
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "20px"
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left"
                        }}
                      >
                        Date
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left"
                        }}
                      >
                        Check-in
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left"
                        }}
                      >
                        Check-out
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left"
                        }}
                      >
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {attendance.map((record) => (

                      <tr key={record.id}>

                        <td
                          style={{
                            padding: "12px"
                          }}
                        >
                          {formatDate(record.date)}
                        </td>

                        <td
                          style={{
                            padding: "12px"
                          }}
                        >
                          {formatTime(record.check_in)}
                        </td>

                        <td
                          style={{
                            padding: "12px"
                          }}
                        >
                          {formatTime(record.check_out)}
                        </td>

                        <td
                          style={{
                            padding: "12px"
                          }}
                        >
                          {record.status || "Not marked"}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

        )}

      </main>

    </div>

  );

}


export default Attendance;