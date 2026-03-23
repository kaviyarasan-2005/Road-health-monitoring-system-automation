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


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("imageInput").files[0];
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;

  // ✅ validation
  if (!file) {
    alert("Please select an image");
    return;
  }

  if (!location) {
    alert("Please get location");
    return;
  }

  // ✅ split location
  const [lat, lon] = location.split(",").map(item => item.trim());

  const formData = new FormData();
  formData.append("description", description);
  formData.append("latitude", lat);
  formData.append("longitude", lon);
  formData.append("image", file); 

  try {
    const res = await fetch("http://localhost:3000/api/public/report", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    console.log(data);
    message.innerText = data.message || "Report submitted";

    form.reset();

  } catch (err) {
    console.error(err);
    message.innerText = "Error submitting report";
  }
});
const locationBtn = document.getElementById("getLocationBtn");
const locationInput = document.getElementById("location");

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      locationInput.value = `${lat}, ${lon}`;
    },
    () => {
      alert("Unable to fetch location");
    }
  );
});
const reportTable = document.getElementById("reportTable");

// Load reports
async function loadReports() {
  try {
    const res = await fetch("http://localhost:3000/api/public/reports")
    const reports = await res.json();

    console.log("Reports:", reports);

    // ✅ safety check
    if (!Array.isArray(reports)) {
      console.error("Invalid response:", reports);
      return;
    }

    reportTable.innerHTML = "";

    // ✅ COUNT LOGIC
    let total = reports.length;
    let pending = reports.filter(r => r.status === "Pending").length;
    let resolved = reports.filter(r => r.status === "Resolved").length;

    // ✅ UPDATE UI
    document.getElementById("totalCount").innerText = total;
    document.getElementById("pendingCount").innerText = pending;
    document.getElementById("resolvedCount").innerText = resolved;

    // ✅ EMPTY STATE
    document.getElementById("emptyState").style.display =
      reports.length === 0 ? "block" : "none";

    // ✅ TABLE DATA
    reports.forEach(report => {

      const lat = report.latitude || "";
      const lng = report.longitude || "";
      const locationText = lat && lng ? `${lat}, ${lng}` : "N/A";

      const row = `
        <tr>
          <td>${report.id}</td>
          <td>
            <img src="http://localhost:3000/uploads/${report.image_url}" width="80"/>
          </td>
          <td>${report.latitude}</td>
          <td>${report.description || "No description"}</td>
          <td>${report.status}</td>
        </tr>
      `;

      reportTable.innerHTML += row;
    });

  } catch (err) {
    console.error("Error loading reports:", err);
  }
}


// load reports when page opens
window.onload = loadReports;