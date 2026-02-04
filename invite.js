require('dotenv').config();
const mongoose = require('mongoose');

// Define the User Schema (same as server.js)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    role: { type: String, default: 'member' }
});
const User = mongoose.model('User', userSchema);

async function addUsers() {
    // 1. Connect to your DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Frontier DB for inviting...");

    // 2. LIST YOUR NEW MEMBERS HERE
    const usernamesToInvite = ["Speedix08", "GD_Abomination", "SimLeek", "Flame", "Lele"];

    for (let name of usernamesToInvite) {
        try {
            const exists = await User.findOne({ username: name });
            if (!exists) {
                await User.create({ username: name, password: null });
                console.log(`✅ Invited: ${name}`);
            } else {
                console.log(`ℹ️  Skipped: ${name} (Already in database)`);
            }
        } catch (err) {
            console.error(`❌ Error inviting ${name}:`, err.message);
        }
    }

    console.log("\nDone! Users can now set their passwords on the login page.");
    process.exit();
}

addUsers();