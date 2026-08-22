const express = require("express");

const {
    getEmployeeProfile,
    getAttendance,
    checkIn,
    checkOut,
    getLeaves,
    applyLeave
} = require("../controllers/employeeController");

const router = express.Router();


// ==================================================
// PROFILE
// ==================================================

router.get(
    "/profile/:userId",
    getEmployeeProfile
);


// ==================================================
// ATTENDANCE
// ==================================================

router.get(
    "/attendance/:userId",
    getAttendance
);

router.post(
    "/attendance/check-in",
    checkIn
);

router.post(
    "/attendance/check-out",
    checkOut
);


// ==================================================
// LEAVES
// ==================================================

router.get(
    "/leaves/:userId",
    getLeaves
);

router.post(
    "/leaves",
    applyLeave
);


module.exports = router;