const db = require("../config/db");


// ============================================================
// GET EMPLOYEE PROFILE
// ============================================================

const getEmployeeProfile = async (req, res) => {

    try {

        const userId = req.params.userId;

        const [employees] = await db.query(
            `
            SELECT
                e.id,
                e.user_id,
                u.employee_id,
                u.email,
                u.role,
                e.name,
                e.phone,
                e.address,
                e.profile_picture,
                e.department,
                e.designation,
                e.joining_date
            FROM employees e
            INNER JOIN users u
                ON u.id = e.user_id
            WHERE e.user_id = ?
            `,
            [userId]
        );


        if (employees.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee profile not found"
            });

        }


        return res.json({
            success: true,
            employee: employees[0]
        });


    } catch (error) {

        console.error(
            "PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading profile"
        });

    }

};



// ============================================================
// GET ATTENDANCE
// ============================================================

const getAttendance = async (req, res) => {

    try {

        const userId = req.params.userId;

        console.log(
            "GET ATTENDANCE USER ID:",
            userId
        );


        // ----------------------------------------------------
        // Find employees.id using users.id
        // ----------------------------------------------------

        const [employee] = await db.query(
            `
            SELECT
                e.id,
                e.user_id,
                u.employee_id,
                u.email,
                e.name
            FROM employees e
            INNER JOIN users u
                ON u.id = e.user_id
            WHERE e.user_id = ?
            `,
            [userId]
        );


        if (employee.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });

        }


        // This is employees.id
        const employeeId = employee[0].id;


        console.log(
            "EMPLOYEES TABLE ID:",
            employeeId
        );


        // ----------------------------------------------------
        // Get attendance using employees.id
        // ----------------------------------------------------

        const [attendance] = await db.query(
            `
            SELECT
                id,
                employee_id,
                date,
                check_in,
                check_out,
                status
            FROM attendance
            WHERE employee_id = ?
            ORDER BY date DESC, id DESC
            `,
            [employeeId]
        );


        console.log(
            "ATTENDANCE RECORDS:",
            attendance
        );


        return res.json({
            success: true,
            attendance: attendance
        });


    } catch (error) {

        console.error(
            "GET ATTENDANCE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading attendance"
        });

    }

};



// ============================================================
// CHECK IN
// ============================================================

const checkIn = async (req, res) => {

    try {

        const { employee_id } = req.body;


        if (!employee_id) {

            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });

        }


        console.log(
            "CHECK IN USER ID:",
            employee_id
        );


        // ----------------------------------------------------
        // Convert users.id → employees.id
        // ----------------------------------------------------

        const [employee] = await db.query(
            `
            SELECT
                id
            FROM employees
            WHERE user_id = ?
            `,
            [employee_id]
        );


        if (employee.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });

        }


        const employeeRecordId = employee[0].id;


        console.log(
            "CHECK IN EMPLOYEE ID:",
            employeeRecordId
        );


        // ----------------------------------------------------
        // Check whether already checked in today
        // ----------------------------------------------------

        const [existing] = await db.query(
            `
            SELECT
                id,
                check_in,
                check_out,
                status
            FROM attendance
            WHERE employee_id = ?
            AND date = CURDATE()
            LIMIT 1
            `,
            [employeeRecordId]
        );


        if (existing.length > 0) {

            return res.status(400).json({
                success: false,
                message: "You have already checked in today",
                attendance: existing[0]
            });

        }


        // ----------------------------------------------------
        // Insert attendance
        // ----------------------------------------------------

        await db.query(
            `
            INSERT INTO attendance
            (
                employee_id,
                date,
                check_in,
                status
            )
            VALUES
            (
                ?,
                CURDATE(),
                CURTIME(),
                'Present'
            )
            `,
            [employeeRecordId]
        );


        return res.json({
            success: true,
            message: "Check-in successful"
        });


    } catch (error) {

        console.error(
            "CHECK IN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error during check-in"
        });

    }

};



// ============================================================
// CHECK OUT
// ============================================================

const checkOut = async (req, res) => {

    try {

        const { employee_id } = req.body;


        if (!employee_id) {

            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });

        }


        // ----------------------------------------------------
        // Convert users.id → employees.id
        // ----------------------------------------------------

        const [employee] = await db.query(
            `
            SELECT
                id
            FROM employees
            WHERE user_id = ?
            `,
            [employee_id]
        );


        if (employee.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });

        }


        const employeeRecordId = employee[0].id;


        // ----------------------------------------------------
        // Find today's attendance
        // ----------------------------------------------------

        const [attendance] = await db.query(
            `
            SELECT
                id,
                check_in,
                check_out,
                status
            FROM attendance
            WHERE employee_id = ?
            AND date = CURDATE()
            LIMIT 1
            `,
            [employeeRecordId]
        );


        if (attendance.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please check in first"
            });

        }


        if (attendance[0].check_out) {

            return res.status(400).json({
                success: false,
                message: "You have already checked out today"
            });

        }


        // ----------------------------------------------------
        // Update checkout
        // ----------------------------------------------------

        await db.query(
            `
            UPDATE attendance
            SET
                check_out = CURTIME(),
                status = 'Present'
            WHERE id = ?
            `,
            [attendance[0].id]
        );


        return res.json({
            success: true,
            message: "Check-out successful"
        });


    } catch (error) {

        console.error(
            "CHECK OUT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error during check-out"
        });

    }

};



// ============================================================
// GET EMPLOYEE LEAVES
// ============================================================

const getLeaves = async (req, res) => {

    try {

        const userId = req.params.userId;


        // ----------------------------------------------------
        // Convert users.id → employees.id
        // ----------------------------------------------------

        const [employee] = await db.query(
            `
            SELECT
                id
            FROM employees
            WHERE user_id = ?
            `,
            [userId]
        );


        if (employee.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });

        }


        const employeeRecordId = employee[0].id;


        // ----------------------------------------------------
        // Get leaves
        // ----------------------------------------------------

        const [leaves] = await db.query(
            `
            SELECT
                id,
                employee_id,
                leave_type,
                start_date,
                end_date,
                remarks,
                status,
                admin_comment
            FROM leaves
            WHERE employee_id = ?
            ORDER BY id DESC
            `,
            [employeeRecordId]
        );


        return res.json({
            success: true,
            leaves: leaves
        });


    } catch (error) {

        console.error(
            "GET LEAVES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading leave requests"
        });

    }

};



// ============================================================
// APPLY FOR LEAVE
// ============================================================

const applyLeave = async (req, res) => {

    try {

        const {
            employee_id,
            leave_type,
            start_date,
            end_date,
            remarks
        } = req.body;


        if (
            !employee_id ||
            !leave_type ||
            !start_date ||
            !end_date
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });

        }


        // ----------------------------------------------------
        // Convert users.id → employees.id
        // ----------------------------------------------------

        const [employee] = await db.query(
            `
            SELECT
                id
            FROM employees
            WHERE user_id = ?
            `,
            [employee_id]
        );


        if (employee.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });

        }


        const employeeRecordId = employee[0].id;


        // ----------------------------------------------------
        // Validate dates
        // ----------------------------------------------------

        if (end_date < start_date) {

            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date"
            });

        }


        // ----------------------------------------------------
        // Insert leave
        // ----------------------------------------------------

        await db.query(
            `
            INSERT INTO leaves
            (
                employee_id,
                leave_type,
                start_date,
                end_date,
                remarks,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                'Pending'
            )
            `,
            [
                employeeRecordId,
                leave_type,
                start_date,
                end_date,
                remarks || null
            ]
        );


        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully"
        });


    } catch (error) {

        console.error(
            "APPLY LEAVE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while submitting leave request"
        });

    }

};



// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getEmployeeProfile,

    getAttendance,

    checkIn,

    checkOut,

    getLeaves,

    applyLeave

};