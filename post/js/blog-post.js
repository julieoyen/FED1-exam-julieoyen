document.addEventListener("DOMContentLoaded", () => {
  const postId = getUrlParameter("ID");
  const blogPostApi = `https://v2.api.noroff.dev/blog/posts/juliebertine/${postId}`;
  const postContent = document.getElementById("post-content");

  async function fetchBlogPost() {
    try {
      const response = await fetch(blogPostApi);
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      const data = await response.json();
      displayBlogPost(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      postContent.innerHTML =
        "<p class='error' role='alert'>Error fetching the blog post. Please try again later.</p>";
      postContent.focus();
    }
  }

  function getUrlParameter(name) {
    const regex = new RegExp(`[?&]${name.replace(/[[\]]/g, "\\$&")}=([^&#]*)`);
    const results = regex.exec(window.location.search);
    return results ? decodeURIComponent(results[1].replace(/\+/g, " ")) : "";
  }

  function displayBlogPost(post) {
    if (!post || !post.title || !post.body || !post.author) {
      postContent.innerHTML =
        "<p class='error' role='alert'>Incomplete post data. Please try again later.</p>";
      return;
    }

    // Update document title and meta tags
    document.title = `${post.title} - Eating Unprocessed`;
    document
      .querySelector('meta[name="title"]')
      .setAttribute(
        "content",
        `${post.title} - Eating Unprocessed, Living well`
      );
    document
      .querySelector('meta[name="description"]')
      .setAttribute(
        "content",
        post.description ||
          "Read our latest blog post on Eating Unprocessed. Discover healthy recipes, tips, and more to help you live a healthier lifestyle."
      );

    const container = document.createElement("article");
    container.setAttribute("role", "article");

    const ingredientsMatch = post.body.match(/<ul>[\s\S]*?<\/ul>/);
    const ingredientsHTML = ingredientsMatch ? ingredientsMatch[0] : "";
    const instructions = post.body.replace(ingredientsHTML, "").trim();

    container.innerHTML = `
      <h1>${post.title}</h1>
      ${
        post.media
          ? `<img src="${post.media.url}" alt="${post.media.alt}" class="postImg">`
          : ""
      }
      ${ingredientsHTML ? `<h2>Ingredients</h2>${ingredientsHTML}` : ""}
      ${
        instructions
          ? `<h2>Instructions</h2><div role="document"><p>${instructions.replace(
              /\n/g,
              "</p><p>"
            )}</p></div>`
          : ""
      }
      <div class="bottom" role="contentinfo">
      ${
        post.tags && post.tags.length
          ? `<p>Tag: ${post.tags.join(", ")}</p>`
          : ""
      }     
      <p>Posted: ${new Date(post.created).toLocaleDateString()}</p>
      <p>Author: ${post.author.name}</p>
      </div>
    `;
    postContent.appendChild(container);
  }

  fetchBlogPost();
});
