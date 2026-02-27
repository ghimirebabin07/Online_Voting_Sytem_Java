
// INITIAL SETUP (RUN ONLY ONCE)


// Initialize users if not exists
if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([]));
}

// Initialize candidates if not exists
if (!localStorage.getItem("candidates")) {

    const candidates = [
        {
            id: 1,
            name: "Balen Shah",
            party: "Rastriya Swatantra Party",
            image: "../Images/Balen_.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0
        },
        {
            id: 2,
            name: "Rabi Lamichhane",
            party: "Rastriya Swatantra Party",
            image: "../Images/Rabi.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0
        },
        {
            id: 3,
            name: "Sobita Gautam",
            party: "Rastriya Swatantra Party",
            image: "../Images/Sobita.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0
        },
        {
            id : 4,
            name: "KP Sharma Oli",
            party: "UML",
            image: "../Images/Kp.jpg",
            symbol: "../Images/UML.jpg",
            votes: 0
        }
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));
}



// REGISTER FUNCTION


function registerUser() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users"));

    const userExists = users.find(user => user.username === username);

    if (userExists) {
        alert("User already exists!");
        return;
    }

    users.push({
        username: username,
        password: password,
        role: "user",
        voted: false
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful!");
    window.location.href = "login.html";
}



// LOGIN FUNCTION


function loginUser() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users"));

    const validUser = users.find(
        user => user.username === username && user.password === password
    );

    if (!validUser) {
        alert("Invalid credentials!");
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(validUser));

    if (validUser.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "index.html";
    }
}



// LOAD CANDIDATES (VOTE PAGE)


function loadCandidates() {

    const container = document.getElementById("candidateContainer");
    if (!container) return;

    const candidates = JSON.parse(localStorage.getItem("candidates"));

    container.innerHTML = "";

    candidates.forEach(candidate => {

        container.innerHTML += `
            <div class="candidate-row">

                <img class="party-symbol" src="${candidate.symbol}" alt="symbol">

                <div class="candidate-info">
                    <img class="candidate-photo" src="${candidate.image}" alt="${candidate.name}">
                    
                    <div class="candidate-details">
                        <h3>${candidate.name}</h3>
                        <p>${candidate.party}</p>
                    </div>
                </div>

                <button class="vote-btn" onclick="vote(${candidate.id})">
                    Vote
                </button>

            </div>
        `;
    });
}



// VOTE FUNCTION


function vote(id) {

    let loggedUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (loggedUser.voted) {
        alert("You have already voted!");
        return;
    }

    let candidates = JSON.parse(localStorage.getItem("candidates"));

    const candidate = candidates.find(c => c.id === id);

    if (!candidate) {
        alert("Candidate not found!");
        return;
    }

    candidate.votes += 1;

    localStorage.setItem("candidates", JSON.stringify(candidates));

    // Update user voted status
    let users = JSON.parse(localStorage.getItem("users"));
    const userIndex = users.findIndex(u => u.username === loggedUser.username);

    users[userIndex].voted = true;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

    alert("Vote Successful!");

    window.location.href = "result.html";
}



// LOAD RESULTS (RESULT PAGE)


function loadResults() {

    const candidates = JSON.parse(localStorage.getItem("candidates")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const totalRegisteredVoters = users.length;

    let totalVotesCast = 0;

    let candidateHTML = "<table><tr><th>Name</th><th>Party</th><th>Votes</th><th>Percentage</th></tr>";

    candidates.forEach(c => totalVotesCast += c.votes);

    candidates.forEach(c => {

        let percent = totalVotesCast > 0
            ? ((c.votes / totalVotesCast) * 100).toFixed(2)
            : 0;

        candidateHTML += `
            <tr>
                <td>${c.name}</td>
                <td>${c.party}</td>
                <td>${c.votes}</td>
                <td>
                    ${percent}%
                    <div class="progress-bar" style="width:${percent}%"></div>
                </td>
            </tr>
        `;
    });

    candidateHTML += "</table>";

    if (document.getElementById("candidateResults"))
        document.getElementById("candidateResults").innerHTML = candidateHTML;

    // Party Wise Totals
    let partyTotals = {};

    candidates.forEach(c => {
        if (!partyTotals[c.party]) {
            partyTotals[c.party] = 0;
        }
        partyTotals[c.party] += c.votes;
    });

    let partyHTML = "<table><tr><th>Party</th><th>Total Votes</th></tr>";

    for (let party in partyTotals) {
        partyHTML += `<tr><td>${party}</td><td>${partyTotals[party]}</td></tr>`;
    }

    partyHTML += "</table>";

    if (document.getElementById("partyResults"))
        document.getElementById("partyResults").innerHTML = partyHTML;

    // Voter Statistics
    let notVoted = totalRegisteredVoters - totalVotesCast;

    let turnout = totalRegisteredVoters > 0
        ? ((totalVotesCast / totalRegisteredVoters) * 100).toFixed(2)
        : 0;

    let statsHTML = `
        <table>
            <tr><th>Total Registered Voters</th><td>${totalRegisteredVoters}</td></tr>
            <tr><th>Total Votes Cast</th><td>${totalVotesCast}</td></tr>
            <tr><th>Not Voted</th><td>${notVoted}</td></tr>
            <tr><th>Turnout Percentage</th><td>${turnout}%</td></tr>
        </table>
    `;

    if (document.getElementById("voterStats"))
        document.getElementById("voterStats").innerHTML = statsHTML;

    // Winner Section
    if (candidates.length > 0) {
        let winner = candidates.reduce((prev, current) =>
            (prev.votes > current.votes) ? prev : current
        );

        if (document.getElementById("winnerSection"))
            document.getElementById("winnerSection").innerHTML =
                `🏆 Winner: ${winner.name} (${winner.party}) with ${winner.votes} votes`;
    }
}



// NAVIGATION


function goBackAdmin() {
    window.location.href = "admin_dashboard.html";
}



// PAGE AUTO DETECTION

window.onload = function () {

    if (document.getElementById("candidateContainer")) {
        loadCandidates();
    }

    if (document.getElementById("candidateResults")) {
        loadResults();
    }

};