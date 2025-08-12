const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Checking if the username and password are provided
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Read users from JSON file
        const usersPath = path.join(__dirname, '../../users.json');
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

        // Find user by username
        const user = usersData.users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generating the JWT token
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email
        };

        // You should set this in your environment variables
        const JWT_SECRET = process.env.JWT_SECRET || 'pEGGo9RxVryWiWVGahB2zEPF1yJcpuiRtDXO6xZaXEfAmcFkTUrpkUOVPE5KTJL8VBYcCBxInHmYMpf+QM4P7g==';
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        // Return success response with token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    fullName: user.fullName
                },
                token: token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    login
};