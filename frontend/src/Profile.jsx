import { useEffect, useState } from "react";

function Profile({ user, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/employees/profile/${user.id}`
        );

        const data = await response.json();

        if (data.success) {
          setEmployee(data.employee);
        } else {
          setError(data.message || "Unable to load profile");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="profile-page">
        <h1>Employee Profile</h1>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <h1>Employee Profile</h1>
        <p>{error}</p>

        <button onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* HEADER */}

      <div className="profile-header">

        <div>
          <h1>Employee Profile</h1>

          <p>
            View your personal and job information.
          </p>
        </div>

        <button onClick={onBack}>
          ← Back to Dashboard
        </button>

      </div>


      {/* PROFILE CARD */}

      <div className="profile-card">

        <div className="profile-top">

          <div className="profile-icon">
            👤
          </div>

          <div>
            <h2>{employee.name}</h2>

            <p>
              {employee.designation}
            </p>
          </div>

        </div>


        {/* DETAILS */}

        <div className="profile-details">

          <div className="profile-row">
            <span>Employee ID</span>
            <strong>{employee.employee_id}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{employee.email}</strong>
          </div>

          <div className="profile-row">
            <span>Phone</span>
            <strong>{employee.phone}</strong>
          </div>

          <div className="profile-row">
            <span>Address</span>
            <strong>{employee.address}</strong>
          </div>

          <div className="profile-row">
            <span>Department</span>
            <strong>{employee.department}</strong>
          </div>

          <div className="profile-row">
            <span>Designation</span>
            <strong>{employee.designation}</strong>
          </div>

          <div className="profile-row">
            <span>Joining Date</span>
            <strong>
              {new Date(employee.joining_date).toLocaleDateString()}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;