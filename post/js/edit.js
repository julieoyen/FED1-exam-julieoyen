document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("postId");
  const username = sessionStorage.getItem("userName");
  const authToken = sessionStorage.getItem("authToken");

  if (!username || !authToken) {
    alert("User not authenticated. Please log in.");
    window.location.href = "/login.html";
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
        document.getElementById("title").value = post.title;
        document.getElementById("body").value = post.body
          .replace(/<ul>[\s\S]*?<\/ul>/, "")
          .trim();
        document.getElementById("mediaUrl").value = post.media
          ? post.media.url
          : "";
        document.getElementById("mediaAlt").value = post.media
          ? post.media.alt
          : "";
        document.getElementById("tags").value = post.tags.join(", ");

        const listItemsMatch = post.body.match(/<ul>[\s\S]*?<\/ul>/);
        if (listItemsMatch) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(listItemsMatch[0], "text/html");
          const listItems = doc.querySelectorAll("li");
          listItems.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.textContent = item.textContent;
            addDeleteButton(listItem);
            document.getElementById("list").appendChild(listItem);
          });
        }
      })
      .catch((error) => console.error("Error fetching post details:", error));
  }

  window.submitEdit = function (event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const body = document.getElementById("body").value;
    const tags = document
      .getElementById("tags")
      .value.split(",")
      .map((tag) => tag.trim());
    const mediaUrl = document.getElementById("mediaUrl").value;
    const mediaAlt = document.getElementById("mediaAlt").value;

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
          displayNotification("Post updated successfully!", true);
          setTimeout(() => {
            window.location.href = "/post/index.html";
          }, 2000);
        } else {
          return response.json().then((data) => {
            displayNotification(
              "Failed to update post: " + data.message,
              false
            );
          });
        }
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        displayNotification(
          "Error updating post. Please check the console for more information.",
          false
        );
      });
  };

  window.addListItem = function () {
    const listItemInput = document.getElementById("listItem");
    const listItemValue = listItemInput.value.trim();

    if (listItemValue) {
      const listItem = document.createElement("li");
      listItem.textContent = listItemValue;
      addDeleteButton(listItem);
      document.getElementById("list").appendChild(listItem);
      listItemInput.value = "";
    }
  };

  function addDeleteButton(listItem) {
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.onclick = () => listItem.remove();
    listItem.appendChild(deleteButton);
  }

  function displayNotification(message, success) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.backgroundColor = success ? "#1E6B1A" : "#D32F2F";
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, 3000);
  }
});
