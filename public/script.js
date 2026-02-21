function goToLogin(role) {
  localStorage.setItem("role", role);
  window.location.href = "login.html";
}

window.onload = function () {

  // ===== ROLE BASED LOGIN SWITCH =====
  const role = localStorage.getItem("role");

  const loginTitle = document.getElementById("loginTitle");
  const patientLogin = document.getElementById("patientLogin");
  const doctorLogin = document.getElementById("doctorLogin");

  if (loginTitle) {
    if (role === "patient") {
      loginTitle.innerText = "Patient Login";
      if (doctorLogin) doctorLogin.style.display = "none";
    } else if (role === "doctor") {
      loginTitle.innerText = "Doctor Login";
      if (patientLogin) patientLogin.style.display = "none";
    }
  }

  // ===== LOAD SAVED PROFILE DATA ONLY IF EDITING =====
  const isEditing = localStorage.getItem("editingProfile");

  if (isEditing === "true") {
    const savedData = localStorage.getItem("userProfile");

    if (savedData) {
      const user = JSON.parse(savedData);

      Object.keys(user).forEach(key => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
          field.value = user[key];
        }
      });
    }

    // Remove flag after loading
    localStorage.removeItem("editingProfile");
  }
};

// ================= LOGIN FUNCTIONS =================

function patientLogin() {
  const phone = document.getElementById("phone").value;

  fetch("/patient-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      window.location.href = "patient-details.html";
    });
}

function doctorLogin() {
  const hospitalId = document.getElementById("hospitalId").value;
  const doctorId = document.getElementById("doctorId").value;

  fetch("/doctor-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hospitalId, doctorId })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
    });
}

// ================= SAVE PATIENT DETAILS =================

document.addEventListener("submit", function (e) {
  if (e.target.id === "patientForm") {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    fetch("/save-patient-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues)
    })
      .then(res => res.json())
      .then(response => {

        // Save entire form locally
        localStorage.setItem("userProfile", JSON.stringify(formValues));

        alert(response.message);
        window.location.href = "upload-reports.html";
      });
  }
});

// ================= UPLOAD REPORTS =================

function uploadReports() {
  const files = document.getElementById("reports").files;
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append("reports", files[i]);
  }

  fetch("/upload-reports", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      alert("All Done! Profile updated successfully.");
      window.location.href = "dashboard.html";
    });
}

// ================= NAVIGATION =================

function goToUpdate() {
  // Set editing mode before going to profile page
  localStorage.setItem("editingProfile", "true");
  window.location.href = "patient-details.html";
}

function goToUpload() {
  window.location.href = "upload-reports.html";
}

function contactSupport() {
  alert("Support contacted! We will reach out shortly.");
}

// ================= AI CHAT =================

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) return;

  const chatMessages = document.getElementById("chatMessages");

  const userMsg = document.createElement("div");
  userMsg.innerText = "You: " + message;
  chatMessages.appendChild(userMsg);

  input.value = "";

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    const botMsg = document.createElement("div");
    botMsg.innerText = "SehatQure AI: " + data.reply;
    chatMessages.appendChild(botMsg);

  } catch (error) {
    console.error("Frontend error:", error);
  }
}

// ================= HOSPITAL FINDER =================

function showHospital(area) {

  const hospitalData = {
    modelTown: { name: "Columbia Asia Hospital", phone: "0175-3989898" },
    urban1: { name: "Rajindra Hospital", phone: "0175-2212012" },
    urban2: { name: "Manipal Hospital Patiala", phone: "0175-5000000" },
    tripuri: { name: "Deep Hospital", phone: "0175-2220000" },
    rajpura: { name: "Apex Hospital", phone: "0175-3001234" },
    sirhind: { name: "Grewal Hospital", phone: "0175-4005678" }
  };

  const hospital = hospitalData[area];
  const displayDiv = document.getElementById("hospitalDisplay");

  if (!hospital || !displayDiv) return;

  displayDiv.innerHTML = `
    <h3>${hospital.name}</h3>
    <p>Contact: ${hospital.phone}</p>
    <a href="tel:${hospital.phone}" class="call-button">
      📞 Call Now
    </a>
  `;
}