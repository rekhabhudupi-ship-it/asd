const db = require("../config/db");


// ============================================================
// GET MY LEAVE REQUESTS
// ============================================================

const getMyLeaves = async (req, res) => {
    try {

        const userId = req.params.userId;

        // Find employee record using users.id
        const [employeeRows] = await db.query(
            `
            SELECT
                e.id AS employee_table_id,
                e.user_id,
                u.employee_id AS employee_code,
                e.name
            FROM employees e
            INNER JOIN users u
                ON e.user_id = u.id
            WHERE e.user_id = ?
            LIMIT 1
            `,
            [userId]
        );

        if (employeeRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });
        }

        const employeeId = employeeRows[0].employee_table_id;

        // Get leave requests
        const [leaves] = await db.query(
            `
            SELECT
                l.id,
                l.employee_id,
                u.employee_id AS employee_code,
                e.name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.remarks,
                l.status,
                l.admin_comment
            FROM leaves l
            LEFT JOIN employees e
                ON l.employee_id = e.id
            LEFT JOIN users u
                ON e.user_id = u.id
            WHERE l.employee_id = ?
            ORDER BY l.id DESC
            `,
            [employeeId]
        );

        return res.json({
            success: true,
            leaves
        });

    } catch (error) {

        console.error(
            "GET MY LEAVES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while loading leaves",
            error: error.message
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


        // ------------------------------------------------------
        // VALIDATE INPUT
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // FIND EMPLOYEE
        // ------------------------------------------------------

        let employee = null;


        // ------------------------------------------------------
        // CASE 1:
        // Frontend sends users.id
        //
        // Example:
        // users.id = 2
        // employees.user_id = 2
        // employees.id = 6
        // ------------------------------------------------------

        if (!isNaN(employee_id)) {

            const [rows] = await db.query(
                `
                SELECT
                    e.id,
                    e.user_id,
                    e.name,
                    u.employee_id AS employee_code
                FROM employees e
                INNER JOIN users u
                    ON e.user_id = u.id
                WHERE e.user_id = ?
                LIMIT 1
                `,
                [employee_id]
            );

            if (rows.length > 0) {
                employee = rows[0];
            }
        }


        // ------------------------------------------------------
        // CASE 2:
        // Frontend sends EMP001 / EMP002 / EMP003
        //
        // employee_id is stored in users table
        // ------------------------------------------------------

        if (!employee) {

            const [rows] = await db.query(
                `
                SELECT
                    e.id,
                    e.user_id,
                    e.name,
                    u.employee_id AS employee_code
                FROM employees e
                INNER JOIN users u
                    ON e.user_id = u.id
                WHERE u.employee_id = ?
                LIMIT 1
                `,
                [employee_id]
            );

            if (rows.length > 0) {
                employee = rows[0];
            }
        }


        // ------------------------------------------------------
        // EMPLOYEE NOT FOUND
        // ------------------------------------------------------

        if (!employee) {

            return res.status(404).json({
                success: false,
                message: "Employee record not found"
            });
        }


        // ------------------------------------------------------
        // CHECK DATES
        // ------------------------------------------------------

        if (
            new Date(end_date) <
            new Date(start_date)
        ) {

            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date"
            });
        }


        // ------------------------------------------------------
        // INSERT LEAVE
        //
        // IMPORTANT:
        // leaves.employee_id = employees.id
        // ------------------------------------------------------

        const [result] = await db.query(
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
                employee.id,
                leave_type,
                start_date,
                end_date,
                remarks || null
            ]
        );


        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        return res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            leaveId: result.insertId
        });

    } catch (error) {

        console.error(
            "APPLY LEAVE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while submitting leave",
            error: error.message
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getMyLeaves,
    applyLeave
};