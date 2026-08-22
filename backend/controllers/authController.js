const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==================================================
// REGISTER
// ==================================================

const register = async (req, res) => {

    let connection;

    try {

        const {
            employee_id,
            name,
            email,
            password,
            phone,
            address,
            department,
            designation,
            joining_date,
            role
        } = req.body;


        // ==================================================
        // CHECK REQUIRED FIELDS
        // ==================================================

        if (
            !employee_id ||
            !name ||
            !email ||
            !password ||
            !phone ||
            !address ||
            !department ||
            !designation ||
            !joining_date ||
            !role
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });

        }


        // ==================================================
        // CHECK ROLE
        // ==================================================

        if (
            role !== "EMPLOYEE" &&
            role !== "ADMIN"
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid account type"
            });

        }


        // ==================================================
        // GET DATABASE CONNECTION
        // ==================================================

        connection = await db.getConnection();

        await connection.beginTransaction();


        // ==================================================
        // CHECK ID
        // ==================================================

        const [existingId] = await connection.query(
            `SELECT id
             FROM users
             WHERE employee_id = ?
             LIMIT 1`,
            [employee_id]
        );


        if (existingId.length > 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "ID already registered"
            });

        }


        // ==================================================
        // CHECK EMAIL
        // ==================================================

        const [existingEmail] = await connection.query(
            `SELECT id
             FROM users
             WHERE email = ?
             LIMIT 1`,
            [email]
        );


        if (existingEmail.length > 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ==================================================
        // INSERT INTO USERS
        // ==================================================

        const [userResult] = await connection.query(
            `INSERT INTO users
            (
                employee_id,
                email,
                password,
                role,
                email_verified
            )
            VALUES (?, ?, ?, ?, 1)`,
            [
                employee_id,
                email,
                hashedPassword,
                role
            ]
        );


        const userId = userResult.insertId;


        // ==================================================
        // INSERT INTO EMPLOYEES
        // ==================================================

        await connection.query(
            `INSERT INTO employees
            (
                user_id,
                name,
                phone,
                address,
                department,
                designation,
                joining_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                name,
                phone,
                address,
                department,
                designation,
                joining_date
            ]
        );


        // ==================================================
        // SAVE
        // ==================================================

        await connection.commit();


        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                role === "ADMIN"
                    ? "Admin account created successfully"
                    : "Employee account created successfully",

            user: {

                id: userId,

                employee_id: employee_id,

                email: email,

                role: role

            }

        });


    } catch (error) {

        // ==================================================
        // ROLLBACK
        // ==================================================

        if (connection) {

            try {

                await connection.rollback();

            } catch (rollbackError) {

                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );

            }

        }


        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Server error during registration",

            error: error.message

        });


    } finally {

        if (connection) {
            connection.release();
        }

    }

};


// ==================================================
// LOGIN
// ==================================================

const login = async (req, res) => {

    try {

        const {
            employee_id,
            password
        } = req.body;


        // ==================================================
        // CHECK INPUT
        // ==================================================

        if (!employee_id || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "ID and password are required"

            });

        }


        // ==================================================
        // FIND USER
        // ==================================================

        const [users] = await db.query(
            `SELECT
                id,
                employee_id,
                email,
                password,
                role,
                email_verified
             FROM users
             WHERE employee_id = ?
             LIMIT 1`,
            [employee_id]
        );


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid ID or password"

            });

        }


        const user = users[0];


        // ==================================================
        // CHECK PASSWORD
        // ==================================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid ID or password"

            });

        }


        // ==================================================
        // CREATE TOKEN
        // ==================================================

        const token = jwt.sign(

            {
                id: user.id,

                employee_id:
                    user.employee_id,

                role:
                    user.role
            },

            process.env.JWT_SECRET ||
            "dayflow_secret_key",

            {
                expiresIn: "1d"
            }

        );


        // ==================================================
        // LOGIN SUCCESS
        // ==================================================

        return res.json({

            success: true,

            message: "Login successful",

            token: token,

            user: {

                id: user.id,

                employee_id:
                    user.employee_id,

                email:
                    user.email,

                role:
                    user.role

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login",

            error:
                error.message

        });

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = {
    register,
    login
};