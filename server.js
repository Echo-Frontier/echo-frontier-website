require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [
            "http://127.0.0.1:5500", 
            "http://localhost:5500",
            "http://localhost:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to Frontier Database"))
    .catch(err => console.error("Database connection error:", err));

// 2. USER SCHEMA
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, default: null }, 
    role: { type: String, default: 'member' }
});
const User = mongoose.model('User', userSchema);

// 3. AUTHENTICATION & FILE LOGIC
io.on('connection', (socket) => {
    console.log(`\n[SYSTEM] New Connection: ${socket.id}`);

    // Heartbeat check for "Emitting..." issues
    socket.on('ping-test', () => {
        console.log(`[DEBUG] Ping received from ${socket.id}`);
        socket.emit('pong-test', "Server is active and listening.");
    });

    // --- Login Logic ---
    socket.on('attempt-login', async (data) => {
        const { username, password } = data;
        try {
            const user = await User.findOne({ username });
            if (!user) return socket.emit('login-error', 'Username not found.');

            if (user.password === null) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
                
                const token = jwt.sign(
                    { id: user._id, username: user.username, role: user.role }, 
                    process.env.JWT_SECRET, 
                    { expiresIn: '24h' }
                );
                return socket.emit('login-success', { token, message: 'Account Activated!' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return socket.emit('login-error', 'Invalid Credentials.');

            const token = jwt.sign(
                { id: user._id, username: user.username, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            socket.emit('login-success', { token, message: 'Welcome back.' });
        } catch (err) {
            socket.emit('login-error', 'Server authentication error.');
        }
    });

    // --- Progress Logic (The Fix) ---
    socket.on('update-progress-file', (updatedProgress) => {
        console.log(`[ACTION] Received progress update from ${socket.id}`);
        
        const dataDir = path.join(__dirname, 'public', 'data');
        const filePath = path.join(dataDir, 'progress.json');

        // Ensure directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFile(filePath, JSON.stringify(updatedProgress, null, 2), (err) => {
            if (err) {
                console.error("[ERROR] Failed to write progress.json:", err);
                socket.emit('save-error', 'FileSystem write failed.');
            } else {
                console.log("[SUCCESS] progress.json updated.");
                // Critical: Emit back to trigger the frontend closeModal()
                socket.emit('save-success'); 
                // Sync all other admin tabs
                socket.broadcast.emit('save-success');
            }
        });
    });

    // --- Team & Projects Logic ---
    socket.on('update-team-file', (data) => {
        const filePath = path.join(__dirname, 'public', 'data', 'team.json');
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (!err) {
                console.log("[SUCCESS] team.json updated.");
                socket.emit('save-success');
            }
        });
    });

    socket.on('update-projects-file', (data) => {
        const filePath = path.join(__dirname, 'public', 'data', 'projects.json');
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (!err) {
                console.log("[SUCCESS] projects.json updated.");
                socket.emit('save-success');
            }
        });
    });

    // --- Availability Logic ---
    socket.on('save-availability', (data) => {
        const filePath = path.join(__dirname, 'public', 'data', 'availability.json');
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (!err) {
                console.log("[SUCCESS] availability.json updated.");
                socket.emit('save-success');
                socket.broadcast.emit('load-availability', data);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log(`[SYSTEM] User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(` Echo Frontier Backend active on port ${PORT}`);
    console.log(` Time: ${new Date().toLocaleTimeString()}`);
    console.log(`==========================================\n`);
});