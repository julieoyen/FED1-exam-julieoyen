document
  .getElementById("newPostForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const mediaUrl = document.getElementById("mediaUrl").value;
    const mediaAlt = document.getElementById("mediaAlt").value;
    const postUrl = `https://v2.api.noroff.dev/blog/posts/${sessionStorage.getItem(
      "userName"
    )}`;

    const postData = {
      title,
      body,
      tags,
      media: mediaUrl ? { url: mediaUrl, alt: mediaAlt } : undefined,
    };

    fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          alert("New post created successfully!");
          window.location.href = "/post/index.html"; // Redirect back to the posts list
        } else {
          alert("Failed to create post: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error creating new post:", error);
        alert("Error creating post: " + error.message);
      });
  });
