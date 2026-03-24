// =============================
// INITIAL SETUP (RUN ONCE)
// =============================

if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
}

if (!localStorage.getItem("candidates")) {

    const candidates = [
        {
            id: 1,
            name: "Balen Shah",
            party: "Rastriya Swatantra Party",
            image: "../Images/Balen_.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0,
            description: "Strong Engineering Background focused on development and transparency."
        },
        {
            id: 2,
            name: "Rabi Lamichhane",
            party: "Rastriya Swatantra Party",
            image: "../Images/Rabi.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0,
            description: "Advocates anti-corruption reforms and governance transparency."
        },
        {
            id: 3,
            name: "Sobita Gautam",
            party: "Rastriya Swatantra Party",
            image: "../Images/Sobita.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0,
            description: "Focused on women empowerment and policy reform."
        },
        {
            id: 4,
            name: "KP Sharma Oli",
            party: "UML",
            image: "../Images/Kp.jpg",
            symbol: "../Images/UML.jpg",
            votes: 0,
            description: "Focused on infrastructure and national development."
        },
        {
            id: 5,
            name: "Pushpa Kamal Dahal",
            party: "Maoist Center",
            image: "../Images/Puspa.jpg",
            symbol: "../Images/Maoist.jpg",
            votes: 0,
            description: "Promotes social justice and democratic reforms."
        },
        {
            id: 6,
            name: "Sher Bahadur Deuba",
            party: "Congress",
            image: "../Images/Sher.jpg",
            symbol: "../Images/Congress.jpg",
            votes: 0,
            description: "Experienced politician focused on governance reforms."
        }
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));
}

// =============================
// REGISTER
// =============================

function registerUser() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Please fill all fields!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === username)) {
        alert("User already exists!");
        return;
    }

    users.push({
        username,
        password,
        voted: false
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful!");
    window.location.href = "login.html";
}

// =============================
// LOGIN
// =============================

function loginUser() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.length === 0) {
        alert("No users found! Please register first.");
        return;
    }

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        alert("Invalid username or password!");
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));

    alert("Login Successful!");


    setTimeout(() => {
        window.location.href = "dashboard.html";
    }, 300);
}

// LOAD CANDIDATES ON VOTE PAGE 

function loadCandidates() {

    const container = document.getElementById("candidateContainer");
    if (!container) return;

    const candidates = JSON.parse(localStorage.getItem("candidates"));

    container.innerHTML = "";

    candidates.forEach(candidate => {

        container.innerHTML += `
        <div class="candidate-row">

            <img class="party-symbol" src="${candidate.symbol}">

            <div class="candidate-info">
                <img class="candidate-photo" src="${candidate.image}">
                <div>
                    <h3>${candidate.name}</h3>
                    <p>${candidate.party}</p>
                </div>
            </div>

            <div class="btn-group">
                <button class="vote-btn" onclick="vote(${candidate.id})">Vote</button>
                <button class="details-btn" onclick="viewDetails(${candidate.id})">Details</button>
            </div>

        </div>
        `;
    });
}

// =============================
// DETAILS PAGE
// =============================

function viewDetails(id) {
    localStorage.setItem("selectedCandidateId", id);
    window.location.href = "candidate-details.html";
}

function loadCandidateDetails() {

    const id = localStorage.getItem("selectedCandidateId");
    if (!id) return;

    const candidates = JSON.parse(localStorage.getItem("candidates"));

    const candidate = candidates.find(c => c.id == id);

    if (!candidate) return;

    document.getElementById("detailName").innerText = candidate.name;
    document.getElementById("detailParty").innerText = candidate.party;
    document.getElementById("detailDesc").innerText = candidate.description;

    document.getElementById("detailImage").src = candidate.image;
    document.getElementById("detailSymbol").src = candidate.symbol;
}

// =============================
// VOTE SYSTEM
// =============================

function vote(id) {

    let user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (user.voted) {
        alert("You already voted!");
        return;
    }

    let candidates = JSON.parse(localStorage.getItem("candidates"));

    const index = candidates.findIndex(c => c.id === id);

    if (index === -1) return;

    candidates[index].votes += 1;

    localStorage.setItem("candidates", JSON.stringify(candidates));

    let users = JSON.parse(localStorage.getItem("users"));

    const userIndex = users.findIndex(u => u.username === user.username);

    users[userIndex].voted = true;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

    alert("Vote Successful!");

    window.location.href = "result.html";
}

// =============================
// RESULTS
// =============================

function loadResults() {

    const container = document.getElementById("candidateResults");
    if (!container) return;

    const candidates = JSON.parse(localStorage.getItem("candidates"));

    let total = candidates.reduce((sum, c) => sum + c.votes, 0);

    let html = `
    <table>
    <tr>
        <th>Name</th>
        <th>Party</th>
        <th>Votes</th>
        <th>%</th>
    </tr>
    `;

    candidates.forEach(c => {

        let percent = total ? ((c.votes / total) * 100).toFixed(2) : 0;

        html += `
        <tr>
            <td>${c.name}</td>
            <td>${c.party}</td>
            <td>${c.votes}</td>
            <td>${percent}%</td>
        </tr>
        `;
    });

    html += "</table>";

    container.innerHTML = html;
}

// =============================
// PROFILE
// =============================

function loadProfile() {

    const user = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("userName").innerText = user.username;

    document.getElementById("voteStatus").innerText =
        user.voted ? "Completed ✅" : "Not Voted ❌";
}

// =============================
// NAVIGATION
// =============================

function goVote() {
    window.location.href = "vote.html";
}

function viewResults() {
    window.location.href = "result.html";
}

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

// =============================
// DARK MODE
// =============================

function toggleTheme() {
    document.body.classList.toggle("dark");

    let btn = document.getElementById("themeBtn");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        if (btn) btn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        if (btn) btn.innerText = "🌙";
    }
}

// =============================
// AUTO LOAD
// =============================

window.onload = function () {

    // DARK MODE LOAD
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    loadCandidates();
    loadResults();
    loadProfile();
    loadCandidateDetails();
};