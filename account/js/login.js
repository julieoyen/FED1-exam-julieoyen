document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");

  if (!loginForm || !email || !password || !errorMessage) {
    console.error("Obligatoriske felt mangler!");
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
      "Vennligst fyll inn både e-post og passord"
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
        "Innlogging feilet: " + (data.message || "Feil e-mail eller passord")
      );
    }
  } catch (error) {
    console.error("Feil under pålogging:", error);
    showErrorMessage(
      errorMessageElement,
      "Det oppstod en feil under pålogging. Vennligst prøv igjen senere."
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
