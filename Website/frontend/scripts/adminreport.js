let reports = [
    {
        id: 1,
        image: "https://via.placeholder.com/80",
        location: "12.9716, 77.5946",
        description: "Large pothole near signal",
        status: "Pending"
    },
    {
        id: 2,
        image: "https://via.placeholder.com/80",
        location: "13.0827, 80.2707",
        description: "Small pothole on main road",
        status: "Resolved"
    }
];

const table = document.getElementById("reportTable");

function displayReports(data) {
    table.innerHTML = "";

    data.forEach(report => {
        table.innerHTML += `
            <tr>
                <td>${report.id}</td>
                <td><img src="${report.image}" /></td>
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

function filterReports() {
    const status = document.getElementById("statusFilter").value;

    if (status === "All") {
        displayReports(reports);
    } else {
        const filtered = reports.filter(r => r.status === status);
        displayReports(filtered);
    }
}

function markResolved(id) {
    reports = reports.map(report => 
        report.id === id ? { ...report, status: "Resolved" } : report
    );
    displayReports(reports);
}

function deleteReport(id) {
    reports = reports.filter(report => report.id !== id);
    displayReports(reports);
}

displayReports(reports);
