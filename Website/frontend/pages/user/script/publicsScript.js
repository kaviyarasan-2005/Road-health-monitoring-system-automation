const form = document.getElementById("reportForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    message.innerText = "Analyzing image...";

    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        message.style.color = "green";
        message.innerText = 
            `Damage Level: ${data.damage_percentage}% 
             | Potholes Detected: ${data.detections}`;
    } catch (error) {
        message.style.color = "red";
        message.innerText = "Error connecting to AI server.";
    }
});