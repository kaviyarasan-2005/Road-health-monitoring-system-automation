const form = document.getElementById("signupForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e)=>{

e.preventDefault();

const name = document.getElementById("name").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch("http://localhost:3000/api/auth/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({name,email,password})
});

const data = await res.json();

message.style.color="green";
message.innerText=data.message;

}catch(err){

message.style.color="red";
message.innerText="Signup failed";

}

});
