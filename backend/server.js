const express = require("express");
const cors = require("cors");

require("dotenv").config();

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    cors()
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ======================================================
// ROUTES
// ======================================================

const authRoutes =
    require("./routes/authRoutes");

const employeeRoutes =
    require("./routes/employeeRoutes");

const attendanceRoutes =
    require("./routes/attendanceRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const leaveRoutes =
    require("./routes/leaveRoutes");


// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/leave",
    leaveRoutes
);


// ======================================================
// HOME
// ======================================================

app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message: "Dayflow backend is running"
        });

    }
);


// ======================================================
// 404
// ======================================================

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API route not found"
        });

    }
);


// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
);


// ======================================================
// START SERVER
// ======================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Dayflow backend running on http://localhost:${PORT}`
        );

    }
);