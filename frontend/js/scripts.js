document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {

            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value.trim();

            if (phone === "" || password === "") {
                alert("Please enter both phone and password.");
                e.preventDefault();
            }
        });
    }
    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {

            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                e.preventDefault();
            }
        });
    }

});
function addCandidate() {
    alert("Add Candidate feature coming soon!");
}

function viewResults() {
    alert("View Results feature coming soon!");
}

function logout() {
    window.location.href = "index.html";
}
// Admin Login
const adminForm = document.getElementById("adminLoginForm");

if (adminForm) {
    adminForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("adminUsername").value;
        const password = document.getElementById("adminPassword").value;

        // Simple hardcoded admin credentials
        if (username === "admin" && password === "admin12") {
            alert("Admin Login Successful!");
            window.location.href = "admin.html";
        } else {
            alert("Invalid Admin Credentials!");
        }
    });
}
