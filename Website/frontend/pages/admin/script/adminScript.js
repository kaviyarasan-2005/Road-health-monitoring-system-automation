
const reports = [
    { id: 1, location: "12.9716, 77.5946", status: "Pending", image: "https://via.placeholder.com/80" },
    { id: 2, location: "13.0827, 80.2707", status: "Resolved", image: "https://via.placeholder.com/80" }
];

const table = document.getElementById("reportTable");

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
            <td><button onclick="markResolved(${report.id})">Resolve</button></td>
        </tr>
    `;
    table.innerHTML += row;
});

function markResolved(id) {
    alert("Report " + id + " marked as resolved!");
}
