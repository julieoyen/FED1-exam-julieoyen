document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("postId");
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");

  fetchPostDetails();

  function fetchPostDetails() {
    const postUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    fetch(postUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("title").value = data.data.title;
        document.getElementById("body").value = data.data.body;
      })
      .catch((error) => console.error("Error fetching post details:", error));
  }

  window.submitEdit = function () {
    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;
    const editUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    fetch(editUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body }),
    })
      .then((response) => {
        if (response.ok) {
          alert("Post updated successfully!");
          window.location.href = "/post/index.html";
          alert("Failed to update post.");
        }
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        alert(
          "Error updating post. Please check the console for more information."
        );
      });
  };
});
