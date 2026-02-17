// Login Form Validation (optional)
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(e) {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if(username === "" || password === "") {
            alert("Please enter both username and password.");
            e.preventDefault(); // prevent form submission
        }
    });
});
