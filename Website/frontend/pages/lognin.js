const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e)=>{

e.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try{

const res = await fetch("http://localhost:3000/api/auth/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email,password})
});

const data = await res.json();

if(data.message==="Login successful"){

message.style.color="green";
message.innerText="Login successful";

window.location.href="../admin/admin.html";

}else{

message.style.color="red";
message.innerText=data.message;

}

}catch(err){

message.style.color="red";
message.innerText="Server error";

}

});