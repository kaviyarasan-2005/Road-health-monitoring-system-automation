const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {

      message.style.color = "green";
      message.innerText = "Login successful";

      setTimeout(() => {

        if (data.role === "admin") {
          window.location.href = "./admin/admin.html";
        } 
        else if (data.role === "public") {
          window.location.href = "./user/public.html";
        }

      }, 1000);

    } else {

      message.style.color = "red";
      message.innerText = data.message || "Invalid login";

    }

  } catch (err) {

    console.error(err);
    message.style.color = "red";
    message.innerText = "Server error";

  }

});