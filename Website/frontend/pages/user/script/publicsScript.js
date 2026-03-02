const form = document.getElementById("reportForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (e) {
 console.log(e+"  sjhdfjs");
    e.preventDefault();
    console.log(e+"  sjhdfjs");
    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("image", file);

    message.innerText = "Analyzing image...";
    try {
       const response = await fetch("http://127.0.0.1:5000/api/public/detect", {
    method: "POST",
    body: formData
});

console.log("Response status:", response.status);

const text = await response.text();
console.log("Raw response:", text);

const data = JSON.parse(text);
console.log("Parsed data:", data);
        // const data = await response.json();

        message.style.color = "green";
        message.innerText = 
            `Damage Level: ${data.damage_percentage}% 
             | Potholes Detected: ${data.detections}`;
    } catch (error) {
        message.style.color = "red";
        message.innerText = "Error connecting to AI server.";
    }
});