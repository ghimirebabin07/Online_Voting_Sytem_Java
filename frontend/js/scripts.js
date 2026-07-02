const API_BASE_URL = window.VOTING_API_BASE_URL || "";
const TOKEN_KEY = "ovs_auth_token";
const USER_KEY = "ovs_user";

const API_ENDPOINTS = {
 register: "/online-voting-backend/api/auth/register",
  login: "/online-voting-backend/api/auth/login",
  adminLogin: "/online-voting-backend/api/auth/admin/login",
  logout: "/online-voting-backend/api/auth/logout",
  me: "/online-voting-backend/api/users/me",
  locations: "/online-voting-backend/api/locations",
  candidates: "/online-voting-backend/api/candidates",
  vote: "/online-voting-backend/api/votes",
  results: "/online-voting-backend/api/results",
  developers: "/online-voting-backend/api/developers",
  adminStats: "/online-voting-backend/api/admin/stats",
  adminCandidates: "/online-voting-backend/api/admin/candidates",
};

const DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%2394a3b8'/%3E%3Cpath d='M30 140c8-30 28-46 50-46s42 16 50 46' fill='%2394a3b8'/%3E%3C/svg%3E";

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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

const MAX_CANDIDATE_IMAGE_SIZE = 1024 * 1024;

function readImageFile(file, label) {
  return new Promise((resolve, reject) => {
    if (!file || file.size === 0) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error(`${label} must be an image file.`));
      return;
    }

    if (file.size > MAX_CANDIDATE_IMAGE_SIZE) {
      reject(new Error(`${label} must be 1 MB or smaller.`));
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error(`${label} could not be read.`)));
    reader.readAsDataURL(file);
  });
}

async function candidatePayloadFromForm(form) {
  const payload = serializeForm(form);
  const imageFile = form.elements.image?.files?.[0];
  const symbolFile = form.elements.symbol?.files?.[0];

  payload.image = await readImageFile(imageFile, "Candidate image");
  payload.symbol = await readImageFile(symbolFile, "Party symbol image");

  return payload;
}

function initImagePreviews(form) {
  $all("[data-file-trigger]", form).forEach((button) => {
    button.addEventListener("click", () => {
      $(`#${button.dataset.fileTrigger}`, form)?.click();
    });
  });

  $all("input[type='file'][data-preview]", form).forEach((input) => {
    input.addEventListener("change", () => {
      const preview = $(`#${input.dataset.preview}`);
      const fileName = $(`#${input.dataset.fileName}`);
      const file = input.files?.[0];
      const isImage = file?.type.startsWith("image/");

      if (fileName) {
        fileName.textContent = file?.name || "No image selected";
      }

      if (!preview) return;
      if (!file || !isImage) {
        preview.hidden = true;
        preview.removeAttribute("src");
        if (file && !isImage) {
          input.value = "";
          if (fileName) {
            fileName.textContent = "Please choose an image file";
          }
        }
        return;
      }

      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
    });
  });
}

function resetImagePreviews(form) {
  $all("input[type='file'][data-preview]", form).forEach((input) => {
    const preview = $(`#${input.dataset.preview}`);
    const fileName = $(`#${input.dataset.fileName}`);

    if (fileName) {
      fileName.textContent = "No image selected";
    }

    if (preview) {
      preview.hidden = true;
      preview.removeAttribute("src");
    }
  });
}

function fillSelect(select, options, placeholder) {
  if (!select) return;
  select.innerHTML = [`<option value="">${placeholder}</option>`, ...options.map((option) => `<option value="${option}">${option}</option>`)].join("");
}

let locationDataPromise = null;

function groupLocations(locations) {
  return locations.reduce((grouped, location) => {
    let province = grouped.find((item) => item.province === location.province);
    if (!province) {
      province = { province: location.province, districts: [] };
      grouped.push(province);
    }

    let district = province.districts.find((item) => item.name === location.district);
    if (!district) {
      district = { name: location.district, municipalities: [] };
      province.districts.push(district);
    }

    if (!district.municipalities.includes(location.municipality)) {
      district.municipalities.push(location.municipality);
    }

    return grouped;
  }, []);
}

async function getLocationData() {
  if (!locationDataPromise) {
    locationDataPromise = apiRequest(API_ENDPOINTS.locations)
      .then((data) => groupLocations(data?.locations || data || []));
  }

  return locationDataPromise;
}

async function initLocationSelector({ provinceId, districtId, municipalityId, onChange }) {
  const provinceSelect = $(`#${provinceId}`);
  const districtSelect = $(`#${districtId}`);
  const municipalitySelect = $(`#${municipalityId}`);

  if (!provinceSelect || !districtSelect || !municipalitySelect) return;

  fillSelect(provinceSelect, [], "Loading provinces");
  districtSelect.disabled = true;
  municipalitySelect.disabled = true;

  let locationData = [];
  try {
    locationData = await getLocationData();
    fillSelect(provinceSelect, locationData.map((item) => item.province), "Select province");
  } catch (error) {
    fillSelect(provinceSelect, [], "Locations unavailable");
    showAlert(error.message, "error");
    return;
  }

  provinceSelect.addEventListener("change", () => {
    const province = locationData.find((item) => item.province === provinceSelect.value);
    fillSelect(districtSelect, province ? province.districts.map((district) => district.name) : [], "Select district");
    fillSelect(municipalitySelect, [], "Select municipality");
    districtSelect.disabled = !province;
    municipalitySelect.disabled = true;
    onChange?.();
  });

  districtSelect.addEventListener("change", () => {
    const province = locationData.find((item) => item.province === provinceSelect.value);
    const district = province?.districts.find((item) => item.name === districtSelect.value);
    fillSelect(municipalitySelect, district ? district.municipalities : [], "Select municipality");
    municipalitySelect.disabled = !district;
    onChange?.();
  });

  municipalitySelect.addEventListener("change", () => onChange?.());
}

function candidateMatchesLocation(candidate, location) {
  if (!candidate.province && !candidate.district && !candidate.municipality) {
    return true;
  }

  return candidate.province === location.province
    && candidate.district === location.district
    && candidate.municipality === location.municipality;
}

function userLocation(user = {}) {
  return {
    province: user.province || "",
    district: user.district || "",
    municipality: user.municipality || "",
  };
}

function hasCompleteLocation(location = {}) {
  return Boolean(location.province && location.district && location.municipality);
}

function formatLocation(location = {}) {
  if (!hasCompleteLocation(location)) {
    return "Region not found";
  }

  return `${location.municipality}, ${location.district}, ${location.province}`;
}

async function loadCurrentUser() {
  const storedUser = getStoredUser() || {};

  try {
    const profile = await apiRequest(API_ENDPOINTS.me);
    const account = profile?.user || profile || {};
    const mergedUser = { ...storedUser, ...account };
    sessionStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
    return mergedUser;
  } catch {
    return storedUser;
  }
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
    imageUrl: candidate.imageUrl ?? candidate.image ?? DEFAULT_IMAGE,
    symbolUrl: candidate.symbolUrl ?? candidate.symbol ?? DEFAULT_IMAGE,
    description: candidate.description ?? candidate.manifesto ?? "Candidate information will be updated by the election administrator.",
    votes: candidate.votes ?? candidate.totalVotes ?? 0,
    province: candidate.province ?? candidate.provinceName ?? "",
    district: candidate.district ?? candidate.districtName ?? "",
    municipality: candidate.municipality ?? candidate.municipalityName ?? candidate.localLevel ?? "",
  };
}

function normalizeResult(result) {
  return {
    id: result.id ?? result.candidateId,
    name: result.name ?? result.candidateName ?? "Unnamed Candidate",
    party: result.party ?? result.partyName ?? "Independent",
    votes: Number(result.votes ?? result.totalVotes ?? 0),
    percent: Number(result.percent ?? result.percentage ?? 0),
    imageUrl: result.imageUrl ?? result.image ?? DEFAULT_IMAGE,
    symbolUrl: result.symbolUrl ?? result.symbol ?? DEFAULT_IMAGE,
    province: result.province ?? result.provinceName ?? "",
    district: result.district ?? result.districtName ?? "",
    municipality: result.municipality ?? result.municipalityName ?? result.localLevel ?? "",
  };
}

async function getCandidates() {
  const data = await apiRequest(API_ENDPOINTS.candidates);
  return (data?.candidates || data || []).map(normalizeCandidate);
}

function developerCard(developer) {
  const name = developer.name ?? developer.fullName ?? "Developer";
  const role = developer.role ?? developer.roleTitle ?? "Developer";
  const bio = developer.bio ?? "";
  const skills = developer.skills ?? "";
  const image = developer.image ?? developer.imageUrl ?? DEFAULT_IMAGE;

  return `
    <article class="developer-card">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}">
      <div>
        <p class="eyebrow">${escapeHtml(role)}</p>
        <h2>${escapeHtml(name)}</h2>
        <p>${escapeHtml(bio)}</p>
        <span>${escapeHtml(skills)}</span>
      </div>
    </article>
  `;
}

async function initDevelopersPage() {
  const container = $("#developerGrid");
  if (!container) return;

  container.innerHTML = `<div class="empty-state">Loading developer details...</div>`;

  try {
    const data = await apiRequest(API_ENDPOINTS.developers);
    const developers = data?.developers || data || [];
    container.innerHTML = developers.length
      ? developers.map(developerCard).join("")
      : `<div class="empty-state">Developer details are not available.</div>`;
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Developer details are unavailable.</div>`;
    showAlert(error.message, "error");
  }
}

async function initRegisterPage() {
  const form = $("#registerForm");
  if (!form) return;

  initLocationSelector({
    provinceId: "registerProvince",
    districtId: "registerDistrict",
    municipalityId: "registerMunicipality",
  });

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
          province: payload.province,
          district: payload.district,
          municipality: payload.municipality,
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

  const authUser = requireAuth();
  if (!authUser) return;

  container.innerHTML = `<div class="empty-state">Loading candidates for your registered voting area...</div>`;
  const user = await loadCurrentUser();
  const location = userLocation(user);
  setText("#voteLocationText", formatLocation(location));

  if (!hasCompleteLocation(location)) {
    container.innerHTML = `<div class="empty-state">Your account does not have a complete voting area. Please register with province, district, and municipality before voting.</div>`;
    return;
  }

  let candidates = [];
  try {
    candidates = await getCandidates();
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Candidate service is unavailable. Please try again later.</div>`;
    showAlert(error.message, "error");
    return;
  }

  const locationCandidates = candidates.filter((candidate) => candidateMatchesLocation(candidate, location));
  const visibleCandidates = locationCandidates;

  if (!visibleCandidates.length) {
    container.innerHTML = `<div class="empty-state">No registered candidates found for ${location.municipality}, ${location.district}.</div>`;
    return;
  }

  container.innerHTML = visibleCandidates.map((candidate) => candidateCard(candidate, true)).join("");

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
        ${candidate.municipality ? `<span class="candidate-location">${candidate.municipality}, ${candidate.district}</span>` : ""}
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
    const storedUser = getStoredUser() || {};
    const data = await apiRequest(API_ENDPOINTS.results);
    const results = (data?.candidates || data?.results || data || []).map(normalizeResult);

    if (storedUser.role === "ADMIN") {
      const filter = $("#resultRegionFilter");
      if (filter) filter.hidden = false;

      initLocationSelector({
        provinceId: "resultProvince",
        districtId: "resultDistrict",
        municipalityId: "resultMunicipality",
        onChange: () => renderResults(results, data, selectedLocation("resultProvince", "resultDistrict", "resultMunicipality")),
      });

      renderResults(results, data, null);
      return;
    }

    const user = await loadCurrentUser();
    const location = userLocation(user);
    const locationSummary = $("#resultVoterLocation");
    if (locationSummary) locationSummary.hidden = false;
    setText("#resultLocationText", formatLocation(location));
    renderResults(results, data, location);
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Results are not available yet.</div>`;
    showAlert(error.message, "error");
  }
}

function renderResults(results, data = {}, location = null) {
  const container = $("#candidateResults");
  const visibleResults = location && hasCompleteLocation(location)
    ? results.filter((result) => candidateMatchesLocation(result, location))
    : [];
  const totalVotes = visibleResults.reduce((sum, item) => sum + item.votes, 0);
  const winner = visibleResults.slice().sort((a, b) => b.votes - a.votes)[0];

  setText("#totalVotes", totalVotes);
  setText("#winnerName", winner ? winner.name : "Pending");
  setText("#winnerParty", winner ? winner.party : "Results pending");

  if (!location || !hasCompleteLocation(location)) {
    container.innerHTML = `<div class="empty-state">Select a province, district, and municipality to view that region's result.</div>`;
    return;
  }

  if (!visibleResults.length) {
    container.innerHTML = `<div class="empty-state">No candidates found for ${location.municipality}, ${location.district}.</div>`;
    return;
  }

  container.innerHTML = visibleResults
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
  setText("#profileProvince", user.province || "-");
  setText("#profileDistrict", user.district || "-");
  setText("#profileMunicipality", user.municipality || "-");

  try {
    const profile = await apiRequest(API_ENDPOINTS.me);
    const account = profile?.user || profile;
    sessionStorage.setItem(USER_KEY, JSON.stringify(account));
    setText("#profileName", account.fullName || account.name || "Voter");
    setText("#profilePhone", account.phone || "-");
    setText("#profileEmail", account.email || "-");
    setText("#profileVoterId", account.voterId || "-");
    setText("#profileStatus", account.hasVoted ? "Vote submitted" : "Vote pending");
    setText("#profileProvince", account.province || "-");
    setText("#profileDistrict", account.district || "-");
    setText("#profileMunicipality", account.municipality || "-");
  } catch (error) {
    showAlert(error.message, "error");
  }
}

async function initAdminPage() {
  const page = $("[data-page='admin']");
  if (!page) return;

  requireAuth(["ADMIN"]);

  await loadAdminStats();
  initAdminCandidateFilter();
  initCandidateForm();
  await renderAdminCandidates();
}

async function loadAdminStats() {
  try {
    const stats = await apiRequest(API_ENDPOINTS.adminStats);
    setText("#totalVoters", stats.totalVoters ?? 0);
    setText("#totalCandidates", stats.totalCandidates ?? 0);
    setText("#totalVotes", stats.totalVotes ?? 0);
    setText("#electionStatus", stats.electionStatus || "Open");
  } catch (error) {
    showAlert(error.message, "error");
  }
}

async function renderAdminCandidates() {
  const container = $("#adminCandidateList");
  if (!container) return;

  const location = selectedLocation("adminFilterProvince", "adminFilterDistrict", "adminFilterMunicipality");
  if (!location.province || !location.district || !location.municipality) {
    container.innerHTML = `<div class="empty-state">Select a province, district, and municipality to view candidates for that region.</div>`;
    return;
  }

  container.innerHTML = `<div class="empty-state">Loading candidates...</div>`;
  let candidates = [];
  try {
    candidates = await getCandidates();
  } catch (error) {
    container.innerHTML = `<div class="empty-state">Candidate service is unavailable.</div>`;
    showAlert(error.message, "error");
    return;
  }

  const regionCandidates = candidates.filter((candidate) => candidateMatchesLocation(candidate, location));
  container.innerHTML = regionCandidates.length
    ? regionCandidates.map((candidate) => candidateCard(candidate, false)).join("")
    : `<div class="empty-state">No candidates found for ${location.municipality}, ${location.district}.</div>`;
}

function initCandidateForm() {
  const form = $("#candidateForm");
  if (!form) return;

  initImagePreviews(form);

  initLocationSelector({
    provinceId: "candidateProvince",
    districtId: "candidateDistrict",
    municipalityId: "candidateMunicipality",
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlert();
    if (!validateForm(form)) return;

    const submit = form.querySelector("button[type='submit']");
    setButtonLoading(submit, true, "Saving");

    try {
      const payload = await candidatePayloadFromForm(form);
      await apiRequest(API_ENDPOINTS.adminCandidates, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      showAlert("Candidate saved successfully.", "success");
      form.reset();
      resetImagePreviews(form);
      resetLocationSelector("candidateDistrict", "candidateMunicipality");
      await loadAdminStats();
      await renderAdminCandidates();
    } catch (error) {
      showAlert(error.message, "error");
    } finally {
      setButtonLoading(submit, false);
    }
  });
}

function initAdminCandidateFilter() {
  initLocationSelector({
    provinceId: "adminFilterProvince",
    districtId: "adminFilterDistrict",
    municipalityId: "adminFilterMunicipality",
    onChange: renderAdminCandidates,
  });
}

function selectedLocation(provinceId, districtId, municipalityId) {
  return {
    province: $(`#${provinceId}`)?.value,
    district: $(`#${districtId}`)?.value,
    municipality: $(`#${municipalityId}`)?.value,
  };
}

function resetLocationSelector(districtId, municipalityId) {
  fillSelect($(`#${districtId}`), [], "Select district");
  fillSelect($(`#${municipalityId}`), [], "Select municipality");
  const district = $(`#${districtId}`);
  const municipality = $(`#${municipalityId}`);
  if (district) district.disabled = true;
  if (municipality) municipality.disabled = true;
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
  initDevelopersPage();
  initProfilePage();
  initAdminPage();
});
