// Dummy Data (Replace later with backend data)
const reports = [
    { status: "Pending", month: "Jan" },
    { status: "Resolved", month: "Jan" },
    { status: "Pending", month: "Feb" },
    { status: "Resolved", month: "Mar" },
    { status: "Pending", month: "Mar" },
    { status: "Resolved", month: "Apr" }
];

// Count Summary
const total = reports.length;
const pending = reports.filter(r => r.status === "Pending").length;
const resolved = reports.filter(r => r.status === "Resolved").length;

document.getElementById("totalReports").innerText = total;
document.getElementById("pendingReports").innerText = pending;
document.getElementById("resolvedReports").innerText = resolved;

// Monthly Data
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const monthlyCounts = months.map(month =>
    reports.filter(r => r.month === month).length
);

// Monthly Bar Chart
new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
        labels: months,
        datasets: [{
            label: "Reports",
            data: monthlyCounts,
            backgroundColor: "#3b82f6"
        }]
    }
});

// Status Pie Chart
new Chart(document.getElementById("statusChart"), {
    type: "pie",
    data: {
        labels: ["Pending", "Resolved"],
        datasets: [{
            data: [pending, resolved],
            backgroundColor: ["#f59e0b", "#10b981"]
        }]
    }
});
