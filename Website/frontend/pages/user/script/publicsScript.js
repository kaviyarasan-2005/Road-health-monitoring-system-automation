const modal = document.getElementById("reportModal");
const openBtn = document.getElementById("openReportBtn");
const closeBtn = document.getElementById("closeModal");

const form = document.getElementById("reportForm");
const message = document.getElementById("message");

// Open modal
openBtn.onclick = () => {
  modal.style.display = "block";
};

// Close modal
closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Store coords separately
let currentLat = null;
let currentLon = null;

// Submit report
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("imageInput").files[0];
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;

  const formData = new FormData();
  formData.append("image", file);
  formData.append("description", description);
  formData.append("location", location);

  // ✅ Send lat & lon as separate fields
  if (currentLat !== null && currentLon !== null) {
    formData.append("latitude", currentLat);
    formData.append("longitude", currentLon);
  }

  try {
    const res = await fetch("http://localhost:3000/api/public/report", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    message.innerText = data.message;
    form.reset();
    currentLat = null;
    currentLon = null;

  } catch (err) {
    message.innerText = "Upload failed";
  }
});

// For location
const locationBtn = document.getElementById("getLocationBtn");
const locationInput = document.getElementById("location");

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLat = position.coords.latitude;   // ✅ stored separately
      currentLon = position.coords.longitude;  // ✅ stored separately

      locationInput.value = currentLat + ", " + currentLon;
    },
    (error) => {
      alert("Unable to fetch location");
    }
  );
});

const reportTable = document.getElementById("reportTable");

// Load reports
async function loadReports() {
  const res = await fetch("http://localhost:3000/api/public/reports");
  const reports = await res.json();

  reportTable.innerHTML = "";

  let total = reports.length;
  let pending = reports.filter((r) => r.status === "Pending").length;
  let resolved = reports.filter((r) => r.status === "Resolved").length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("pendingCount").innerText = pending;
  document.getElementById("resolvedCount").innerText = resolved;

  if (reports.length === 0) {
    document.getElementById("emptyState").style.display = "block";
  } else {
    document.getElementById("emptyState").style.display = "none";
  }

  reports.forEach((report) => {
    const row = `
      <tr>
        <td>${report.id}</td>
        <td><img src="http://localhost:3000/${report.image_url}" width="80"/></td>
        <td>${report.location}</td>
        <td>${report.description}</td>
        <td>${report.status}</td>
      </tr>
    `;
    reportTable.innerHTML += row;
  });
}

window.onload = loadReports;