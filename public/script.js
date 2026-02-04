const socket = io("http://localhost:3000"); // Local for now

function toggleLogin() {
    // We will build the login modal/dashboard later
    alert("Member dashboard login system coming soon!");
}

socket.on('connect', () => {
    console.log("Echo Frontier systems online.");
});