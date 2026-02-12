const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const locationField = document.getElementById("location");
const form = document.getElementById("reportForm");
const message = document.getElementById("message");

imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        preview.style.display = "block";
        preview.src = URL.createObjectURL(file);
    }
});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            locationField.value = `${lat}, ${lon}`;
        }, () => {
            alert("Location access denied.");
        });
    } else {
        alert("Geolocation not supported.");
    }
}

// Form Submit
form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Later connect this to backend API
    message.style.color = "green";
    message.innerText = "Report submitted successfully!";
    
    form.reset();
    preview.style.display = "none";
});
