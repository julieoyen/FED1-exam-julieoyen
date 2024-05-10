function getUrlParameter(name) {
  const regex = new RegExp(`[?&]${name.replace(/[[\]]/g, "\\$&")}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
}

const postId = getUrlParameter("ID");
const blogPostApi = `https://v2.api.noroff.dev/blog/posts/juliebertine/${postId}`;

const postContent = document.getElementById("post-content");

fetch(blogPostApi)
  .then((response) => response.json())
  .then((data) => {
    const post = data.data;
    const container = document.createElement("div");

    container.innerHTML = `
          <h2>${post.title}</h2>
          ${
            post.media
              ? `<img src="${post.media.url}" alt="${post.media.alt}" class="postImg">`
              : ""
          }
          <p>${post.body}</p>
          ${
            post.tags && post.tags.length
              ? `<p>Tag: ${post.tags.join(", ")}</p>`
              : ""
          }
          <p>Author: ${post.author.name}</p>
          <p>Posted: ${post.created}</p>
      `;
    postContent.appendChild(container);
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    postContent.innerHTML =
      "<p>Error fetching the blog post. Please try again later.</p>";
  });
