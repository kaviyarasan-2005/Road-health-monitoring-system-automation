const table = document.getElementById("reportTable");

let reports = [];

// Fetch reports from database
async function loadReports() {

const res = await fetch("http://localhost:3000/api/admin/reports");
reports = await res.json();

displayReports(reports);

}

// Display reports in table
function displayReports(data) {

table.innerHTML = "";

data.forEach(report => {

table.innerHTML += `
<tr>
<td>${report.id}</td>
<td><img src="http://localhost:3000/${report.image_url}" width="80"/></td>
<td>${report.location}</td>
<td>${report.description}</td>
<td>${report.status}</td>
<td>
<button class="resolve-btn" onclick="markResolved(${report.id})">Resolve</button>
<button class="delete-btn" onclick="deleteReport(${report.id})">Delete</button>
</td>
</tr>
`;

});

}

// Filter reports
function filterReports() {

const status = document.getElementById("statusFilter").value;

if (status === "All") {
displayReports(reports);
} else {

const filtered = reports.filter(r => r.status === status);
displayReports(filtered);

}

}

// Mark report as resolved
async function markResolved(id) {

await fetch(`http://localhost:3000/api/admin/resolve/${id}`,{
method:"PUT"
});

loadReports();

}

// Delete report
async function deleteReport(id) {

await fetch(`http://localhost:3000/api/admin/delete/${id}`,{
method:"DELETE"
});

loadReports();

}

// Load reports when page opens
window.onload = loadReports;