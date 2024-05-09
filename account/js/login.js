document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const loginUrl = "https://v2.api.noroff.dev/auth/login";

    fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.accessToken) {
          sessionStorage.setItem("authToken", data.data.accessToken);
          sessionStorage.setItem("userName", data.data.name);
          sessionStorage.setItem("userAvatar", data.data.avatar.url);
          window.location.href = "/post/index.html";
        } else {
          alert("Login failed: " + (data.message || "Unknown error"));
        }
      })
      .catch((error) => {
        console.error("Error during login:", error);
      });
  });
