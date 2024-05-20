document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("postId");
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");

  if (!username || !authToken) {
    alert("User not authenticated. Please log in.");
    window.location.href = "/login.html";
    return;
  }

  const titleElement = document.getElementById("title");
  const bodyElement = document.getElementById("body");
  const mediaUrlElement = document.getElementById("mediaUrl");
  const mediaAltElement = document.getElementById("mediaAlt");
  const tagsElement = document.getElementById("tags");
  const listElement = document.getElementById("list");
  const listItemInput = document.getElementById("listItem");
  const editForm = document.getElementById("editForm");
  const addListItemButton = document.getElementById("addListItemButton");

  fetchPostDetails();

  async function fetchPostDetails() {
    const postUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    try {
      const response = await fetch(postUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch post details");
      }
      const data = await response.json();
      populateForm(data.data);
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  }

  function populateForm(post) {
    if (!post) {
      alert("Post data is not available. Please try again.");
      return;
    }
    titleElement.value = post.title;
    bodyElement.value = post.body.replace(/<ul>[\s\S]*?<\/ul>/, "").trim();
    mediaUrlElement.value = post.media ? post.media.url : "";
    mediaAltElement.value = post.media ? post.media.alt : "";
    tagsElement.value = post.tags.join(", ");

    const listItemsMatch = post.body.match(/<ul>[\s\S]*?<\/ul>/);
    if (listItemsMatch) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(listItemsMatch[0], "text/html");
      const listItems = doc.querySelectorAll("li");
      listItems.forEach((item) => {
        addListItem(item.textContent);
      });
    }
  }

  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitEdit();
  });

  async function submitEdit() {
    const title = titleElement.value.trim();
    const body = bodyElement.value.trim();
    const tags = tagsElement.value.split(",").map((tag) => tag.trim());
    const mediaUrl = mediaUrlElement.value.trim();
    const mediaAlt = mediaAltElement.value.trim();

    const listItems = listElement.querySelectorAll("li");
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

    const editUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    try {
      const response = await fetch(editUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (response.ok) {
        alert("Post updated successfully!");
        window.location.href = "/post/index.html";
      } else {
        const data = await response.json();
        alert("Failed to update post: " + data.message);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert(
        "Error updating post. Please check the console for more information."
      );
    }
  }

  addListItemButton.addEventListener("click", () => {
    const listItemValue = listItemInput.value.trim();
    if (listItemValue) {
      addListItem(listItemValue);
      listItemInput.value = "";
    }
  });

  function addListItem(text) {
    const listItem = document.createElement("li");
    listItem.textContent = text;
    addDeleteButton(listItem);
    listElement.appendChild(listItem);
  }

  function addDeleteButton(listItem) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => listItem.remove());
    listItem.appendChild(deleteButton);
  }
});
