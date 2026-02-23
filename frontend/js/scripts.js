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
// ===============================
// DEFAULT CANDIDATE DATA (ONLY RUNS FIRST TIME)
// ===============================

if (!localStorage.getItem("candidates")) {

    let defaultCandidates = [
        {
            name: "Balen Shah",
            party: "Independent",
            image: "../Images/Balen_.jpg",
            votes: 0
        },
        {
            name: "Sita Karki",
            party: "National Party",
            image: "../Images/Balen.jpg",
            votes: 0
        }
    ];

    localStorage.setItem("candidates", JSON.stringify(defaultCandidates));
}



// ===============================
// LOAD CANDIDATES ON VOTE PAGE
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("candidateContainer");
    if (!container) return;

    let candidates = JSON.parse(localStorage.getItem("candidates")) || [];

    // Check if already voted
    if (localStorage.getItem("hasVoted") === "true") {
        container.innerHTML = "<h3>You have already voted!</h3>";
        return;
    }

    candidates.forEach((candidate, index) => {

        let card = document.createElement("div");
        card.classList.add("candidate-card");

        card.innerHTML = `
            <img src="${candidate.image}" alt="Candidate Image">
            <h3>${candidate.name}</h3>
            <p>Party: ${candidate.party}</p>
            <button class="vote-btn" onclick="castVote(${index})">
                Vote
            </button>
        `;

        container.appendChild(card);
    });

});



// ===============================
// CAST VOTE FUNCTION
// ===============================

function castVote(index) {

    let candidates = JSON.parse(localStorage.getItem("candidates")) || [];

    candidates[index].votes += 1;

    localStorage.setItem("candidates", JSON.stringify(candidates));
    localStorage.setItem("hasVoted", "true");

    alert("Vote cast successfully!");

    window.location.href = "result.html";
}



// ===============================
// LOGOUT FUNCTION
// ===============================

function logout() {
    localStorage.removeItem("hasVoted");
    window.location.href = "login.html";
}