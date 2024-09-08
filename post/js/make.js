document.addEventListener("DOMContentLoaded", () => {
  const newPostForm = document.getElementById("newPostForm");
  const list = document.getElementById("list");
  const addListItemButton = document.getElementById("addListItemButton");
  const errorMessageElement = document.getElementById("error-message");

  if (!newPostForm || !list || !addListItemButton || !errorMessageElement) {
    console.error("Essensielle elementer mangler i DOM-en.");
    return;
  }

  newPostForm.addEventListener("submit", (event) =>
    handleFormSubmit(event, errorMessageElement)
  );
  addListItemButton.addEventListener("click", addListItem);
  list.addEventListener("click", handleListClick);
});

function handleFormSubmit(event, errorMessageElement) {
  event.preventDefault();

  const userName = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");

  if (!userName || !authToken) {
    showError(
      errorMessageElement,
      "Bruker ikke autentisert. Vennligst logg inn."
    );
    window.location.href = "/account/login.html";
    return;
  }

  const title = document.getElementById("title").value.trim();
  const body = document.getElementById("body").value.trim();
  const tags = document
    .getElementById("tags")
    .value.split(",")
    .map((tag) => tag.trim());
  const mediaUrl = document.getElementById("mediaUrl").value.trim();
  const mediaAlt = document.getElementById("mediaAlt").value.trim();

  if (!title || !body) {
    showError(errorMessageElement, "Tittel og tekst er obligatorisk");
    return;
  }

  const postUrl = `https://v2.api.noroff.dev/blog/posts/${userName}`;

  const listItems = document.querySelectorAll("#list li");
  let listHTML = "<ul>";
  listItems.forEach((item) => {
    listHTML += `<li>${item.firstChild.textContent}</li>`;
  });
  listHTML += "</ul>";

  const postData = {
    title,
    body: listHTML + body,
    tags,
    media: mediaUrl ? { url: mediaUrl, alt: mediaAlt } : undefined,
  };

  createPost(postUrl, authToken, postData, errorMessageElement);
}

async function createPost(postUrl, authToken, postData, errorMessageElement) {
  try {
    const response = await fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
    if (data.data) {
      showSuccessMessage();
    } else {
      showError(
        errorMessageElement,
        "Kunne ikke opprette oppskrift: " + data.message
      );
    }
  } catch (error) {
    console.error("Feil ved oppretting av ny oppskrift:", error);
    showError(
      errorMessageElement,
      "Feil ved oppretting av ny oppskrift:" + error.message
    );
  }
}

function addListItem() {
  const listItemInput = document.getElementById("listItem");
  const listItemValue = listItemInput.value.trim();

  if (listItemValue) {
    const listItem = document.createElement("li");
    listItem.textContent = listItemValue;
    addDeleteButton(listItem);
    document.getElementById("list").appendChild(listItem);
    listItemInput.value = "";
  }
}

function addDeleteButton(listItem) {
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Slett";
  deleteButton.className = "delete-btn";
  deleteButton.addEventListener("click", () => listItem.remove());
  listItem.appendChild(deleteButton);
}

function handleListClick(event) {
  if (event.target.classList.contains("delete-btn")) {
    event.target.parentElement.remove();
  }
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}

function showSuccessMessage() {
  const successMessage = document.getElementById("successMessage");
  successMessage.style.display = "block";
  setTimeout(() => {
    successMessage.style.display = "none";
    window.location.href = "/post/index.html";
  }, 2000);
}

window.cancelEdit = function () {
  window.location.href = "/post/index.html";
};
