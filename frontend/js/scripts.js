
// INITIAL SETUP (RUN ONLY ONCE)


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
            description: "Strong Engineering Background focused on development, transparency and youth empowerment and the future PM."
        },
        {
            id: 2,
            name: "Rabi Lamichhane",
            party: "Rastriya Swatantra Party",
            image: "../Images/Rabi.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0,
            description: "Strong leadership and advocates anti-corruption reforms and governance transparency."
        },
        {
            id: 3,
            name: "Sobita Gautam",
            party: "Rastriya Swatantra Party",
            image: "../Images/Sobita.jpg",
            symbol: "../Images/RSP.jpg",
            votes: 0,
            description: "Well educated and focused on women empowerment and policy reform with a commitment to social justice."
        },
        {
            id: 4,
            name: "KP Sharma Oli",
            party: "UML",
            image: "../Images/Kp.jpg",
            symbol: "../Images/UML.jpg",
            votes: 0,
            description: "Senior political leader focused on infrastructure and national development."
        },
        {
            id: 5,
            name: "Pushpa Kamal Dahal",
            party: "Maoist Center",
            image: "../Images/Puspa.jpg",
            symbol: "../Images/Maoist.jpg",
            votes: 0,
            description: "Promotes social justice and democratic socialist reforms and build it ."
        },
        {
            id: 6,
            name: "Sher Bahadur Deuba",
            party: "Congress",
            image: "../Images/Sher.jpg",
            symbol: "../Images/Congress.jpg",
            votes: 0,
            description: "Experienced over 35 yrs  politician focused on national development and governance reforms."
        }
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));
}



// REGISTER


function registerUser() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users"));

    if (users.find(user => user.username === username)) {
        alert("User already exists!");
        return;
    }

    users.push({
        username,
        password,
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
        window.location.href = "vote.html";
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

                <div class="btn-group">
                    <button class="vote-btn" onclick="vote(${candidate.id})">
                        Vote
                    </button>

                    <button class="details-btn" onclick="viewDetails(${candidate.id})">
                        Details
                    </button>
                </div>

            </div>
        `;
    });
}



// VIEW DETAILS


function viewDetails(id) {
    localStorage.setItem("selectedCandidateId", id);
    window.location.href = "candidate-details.html";
}


// VOTE


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

    const candidates = JSON.parse(localStorage.getItem("candidates")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    let totalVotes = 0;
    candidates.forEach(c => totalVotes += c.votes);

    let html = "<table><tr><th>Name</th><th>Party</th><th>Votes</th><th>%</th></tr>";

    candidates.forEach(c => {

        let percent = totalVotes > 0
            ? ((c.votes / totalVotes) * 100).toFixed(2)
            : 0;

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

    if (document.getElementById("candidateResults"))
        document.getElementById("candidateResults").innerHTML = html;
}
// auto page detection 

window.onload = function () {

    if (document.getElementById("candidateContainer")) {
        loadCandidates();
    }

    if (document.getElementById("candidateResults")) {
        loadResults();
    }
};
function goVote(){
window.location.href = "vote.html";
}

function viewResults(){
window.location.href = "result.html";
}

function viewCandidates(){
window.location.href = "candidate-details.html";
}

function logout(){

if(confirm("Are you sure you want to logout?")){
window.location.href = "login.html";
}

}