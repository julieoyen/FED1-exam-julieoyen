document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const email = document.getElementById("email");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const repeatPassword = document.getElementById("repeatPassword");
  const avatarURL = document.getElementById("avatar");
  const errorMessage = document.getElementById("error-message");

  if (!form || !email || !username || !password || !repeatPassword) {
    console.error("Essential form elements are missing!");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    if (!validatePasswords(password, repeatPassword)) {
      return;
    }

    const payload = constructPayload(email, username, password, avatarURL);
    submitRegistration(payload);
  });
});

function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
  if (!emailPattern.test(email.value)) {
    alert("Invalid email address. Must be @stud.noroff.no");
    return false;
  }
  return true;
}

function validatePasswords(password, repeatPassword) {
  if (password.value.length < 8) {
    alert("Password must be at least 8 characters long.");
    return false;
  }
  if (password.value !== repeatPassword.value) {
    alert("Passwords do not match!");
    return false;
  }
  return true;
}

function constructPayload(email, username, password, avatarURL) {
  return {
    email: email.value,
    name: username.value,
    password: password.value,
    ...(avatarURL && avatarURL.value
      ? {
          avatar: {
            url: avatarURL.value,
            alt: "User provided avatar",
          },
        }
      : {}),
  };
}

function submitRegistration(payload) {
  fetch("https://v2.api.noroff.dev/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then(handleResponse)
    .catch(handleNetworkError);
}

function handleResponse(data) {
  if (data.status && data.status === "Bad Request") {
    alert(
      "Registration failed: " +
        data.errors.map((error) => error.message).join(", ")
    );
  } else if (data.data && data.data.email) {
    alert("Registration successful! Redirecting to login page...");
    window.location.href = "/account/login.html";
  } else {
    alert("Registration failed. Please check the data you provided.");
  }
}

function handleNetworkError(error) {
  console.error("Network Error:", error);
  alert("Registration failed due to network error!");
}

const loginBtn = document.getElementById("loginBTN");
loginBtn.addEventListener("click", function () {
  window.location.href = "/account/login.html";
});
