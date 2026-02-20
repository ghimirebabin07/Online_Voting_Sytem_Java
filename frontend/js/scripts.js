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
