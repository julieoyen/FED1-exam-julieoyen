document.addEventListener("DOMContentLoaded", function () {
  const username = sessionStorage.getItem("userName");
  document.getElementById("username").textContent = username;
  fetchPosts();

  function fetchPosts() {
    const postsUrl = `https://v2.api.noroff.dev/blog/posts/${username}`;
    fetch(postsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => displayPosts(data.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }

  function displayPosts(posts) {
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";
    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.innerHTML = `
              <h3>${post.title}</h3>
              <p class="indexImg">${
                post.media
                  ? `<img src="${post.media.url}" alt="${post.media.alt}";">`
                  : ""
              }</p>
              <div class="buttons">
              <button  onclick="location.href='/post/edit.html?postId=${
                post.id
              }'">Edit</button>
              <button onclick="deletePost('${post.id}')">Delete</button>
              </div>
          `;
      container.appendChild(postElement);
    });
  }

  window.deletePost = function (id) {
    const deleteUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${id}`;
    if (confirm("Are you sure you want to delete this post?")) {
      fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        },
      }).then((response) => {
        if (response.ok) {
          fetchPosts();
          alert("Post deleted successfully!");
        } else {
          alert("Failed to delete post.");
        }
      });
    }
  };
});
