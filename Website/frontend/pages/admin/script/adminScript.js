const table = document.getElementById("reportTable");

async function loadReports() {

const res = await fetch("http://localhost:3000/api/admin/reports");
const reports = await res.json();

table.innerHTML = "";

let total = reports.length;
let pending = reports.filter(r => r.status === "Pending").length;
let resolved = reports.filter(r => r.status === "Resolved").length;

document.getElementById("totalCount").innerText = total;
document.getElementById("pendingCount").innerText = pending;
document.getElementById("resolvedCount").innerText = resolved;

reports.forEach(report => {

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

function viewReport(id){
alert("Viewing report "+id);
}

loadReports();

let total = reports.length;
let pending = reports.filter(r => r.status === "Pending").length;
let resolved = reports.filter(r => r.status === "Resolved").length;

document.getElementById("totalCount").innerText = total;
document.getElementById("pendingCount").innerText = pending;
document.getElementById("resolvedCount").innerText = resolved;

reports.forEach(report => {
    const row = `
        <tr>
            <td>${report.id}</td>
            <td><img src="${report.image}" width="80"/></td>
            <td>${report.location}</td>
            <td>${report.status}</td>
            <td><button onclick="markResolved(${report.id})">View</button></td>
        </tr>
    `;
    table.innerHTML += row;
});

function markResolved(id) {
    alert("Report " + id + " marked as resolved!");
}
