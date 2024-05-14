const blogPage = "https://v2.api.noroff.dev/blog/posts/juliebertine/";
const content = document.getElementById("posts-container");
const paginationContent = document.getElementById("posts-pagination");
const tagFilter = document.getElementById("tag-filter");
const searchInput = document.getElementById("search-input");
const carousel = document.querySelector(".carousel");
let currentSlide = 0;
let currentPage = 0;
let allPosts = [];
const postsPerPage = 12;

function append(data) {
  allPosts = data.data;
  populateTags();
  displayPosts(allPosts);
}

function displayPosts(posts) {
  content.innerHTML = "";
  posts.forEach((post, index) => {
    const container = document.createElement("div");
    container.classList.add("single-blog-post");
    container.innerHTML = `
    <div class="overlay">
      <h2 id="carouselTitle">${post.title}</h2>
      ${
        post.media
          ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}" ></a>`
          : ""
      }
    </div>`;
    content.appendChild(container);
  });
  displayPaginatedPosts(posts);
}

function displayPaginatedPosts(posts) {
  paginationContent.innerHTML = "";
  const startIndex = currentPage * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  posts.slice(startIndex, endIndex).forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("single-pagination-post");
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      ${
        post.media
          ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}" style="width:100%;"></a>`
          : ""
      }
    `;
    paginationContent.appendChild(postDiv);
  });
}

function moveSlide(step) {
  const slides = document.querySelectorAll(".single-blog-post");
  currentSlide += step;

  if (currentSlide < 0) {
    currentSlide = 0;
  } else if (currentSlide + 3 > slides.length) {
    currentSlide = 0;
  }

  currentPage = Math.floor(currentSlide / 3);
  const newTransform = (-currentSlide * 100) / 3;
  content.style.transform = `translateX(${newTransform}%)`;
}

function changePage(step) {
  const totalPosts = Math.min(12, allPosts.length);
  const numberOfPages = Math.ceil(totalPosts / postsPerPage);
  currentPage += step;
  if (currentPage < 0) {
    currentPage = 0;
  } else if (currentPage >= numberOfPages) {
    currentPage = numberOfPages - 1;
  }
  displayPaginatedPosts(allPosts.slice(0, 12));
}

function populateTags() {
  const tags = new Set();
  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tag.trim()) {
          tags.add(tag);
        }
      });
    }
  });
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

function filterPostsByTag() {
  const selectedTag = tagFilter.value;
  if (selectedTag === "all") {
    displayPosts(allPosts);
    carousel.style.display = "block";
  } else {
    const filteredPosts = allPosts.filter(
      (post) => post.tags && post.tags.includes(selectedTag)
    );
    displayPosts(filteredPosts);
    carousel.style.display = "none";
  }
}

function searchPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    const filteredPosts = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        (post.content && post.content.toLowerCase().includes(searchTerm))
    );
    displayPosts(filteredPosts);
    carousel.style.display = "none";
  } else {
    displayPosts(allPosts);
    carousel.style.display = "block";
  }
}

fetch(blogPage)
  .then((response) => response.json())
  .then((data) => append(data))
  .catch((error) => {
    console.error("Error fetching data:", error);
    content.innerHTML =
      "<p>Error fetching the blog posts. Please try again later.</p>";
  });
