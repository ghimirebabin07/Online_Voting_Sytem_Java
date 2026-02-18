
document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function(e) {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if(username === "" || password === "") {
            alert("Please enter both username and password.");
            e.preventDefault();
        }
    });
});
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirmPassword");

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let oldError = document.querySelector(".error-message");
        if (oldError) {
            oldError.remove();
        }
        confirmPasswordInput.style.border = "1px solid #aaa";

        if (password !== confirmPassword) {
            event.preventDefault();
            confirmPasswordInput.style.border = "1px solid red";
            const error = document.createElement("div");
            error.className = "error-message";
            error.textContent = "Passwords do not match!";

            confirmPasswordInput.parentElement.appendChild(error);
        }
    });
}
