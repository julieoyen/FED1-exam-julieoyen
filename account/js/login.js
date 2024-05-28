document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");

  if (!loginForm || !email || !password || !errorMessage) {
    console.error("Essential form elements are missing!");
    return;
  }

  loginForm.addEventListener("submit", (event) =>
    handleLogin(event, email, password, errorMessage)
  );

  const registerBtn = document.getElementById("registerBTN");
  if (registerBtn) {
    registerBtn.addEventListener("click", () => {
      window.location.href = "/account/register.html";
    });
  }
});

async function handleLogin(
  event,
  emailElement,
  passwordElement,
  errorMessageElement
) {
  event.preventDefault();

  const email = emailElement.value.trim();
  const password = passwordElement.value.trim();
  const loginUrl = "https://v2.api.noroff.dev/auth/login";

  clearErrorMessages(errorMessageElement);

  if (!email || !password) {
    showErrorMessage(
      errorMessageElement,
      "Please enter both email and password."
    );
    emailElement.focus();
    return;
  }

  try {
    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.data && data.data.accessToken) {
      sessionStorage.setItem("authToken", data.data.accessToken);
      sessionStorage.setItem("userName", data.data.name);
      sessionStorage.setItem(
        "userAvatar",
        data.data.avatar ? data.data.avatar.url : ""
      );
      window.location.href = "/post/index.html";
    } else {
      showErrorMessage(
        errorMessageElement,
        "Login failed: " + (data.message || "Incorrect email or password")
      );
    }
  } catch (error) {
    console.error("Error during login:", error);
    showErrorMessage(
      errorMessageElement,
      "An error occurred during login. Please try again later."
    );
  }
}

function showErrorMessage(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
    element.focus();
  }
}

function clearErrorMessages(element) {
  if (element) {
    element.textContent = "";
    element.style.display = "none";
  }
}
