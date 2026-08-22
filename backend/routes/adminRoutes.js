const express = require("express");

const {
    getAdmins,
    getEmployees,
    getAttendance,
    getLeaves,
    approveLeave,
    rejectLeave
} = require("../controllers/adminController");

const router = express.Router();


// ADMINS
router.get(
    "/admins",
    getAdmins
);


// EMPLOYEES
router.get(
    "/employees",
    getEmployees
);


// ATTENDANCE
router.get(
    "/attendance",
    getAttendance
);


// LEAVES
router.get(
    "/leaves",
    getLeaves
);


// APPROVE
router.put(
    "/leaves/:id/approve",
    approveLeave
);


// REJECT
router.put(
    "/leaves/:id/reject",
    rejectLeave
);


module.exports = router;