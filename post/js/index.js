document.addEventListener("DOMContentLoaded", () => {
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");
  const usernameElement = document.getElementById("username");
  const postsContainer = document.getElementById("postsContainer");
  const paginationControls = document.getElementById("paginationControls");

  let posts = [];
  let currentPage = 1;
  const postsPerPage = 12;

  if (username && authToken) {
    usernameElement.textContent = username;
    fetchPosts(username, authToken);
  } else {
    alert("Bruker ikke autentisert. Vennligst logg inn.");
    window.location.href = "/account/login.html";
    return;
  }

  async function fetchPosts(username, authToken) {
    const postsUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;
    try {
      const response = await fetch(postsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Kunne ikke hente oppskrifter");
      }
      const data = await response.json();
      posts = data.data;
      displayPage(currentPage);
      setupPagination();
    } catch (error) {
      console.error("Feil ved henting av oppskrifter", error);
      postsContainer.innerHTML =
        "<p class='error' role='alert'>Feil ved henting av oppskrifter. Vennligst prøv igjen senere.</p>";
      postsContainer.focus();
    }
  }

  function displayPage(page) {
    postsContainer.innerHTML = "";
    const start = (page - 1) * postsPerPage;
    const end = page * postsPerPage;
    const paginatedPosts = posts.slice(start, end);

    if (!paginatedPosts.length) {
      postsContainer.innerHTML = "<p>Ingen oppskrifter tilgjengelige</p>";
      return;
    }

    paginatedPosts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.setAttribute("role", "article");
      postElement.innerHTML = `
              <div class="posts">
                  <h4>${post.title}</h4>
                  ${
                    post.media
                      ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}"></a>`
                      : ""
                  }
              </div>
              <div class="buttons" role="group" aria-label="Post actions">
                  <button class="edit-btn" data-id="${post.id}">Rediger</button>
                  <button class="delete-btn" data-id="${post.id}">Slett</button>
              </div>
          `;
      postsContainer.appendChild(postElement);
    });
    addEventListeners();
  }

  function setupPagination() {
    paginationControls.innerHTML = "";
    const pageCount = Math.ceil(posts.length / postsPerPage);

    for (let i = 1; i <= pageCount; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      button.addEventListener("click", () => {
        currentPage = i;
        displayPage(currentPage);
        updatePaginationButtons();
      });
      paginationControls.appendChild(button);
    }
    updatePaginationButtons();
  }

  function updatePaginationButtons() {
    Array.from(paginationControls.children).forEach((button, index) => {
      if (index + 1 === currentPage) {
        button.setAttribute("disabled", "disabled");
      } else {
        button.removeAttribute("disabled");
      }
    });
  }

  function addEventListeners() {
    postsContainer.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const postId = button.getAttribute("data-id");
        window.location.href = `/post/edit.html?postId=${postId}`;
      });
    });

    postsContainer.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const postId = button.getAttribute("data-id");
        await deletePost(postId);
      });
    });
  }

  async function deletePost(postId) {
    const deleteUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    if (confirm("Er du sikker på at du vil slette oppskriften?")) {
      try {
        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          alert("Oppskrift slettet");
          fetchPosts(username, authToken);
        } else {
          alert("Kunne ikke slette oppskrift");
        }
      } catch (error) {
        console.error("Feil ved sletting av oppskrift", error);
        alert("Feil ved sletting av oppskrift " + error.message);
      }
    }
  }

  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", () => {
    if (confirm("Er du sikker på at du vil logge ut?")) {
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("authToken");
      alert("Du er logget ut.");
      window.location.href = "/account/login.html";
    }
  });
});
