const table = document.getElementById("reportTable");

let allReports = [];

async function loadReports() {

const res = await fetch("http://localhost:3000/api/admin/reports");
allReports = await res.json();

table.innerHTML = "";

let total = allReports.length;
let pending = allReports.filter(r => r.status === "Pending").length;
let resolved = allReports.filter(r => r.status === "Resolved").length;

document.getElementById("totalCount").innerText = total;
document.getElementById("pendingCount").innerText = pending;
document.getElementById("resolvedCount").innerText = resolved;

allReports.forEach(report => {

const row = `
<tr>
<td>${report.id}</td>
<td><img src="http://localhost:3000/${report.image_url}" width="80"/></td>
<td>${report.location}</td>
<td>${report.status}</td>
<td><button onclick="viewReport(${report.id})">View</button></td>
</tr>
`;

table.innerHTML += row;

});

}

// Show report details
function viewReport(id){

const report = allReports.find(r => r.id === id);

document.getElementById("detailImage").src =
"http://localhost:3000/" + report.image_url;

document.getElementById("detailLocation").innerText = report.location;
document.getElementById("detailDescription").innerText = report.description;
document.getElementById("detailDamage").innerText = report.damage_percentage + "%";
document.getElementById("detailStatus").innerText = report.status;

document.getElementById("reportModal").style.display = "block";

}

// Close popup
function closeModal(){
document.getElementById("reportModal").style.display = "none";
}

// Load reports when page opens
window.onload = loadReports;