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

async function fetchPosts() {
  try {
    const response = await fetch(blogPage);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    allPosts = data.data;
    append();
  } catch (error) {
    console.error("Error fetching data:", error);
    content.innerHTML =
      "<p>Error fetching the blog posts. Please try again later.</p>";
  }
}

function append() {
  populateTags();
  displayPosts(allPosts);
}

function createPostHTML(post) {
  return `
    <div class="overlay">
      <h2 id="carouselTitle">${post.title}</h2>
      ${
        post.media
          ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}"></a>`
          : ""
      }
    </div>`;
}

function displayPosts(posts) {
  content.innerHTML = "";
  const fragment = document.createDocumentFragment();
  posts.forEach((post) => {
    const container = document.createElement("div");
    container.classList.add("single-blog-post");
    container.innerHTML = createPostHTML(post);
    fragment.appendChild(container);
  });
  content.appendChild(fragment);
  displayPaginatedPosts(posts);
}

function displayPaginatedPosts(posts) {
  paginationContent.innerHTML = "";
  const fragment = document.createDocumentFragment();
  const startIndex = currentPage * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, posts.length);
  posts.slice(startIndex, endIndex).forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("single-pagination-post");
    postDiv.innerHTML = createPostHTML(post);
    fragment.appendChild(postDiv);
  });
  paginationContent.appendChild(fragment);
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
  const numberOfPages = Math.ceil(allPosts.length / postsPerPage);
  currentPage = Math.max(0, Math.min(currentPage + step, numberOfPages - 1));
  displayPaginatedPosts(allPosts);
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
  const filteredPosts =
    selectedTag === "all"
      ? allPosts
      : allPosts.filter((post) => post.tags && post.tags.includes(selectedTag));
  displayPosts(filteredPosts);
  carousel.style.display = selectedTag === "all" ? "block" : "none";
}

function searchPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredPosts = searchTerm
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          (post.content && post.content.toLowerCase().includes(searchTerm))
      )
    : allPosts;
  displayPosts(filteredPosts);
  carousel.style.display = searchTerm ? "none" : "block";
}

fetchPosts();
