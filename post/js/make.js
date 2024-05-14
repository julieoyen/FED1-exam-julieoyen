document
  .getElementById("newPostForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const userName = sessionStorage.getItem("userName");
    const authToken = sessionStorage.getItem("authToken");

    if (!userName || !authToken) {
      alert("User not authenticated. Please log in.");
      return;
    }

    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const mediaUrl = document.getElementById("mediaUrl").value;
    const mediaAlt = document.getElementById("mediaAlt").value;
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

    fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          alert("New post created successfully!");
          window.location.href = "/post/index.html";
        } else {
          alert("Failed to create post: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error creating new post:", error);
        alert("Error creating post: " + error.message);
      });
  });

function addListItem() {
  const listItemInput = document.getElementById("listItem");
  const listItemValue = listItemInput.value.trim();

  if (listItemValue) {
    const listItem = document.createElement("li");
    listItem.textContent = listItemValue;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = () => listItem.remove();

    listItem.appendChild(deleteButton);
    document.getElementById("list").appendChild(listItem);
    listItemInput.value = "";
  }
}
