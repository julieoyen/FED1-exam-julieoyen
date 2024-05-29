document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("postId");
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");

  if (!username || !authToken) {
    alert("User not authenticated. Please log in.");
    window.location.href = "/account/login.html";
    return;
  }

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
        const post = data.data;
        setValue("title", post.title);
        setValue("body", post.body.replace(/<ul>[\s\S]*?<\/ul>/, "").trim());
        setValue("mediaUrl", post.media ? post.media.url : "");
        setValue("mediaAlt", post.media ? post.media.alt : "");
        setValue("tags", post.tags.join(", "));

        const listItemsMatch = post.body.match(/<ul>[\s\S]*?<\/ul>/);
        if (listItemsMatch) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(listItemsMatch[0], "text/html");
          const listItems = doc.querySelectorAll("li");
          listItems.forEach((item) => {
            const listItem = createListItem(item.textContent);
            document.getElementById("list").appendChild(listItem);
          });
        }
      })
      .catch((error) => console.error("Error fetching post details:", error));
  }

  function setValue(id, value) {
    document.getElementById(id).value = value;
  }

  window.submitEdit = function (event) {
    event.preventDefault();
    const title = getValue("title");
    const body = getValue("body");
    const tags = getValue("tags")
      .split(",")
      .map((tag) => tag.trim());
    const mediaUrl = getValue("mediaUrl");
    const mediaAlt = getValue("mediaAlt");

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

    const editUrl = `https://v2.api.noroff.dev/blog/posts/${username}/${postId}`;
    fetch(editUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => {
        if (response.ok) {
          showSuccessMessage();
        } else {
          return response.json().then((data) => {
            console.error("Failed to update post: " + data.message);
          });
        }
      })
      .catch((error) => {
        console.error("Error updating post:", error);
      });
  };

  window.addListItem = function () {
    const listItemInput = document.getElementById("listItem");
    const listItemValue = listItemInput.value.trim();

    if (listItemValue) {
      const listItem = createListItem(listItemValue);
      document.getElementById("list").appendChild(listItem);
      listItemInput.value = "";
    }
  };

  function createListItem(text) {
    const listItem = document.createElement("li");
    listItem.textContent = text;
    addDeleteButton(listItem);
    return listItem;
  }

  function addDeleteButton(listItem) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = () => listItem.remove();
    listItem.appendChild(deleteButton);
  }

  window.cancelEdit = function () {
    window.location.href = "/post/index.html";
  };

  function getValue(id) {
    return document.getElementById(id).value;
  }

  function showSuccessMessage() {
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "block";
    setTimeout(() => {
      successMessage.style.display = "none";
      window.location.href = "/post/index.html";
    }, 3000);
  }
});
