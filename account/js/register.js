document.addEventListener("DOMContentLoaded", () => {
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

  form.addEventListener("submit", (event) =>
    handleFormSubmit(
      event,
      email,
      username,
      password,
      repeatPassword,
      avatarURL,
      errorMessage
    )
  );

  const loginBtn = document.getElementById("loginBTN");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "/account/login.html";
    });
  }
});

function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@stud\.noroff\.no$/;
  if (!emailPattern.test(email.value)) {
    showFieldError(
      "email-error",
      "Invalid email address. Must be @stud.noroff.no"
    );
    return false;
  }
  hideFieldError("email-error");
  return true;
}

function validatePasswords(password, repeatPassword) {
  if (password.value.length < 8) {
    showFieldError(
      "password-error",
      "Password must be at least 8 characters long."
    );
    return false;
  }
  if (password.value !== repeatPassword.value) {
    showFieldError("repeatPassword-error", "Passwords do not match!");
    return false;
  }
  hideFieldError("password-error");
  hideFieldError("repeatPassword-error");
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

async function submitRegistration(payload, errorMessageElement) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    handleResponse(data, errorMessageElement);
  } catch (error) {
    handleNetworkError(error, errorMessageElement);
  }
}

function handleResponse(data, errorMessageElement) {
  if (data.status && data.status === "Bad Request") {
    showErrorMessage(
      errorMessageElement,
      "Registration failed: " +
        data.errors.map((error) => error.message).join(", ")
    );
  } else if (data.data && data.data.email) {
    alert("Registration successful! Redirecting to login page...");
    window.location.href = "/account/login.html";
  } else {
    showErrorMessage(
      errorMessageElement,
      "Registration failed. Please check the information you provided."
    );
  }
}

function handleNetworkError(error, errorMessageElement) {
  console.error("Network Error:", error);
  showErrorMessage(
    errorMessageElement,
    "Registration failed due to network error!"
  );
}

function showErrorMessage(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = "block";
  }
}

function clearErrorMessages(element) {
  if (element) {
    element.textContent = "";
    element.style.display = "none";
  }
}

function showFieldError(fieldId, message) {
  const fieldError = document.getElementById(fieldId);
  if (fieldError) {
    fieldError.textContent = message;
    fieldError.style.display = "block";
  }
}

function hideFieldError(fieldId) {
  const fieldError = document.getElementById(fieldId);
  if (fieldError) {
    fieldError.textContent = "";
    fieldError.style.display = "none";
  }
}

async function handleFormSubmit(
  event,
  email,
  username,
  password,
  repeatPassword,
  avatarURL,
  errorMessageElement
) {
  event.preventDefault();

  clearErrorMessages(errorMessageElement);

  if (!validateEmail(email) || !validatePasswords(password, repeatPassword)) {
    return;
  }

  const payload = constructPayload(email, username, password, avatarURL);
  await submitRegistration(payload, errorMessageElement);
}
