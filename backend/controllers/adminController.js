const db = require("../config/db");


// ======================================================
// GET ALL ADMINS
// ======================================================

const getAdmins = async (req, res) => {

    try {

        const [admins] = await db.query(`
            SELECT
                u.id,
                u.employee_id,
                u.email,
                u.role,
                e.name,
                e.phone,
                e.address,
                e.department,
                e.designation,
                e.joining_date

            FROM users u

            LEFT JOIN employees e
                ON e.user_id = u.id

            WHERE u.role = 'ADMIN'

            ORDER BY u.id ASC
        `);


        res.json({
            success: true,
            admins
        });

    } catch (error) {

        console.error(
            "GET ADMINS ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while loading admins"
        });
    }
};


// ======================================================
// GET ALL EMPLOYEES
// ======================================================

const getEmployees = async (req, res) => {

    try {

        const [employees] = await db.query(`
            SELECT
                u.id,
                u.employee_id,
                u.email,
                u.role,
                e.id AS employee_table_id,
                e.name,
                e.phone,
                e.address,
                e.department,
                e.designation,
                e.joining_date

            FROM users u

            INNER JOIN employees e
                ON e.user_id = u.id

            WHERE u.role = 'EMPLOYEE'

            ORDER BY e.name ASC
        `);


        res.json({
            success: true,
            employees
        });

    } catch (error) {

        console.error(
            "GET EMPLOYEES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while loading employees"
        });
    }
};


// ======================================================
// GET ALL ATTENDANCE
// ======================================================

const getAttendance = async (req, res) => {

    try {

        const [attendance] = await db.query(`
            SELECT
                a.id,

                e.id AS employee_id,

                u.employee_id AS employee_code,

                e.name,

                a.date,
                a.check_in,
                a.check_out,
                a.status

            FROM attendance a

            INNER JOIN employees e
                ON e.id = a.employee_id

            INNER JOIN users u
                ON u.id = e.user_id

            ORDER BY a.date DESC, a.id DESC
        `);


        res.json({
            success: true,
            attendance
        });

    } catch (error) {

        console.error(
            "GET ATTENDANCE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while loading attendance"
        });
    }
};


// ======================================================
// GET ALL LEAVE REQUESTS
// ======================================================

const getLeaves = async (req, res) => {

    try {

        const [leaves] = await db.query(`
            SELECT
                l.id,

                e.id AS employee_id,

                u.employee_id AS employee_code,

                e.name,

                l.leave_type,
                l.start_date,
                l.end_date,
                l.remarks,
                l.status,
                l.admin_comment

            FROM leaves l

            INNER JOIN employees e
                ON e.id = l.employee_id

            INNER JOIN users u
                ON u.id = e.user_id

            WHERE u.role = 'EMPLOYEE'

            ORDER BY l.id DESC
        `);


        res.json({
            success: true,
            leaves
        });

    } catch (error) {

        console.error(
            "GET LEAVES ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while loading leaves"
        });
    }
};


// ======================================================
// APPROVE LEAVE
// ======================================================

const approveLeave = async (req, res) => {

    try {

        const { id } = req.params;


        const [result] = await db.query(
            `
            UPDATE leaves

            SET
                status = 'Approved',
                admin_comment = 'Leave approved'

            WHERE id = ?
            `,
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }


        res.json({
            success: true,
            message: "Leave approved successfully"
        });

    } catch (error) {

        console.error(
            "APPROVE LEAVE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while approving leave"
        });
    }
};


// ======================================================
// REJECT LEAVE
// ======================================================

const rejectLeave = async (req, res) => {

    try {

        const { id } = req.params;


        const [result] = await db.query(
            `
            UPDATE leaves

            SET
                status = 'Rejected',
                admin_comment = 'Leave rejected'

            WHERE id = ?
            `,
            [id]
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }


        res.json({
            success: true,
            message: "Leave rejected successfully"
        });

    } catch (error) {

        console.error(
            "REJECT LEAVE ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while rejecting leave"
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
    getAdmins,
    getEmployees,
    getAttendance,
    getLeaves,
    approveLeave,
    rejectLeave
};