const API_BASE_URL = window.VOTING_API_BASE_URL || "";
const TOKEN_KEY = "ovs_auth_token";
const USER_KEY = "ovs_user";

const API_ENDPOINTS = {
 register: "/online-voting-backend/api/auth/register",
  login: "/online-voting-backend/api/auth/login",
  adminLogin: "/online-voting-backend/api/auth/admin/login",
  logout: "/online-voting-backend/api/auth/logout",
  me: "/online-voting-backend/api/users/me",
  candidates: "/online-voting-backend/api/candidates",
  vote: "/online-voting-backend/api/votes",
  results: "/online-voting-backend/api/results",
  adminStats: "/online-voting-backend/api/admin/stats",
  adminCandidates: "/online-voting-backend/api/admin/candidates",
};

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setSession(data) {
  if (data?.token) {
    sessionStorage.setItem(TOKEN_KEY, data.token);
  }

  if (data?.user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
}

function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value ?? "";
}

function showAlert(message, type = "info") {
  const alertBox = $("#pageAlert");
  if (!alertBox) {
    window.alert(message);
    return;
  }

  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.hidden = false;
}

function clearAlert() {
  const alertBox = $("#pageAlert");
  if (alertBox) {
    alertBox.hidden = true;
    alertBox.textContent = "";
  }
}

function setButtonLoading(button, isLoading, label = "Please wait") {
  if (!button) return;
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = label;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function serializeForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function validateForm(form) {
  if (form.checkValidity()) return true;
  form.reportValidity();
  return false;
}

function requireAuth(roles = []) {
  const token = getToken();
  const user = getStoredUser();

  if (!token && !user) {
    window.location.href = "login.html";
    return null;
  }

  if (roles.length && !roles.includes(user?.role)) {
    window.location.href = "vote.html";
    return null;
  }

  return user || {};
}

function normalizeCandidate(candidate) {
  return {
    id: candidate.id ?? candidate.candidateId,
    name: candidate.name ?? candidate.fullName ?? "Unnamed Candidate",
    party: candidate.party ?? candidate.partyName ?? "Independent",
    imageUrl: candidate.imageUrl ?? candidate.image ?? "../Images/Profile.jpg",
    symbolUrl: candidate.symbolUrl ?? candidate.symbol ?? "../Images/Profile.jpg",
    description: candidate.description ?? candidate.manifesto ?? "Candidate information will be updated by the election administrator.",
    votes: candidate.votes ?? candidate.totalVotes ?? 0,
  };
}

function normalizeResult(result) {
  return {
    id: result.id ?? result.candidateId,
    name: result.name ?? result.candidateName ?? "Unnamed Candidate",
    party: result.party ?? result.partyName ?? "Independent",
    votes: Number(result.votes ?? result.totalVotes ?? 0),
    percent: Number(result.percent ?? result.percentage ?? 0),
    imageUrl: result.imageUrl ?? result.image ?? "../Images/Profile.jpg",
    symbolUrl: result.symbolUrl ?? result.symbol ?? "../Images/Profile.jpg",
  };
}

async function getCandidates() {
  const data = await apiRequest(API_ENDPOINTS.candidates);
  return (data?.candidates || data || []).map(normalizeCandidate);
}

async function initRegisterPage() {
  const form = $("#registerForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();

    if (!validateForm(form)) return;

    const payload = serializeForm(form);
    if (payload.password !== payload.confirmPassword) {
      showAlert("Password and confirm password must match.", "error");
      return;
    }

    const submit = form.querySelector("button[type='submit']");
    setButtonLoading(submit, true, "Creating account");

    try {
      await apiRequest(API_ENDPOINTS.register, {
        method: "POST",
        body: JSON.stringify({
          fullName: payload.fullName,
          phone: payload.phone,
          email: payload.email || null,
          voterId: payload.voterId,
          password: payload.password,
        }),
      });

      showAlert("Registration successful. You can login now.", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 800);
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  });
}

async function initLoginPage() {
  const form = $("#loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();

    if (!validateForm(form)) return;

    const payload = serializeForm(form);
    const submit = form.querySelector("button[type='submit']");
    setButtonLoading(submit, true, "Signing in");

    try {
      const data = await apiRequest(API_ENDPOINTS.login, {
        method: "POST",
        body: JSON.stringify({
          phone: payload.phone,
          password: payload.password,
        }),
      });

      setSession({
        ...data,
        user: data?.user || { phone: payload.phone, role: "VOTER" },
      });
      window.location.href = "vote.html";
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  });
}

async function initAdminLoginPage() {
  const form = $("#adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();

    if (!validateForm(form)) return;

    const payload = serializeForm(form);
    const submit = form.querySelector("button[type='submit']");
    setButtonLoading(submit, true, "Signing in");

    try {
      const data = await apiRequest(API_ENDPOINTS.adminLogin, {
        method: "POST",
        body: JSON.stringify({
          username: payload.username,
          password: payload.password,
        }),
      });

      setSession({
        ...data,
        user: data?.user || { fullName: payload.username, role: "ADMIN" },
      });
      window.location.href = "admin.html";
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  });
}

async function initVotePage() {
  const container = $("#candidateContainer");
  if (!container) return;

  requireAuth();
  container.innerHTML = `<div class="empty-state">Loading candidates...</div>`;

  let candidates = [];
  try {
    candidates = await getCandidates();
    if (!candidates.length) {
      container.innerHTML = `<div class="empty-state">No candidates are currently available.</div>`;
      return;
    }
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Candidate service is unavailable.</div>`;
    showAlert(error.message, "error");
    return;
  }

  container.innerHTML = candidates.map((candidate) => candidateCard(candidate, true)).join("");

  $all("[data-vote-id]").forEach((button) => {
    button.addEventListener("click", () => submitVote(button.dataset.voteId, button));
  });
}

function candidateCard(candidate, withVoteAction = false) {
  const action = withVoteAction
    ? `<button class="btn btn-primary" data-vote-id="${candidate.id}">Vote</button>`
    : "";

  return `
    <article class="candidate-card">
      <img class="candidate-symbol" src="${candidate.symbolUrl}" alt="${candidate.party} symbol">
      <img class="candidate-photo" src="${candidate.imageUrl}" alt="${candidate.name}">
      <div class="candidate-body">
        <p class="eyebrow">${candidate.party}</p>
        <h3>${candidate.name}</h3>
        <p>${candidate.description}</p>
      </div>
      <div class="candidate-actions">
        ${action}
      </div>
    </article>
  `;
}

async function submitVote(candidateId, button) {
  clearAlert();

  if (!window.confirm("Confirm your vote? You cannot change it after submission.")) {
    return;
  }

  setButtonLoading(button, true, "Submitting");

  try {
    await apiRequest(API_ENDPOINTS.vote, {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    });

    const user = getStoredUser() || {};
    sessionStorage.setItem(USER_KEY, JSON.stringify({ ...user, hasVoted: true }));
    showAlert("Your vote has been submitted successfully.", "success");
    setTimeout(() => {
      window.location.href = "result.html";
    }, 900);
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    setButtonLoading(button, false);
  }
}

async function initResultsPage() {
  const container = $("#candidateResults");
  if (!container) return;

  container.innerHTML = `<div class="empty-state">Loading results...</div>`;

  try {
    const data = await apiRequest(API_ENDPOINTS.results);
    const results = (data?.candidates || data?.results || data || []).map(normalizeResult);
    renderResults(results, data);
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Results are not available yet.</div>`;
    showAlert(error.message, "error");
  }
}

function renderResults(results, data = {}) {
  const container = $("#candidateResults");
  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);
  const winner = results.slice().sort((a, b) => b.votes - a.votes)[0];

  setText("#totalVotes", data.totalVotes ?? totalVotes);
  setText("#winnerName", winner ? winner.name : "Pending");
  setText("#winnerParty", winner ? winner.party : "Results pending");

  if (!results.length) {
    container.innerHTML = `<div class="empty-state">No votes have been counted yet.</div>`;
    return;
  }

  container.innerHTML = results
    .sort((a, b) => b.votes - a.votes)
    .map((result) => {
      const percent = totalVotes ? ((result.votes / totalVotes) * 100).toFixed(1) : result.percent.toFixed(1);
      return `
        <article class="result-row">
          <img src="${result.symbolUrl}" alt="${result.party} symbol">
          <div>
            <strong>${result.name}</strong>
            <span>${result.party}</span>
            <div class="progress"><div style="width: ${percent}%"></div></div>
          </div>
          <p>${result.votes} votes<br><span>${percent}%</span></p>
        </article>
      `;
    })
    .join("");
}

async function initProfilePage() {
  const page = $("[data-page='profile']");
  if (!page) return;

  const user = requireAuth();
  if (!user) return;

  setText("#profileName", user.fullName || user.name || "Voter");
  setText("#profilePhone", user.phone || "-");
  setText("#profileEmail", user.email || "-");
  setText("#profileVoterId", user.voterId || "-");
  setText("#profileStatus", user.hasVoted ? "Vote submitted" : "Vote pending");

  try {
    const profile = await apiRequest(API_ENDPOINTS.me);
    const account = profile?.user || profile;
    sessionStorage.setItem(USER_KEY, JSON.stringify(account));
    setText("#profileName", account.fullName || account.name || "Voter");
    setText("#profilePhone", account.phone || "-");
    setText("#profileEmail", account.email || "-");
    setText("#profileVoterId", account.voterId || "-");
    setText("#profileStatus", account.hasVoted ? "Vote submitted" : "Vote pending");
  } catch (error) {
    showAlert(error.message, "error");
  }
}

async function initAdminPage() {
  const page = $("[data-page='admin']");
  if (!page) return;

  requireAuth(["ADMIN"]);

  try {
    const stats = await apiRequest(API_ENDPOINTS.adminStats);
    setText("#totalVoters", stats.totalVoters ?? 0);
    setText("#totalCandidates", stats.totalCandidates ?? 0);
    setText("#totalVotes", stats.totalVotes ?? 0);
    setText("#electionStatus", stats.electionStatus || "Open");
  } catch (error) {
    showAlert(error.message, "error");
  }

  await renderAdminCandidates();
  initCandidateForm();
}

async function renderAdminCandidates() {
  const container = $("#adminCandidateList");
  if (!container) return;

  container.innerHTML = `<div class="empty-state">Loading candidates...</div>`;
  let candidates = [];
  try {
    candidates = await getCandidates();
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Candidate service is unavailable.</div>`;
    showAlert(error.message, "error");
    return;
  }

  container.innerHTML = candidates.length
    ? candidates.map((candidate) => candidateCard(candidate, false)).join("")
    : `<div class="empty-state">No candidates have been added yet.</div>`;
}

function initCandidateForm() {
  const form = $("#candidateForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();
    if (!validateForm(form)) return;

    const payload = serializeForm(form);
    const submit = form.querySelector("button[type='submit']");
    setButtonLoading(submit, true, "Saving");

    try {
      await apiRequest(API_ENDPOINTS.adminCandidates, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showAlert("Candidate saved successfully.", "success");
      form.reset();
      await renderAdminCandidates();
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  });
}

async function logout() {
  try {
    await apiRequest(API_ENDPOINTS.logout, { method: "POST" });
  } catch {
    // The local session should still be cleared if the backend session has expired.
  }

  clearSession();
  window.location.href = "login.html";
}

function initNavigation() {
  $all("[data-logout]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
    });
  });
}

function initTheme() {
  const savedTheme = localStorage.getItem("ovs_theme");
  if (savedTheme === "dark") document.documentElement.classList.add("dark");

  $all("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("ovs_theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initRegisterPage();
  initLoginPage();
  initAdminLoginPage();
  initVotePage();
  initResultsPage();
  initProfilePage();
  initAdminPage();
});
