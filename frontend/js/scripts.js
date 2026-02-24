
// INITIAL DATA (RUN ONLY ONCE)
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
        }
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));
}






// REGISTER


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





// LOGIN

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
    candidate.votes += 1;

    localStorage.setItem("candidates", JSON.stringify(candidates));

    // update user voted status
    let users = JSON.parse(localStorage.getItem("users"));
    const userIndex = users.findIndex(u => u.username === loggedUser.username);

    users[userIndex].voted = true;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", JSON.stringify(users[userIndex]));

    alert("Vote Successful!");

    window.location.href = "result.html";
}






// LOAD RESULTS


function loadResults() {
    const container = document.getElementById("resultContainer");

    if (!container) return;

    const candidates = JSON.parse(localStorage.getItem("candidates"));

    container.innerHTML = "";

    candidates.forEach(candidate => {
        container.innerHTML += `
            <div class="result-card">
                <h3>${candidate.name}</h3>
                <p>Votes: ${candidate.votes}</p>
            </div>
        `;
    });
}





// AUTO LOAD FUNCTIONS

document.addEventListener("DOMContentLoaded", function () {
    loadCandidates();
    loadResults();
});