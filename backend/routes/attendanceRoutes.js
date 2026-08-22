const express = require("express");

const {
    getAttendance,
    checkIn,
    checkOut
} = require("../controllers/employeeController");

const router = express.Router();


// Get attendance for an employee
router.get("/:userId", getAttendance);


// Check in
router.post("/check-in", checkIn);


// Check out
router.post("/check-out", checkOut);


module.exports = router;