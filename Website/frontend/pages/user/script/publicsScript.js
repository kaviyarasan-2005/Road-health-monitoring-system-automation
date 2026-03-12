const modal = document.getElementById("reportModal");
const openBtn = document.getElementById("openReportBtn");
const closeBtn = document.getElementById("closeModal");

const form = document.getElementById("reportForm");
const message = document.getElementById("message");

// Open modal
openBtn.onclick = () => {
modal.style.display = "block";
};

// Close modal
closeBtn.onclick = () => {
modal.style.display = "none";
};

window.onclick = (event) => {
if (event.target === modal) {
modal.style.display = "none";
}
};

// Submit report
form.addEventListener("submit", async (e)=>{

e.preventDefault();

const file = document.getElementById("imageInput").files[0];
const description = document.getElementById("description").value;
const location = document.getElementById("location").value;

const formData = new FormData();

formData.append("image", file);
formData.append("description", description);
formData.append("location", location);

try{

const res = await fetch("http://localhost:3000/api/public/report",{
method:"POST",
body:formData
});

const data = await res.json();

message.innerText = data.message;

form.reset();

}catch(err){

message.innerText="Upload failed";

}

});

// for location

const locationBtn = document.getElementById("getLocationBtn");
const locationInput = document.getElementById("location");

locationBtn.addEventListener("click", () => {

if (!navigator.geolocation) {
alert("Geolocation not supported");
return;
}

navigator.geolocation.getCurrentPosition(

(position) => {

const lat = position.coords.latitude;
const lon = position.coords.longitude;

locationInput.value = lat + ", " + lon;

},

(error) => {

alert("Unable to fetch location");

}

);

});