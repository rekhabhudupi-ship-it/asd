const express = require("express");

const {
    getMyLeaves,
    applyLeave
} = require("../controllers/leaveController");

const router = express.Router();


// ======================================================
// GET MY LEAVES
// ======================================================

router.get(
    "/:userId",
    getMyLeaves
);


// ======================================================
// APPLY LEAVE
// ======================================================

router.post(
    "/",
    applyLeave
);


module.exports = router;