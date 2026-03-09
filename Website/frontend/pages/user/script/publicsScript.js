const form = document.getElementById("reportForm");
const message = document.getElementById("message");

async function getReport() {

    console.log("event start");

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        message.innerText = "Please select an image first.";
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    message.innerText = "Analyzing image...";

    try {
        const response = await fetch("http://127.0.0.1:5000/api/public/detect", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log(data);

        message.style.color = "green";
        message.innerText =
            `Damage Level: ${data.damage_percentage}% | Potholes Detected: ${data.detections}`;

    } catch (error) {
        console.log(error);
        message.style.color = "red";
        message.innerText = "Error connecting to AI server.";
    }
}