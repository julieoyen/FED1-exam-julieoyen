document.addEventListener("DOMContentLoaded", () => {
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");
  const usernameElement = document.getElementById("username");
  const postsContainer = document.getElementById("postsContainer");

  if (username && authToken) {
    usernameElement.textContent = username;
    fetchPosts(username, authToken);
  } else {
    alert("User not authenticated. Please log in.");
    window.location.href = "/login.html";
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
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      displayPosts(data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      postsContainer.innerHTML =
        "<p class='error'>Error fetching posts. Please try again later.</p>";
    }
  }

  function displayPosts(posts) {
    postsContainer.innerHTML = "";
    if (!posts.length) {
      postsContainer.innerHTML = "<p>No posts available.</p>";
      return;
    }
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        <div>
          <h3>${post.title}</h3>
          ${
            post.media
              ? `<a target="_blank" href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}"></a>`
              : ""
          }
        </div>
        <div class="buttons">
          <button class="edit-btn" data-id="${post.id}">Edit</button>
          <button class="delete-btn" data-id="${post.id}">Delete</button>
        </div>
      `;
      postsContainer.appendChild(postElement);
    });
    addEventListeners();
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
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (response.ok) {
          alert("Post deleted successfully!");
          fetchPosts(username, authToken);
        } else {
          alert("Failed to delete post.");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post: " + error.message);
      }
    }
  }
});
