document.addEventListener("DOMContentLoaded", () => {
  const postId = getUrlParameter("ID");
  const blogPostApi = `https://v2.api.noroff.dev/blog/posts/juliebertine/${postId}`;
  const postContent = document.getElementById("post-content");
  const backButton = document.getElementById("back-button");

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  async function fetchBlogPost() {
    try {
      const response = await fetch(blogPostApi);
      if (!response.ok) {
        throw new Error("Kunne ikke hente oppskrifter");
      }
      const data = await response.json();
      displayBlogPost(data.data);
    } catch (error) {
      console.error("Feil ved henting av data:", error);
      postContent.innerHTML =
        "<p class='error' role='alert'>Feil ved henting av oppskrifter. Vennligst prøv igjen senere..</p>";
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
        "<p class='error' role='alert'>Innleggdata er ufullstendige. Vennligst prøv igjen senere.</p>";
      return;
    }

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
          "Les våre siste oppskrifter på Eating Unprocessed, Living Well. Oppdag sunne oppskrifter, tips m.m. som kan hjelpe deg på veien til en sunnere livvstil."
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
      ${ingredientsHTML ? `<h2>Ingredienser</h2>${ingredientsHTML}` : ""}
      ${
        instructions
          ? `<h2>Fremgangsmåte</h2><div role="document"><p>${instructions.replace(
              /\n/g,
              "</p><p>"
            )}</p></div>`
          : ""
      }
      <div class="bottom" role="contentinfo">
      ${
        post.tags && post.tags.length
          ? `<p>Passer til: <br> ${post.tags.join(", ")}</p>`
          : ""
      }     
      <p>Publisert: <br> ${new Date(post.created).toLocaleDateString()}</p>
      <p>Forfatter: <br> ${post.author.name}</p>
      </div>
    `;
    postContent.appendChild(container);
  }

  fetchBlogPost();
});
