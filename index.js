const blogPage = "https://v2.api.noroff.dev/blog/posts/juliebertine/";
const content = document.getElementById("posts-container");

function append(data) {
  data.data.forEach((post) => {
    const container = document.createElement("div");
    container.classList.add("single-blog-post");
    container.innerHTML = `
            <h2>${post.title}</h2>
            ${post.tag ? `<p>Tag: ${post.tag}</p>` : ""}
            ${
              post.media
                ? `<img src="${post.media.url}" alt="${post.media.alt}">`
                : ""
            }
            <p>Author: ${post.author.name}</p>
            <a href="/post/blog-post.html?ID=${post.id}">Click to read more</a>
        `;
    content.appendChild(container);
  });
}

fetch(blogPage)
  .then((response) => response.json())
  .then((data) => append(data))
  .catch((error) => {
    console.error("Error fetching data:", error);
    const div = document.createElement("div");
    div.textContent = "Error fetching data.";
    content.appendChild(div);
  });
