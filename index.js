// Define constants for DOM elements and initial settings
const blogPage = "https://v2.api.noroff.dev/blog/posts/juliebertine/";
const content = document.getElementById("posts-container");
const paginationContent = document.getElementById("posts-pagination");
const tagFilter = document.getElementById("tag-filter");
const searchInput = document.getElementById("search-input");
const carousel = document.querySelector(".carousel");
const loadingIndicator = document.getElementById("loading-indicator");

let currentSlide = 0;
let currentPage = 0;
let allPosts = [];
const postsPerPage = 12;
const desktopSlidesToShow = 3;
let isTransitioning = false;

// Fetch posts from the API and initialize the application
async function fetchPosts() {
  try {
    const response = await fetch(blogPage);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    allPosts = data.data;
    init();
  } catch (error) {
    console.error("Error fetching data:", error);
    content.innerHTML =
      "<p>Error fetching the blog posts. Please try again later.</p>";
  } finally {
    loadingIndicator.style.display = "none";
  }
}

// Initialize the application
function init() {
  populateTags();
  displayPosts(allPosts);
  window.addEventListener("resize", () => displayPosts(allPosts));
  tagFilter.addEventListener("change", filterPostsByTag);
  searchInput.addEventListener("input", searchPosts);
}

// Create HTML for a single post
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

// Display posts and set up the carousel
function displayPosts(posts) {
  content.innerHTML = "";
  const isMobile = window.innerWidth < 769;
  const slidesToShow = isMobile ? 1 : desktopSlidesToShow;
  const latestPosts = posts.slice(0, 5); // Last 5 posts for desktop
  const fragment = document.createDocumentFragment();

  const slides = [...latestPosts, ...latestPosts, ...latestPosts]; // Repeat posts for infinite effect

  slides.forEach((post) => {
    const container = document.createElement("div");
    container.classList.add("single-blog-post");
    container.innerHTML = createPostHTML(post);
    fragment.appendChild(container);
  });

  content.appendChild(fragment);
  content.style.transform = `translateX(-${100 / slidesToShow}%)`;
  displayPaginatedPosts(posts);
}

// Display paginated posts
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

// Move the carousel slide
function moveSlide(step) {
  if (isTransitioning) return;
  isTransitioning = true;

  const isMobile = window.innerWidth < 769;
  const slidesToShow = isMobile ? 1 : desktopSlidesToShow;
  const slides = document.querySelectorAll(".single-blog-post");
  currentSlide += step;

  const newTransform = -currentSlide * (100 / slidesToShow);
  content.style.transition = "transform 0.5s ease";
  content.style.transform = `translateX(${newTransform}%)`;

  function onTransitionEnd() {
    content.removeEventListener("transitionend", onTransitionEnd);

    if (currentSlide < 0) {
      currentSlide = slides.length / 3 - 1;
      content.style.transition = "none";
      content.style.transform = `translateX(${
        -currentSlide * (100 / slidesToShow)
      }%)`;
    } else if (currentSlide >= slides.length / 3) {
      currentSlide = 0;
      content.style.transition = "none";
      content.style.transform = `translateX(${
        -currentSlide * (100 / slidesToShow)
      }%)`;
    }
    isTransitioning = false;
  }

  content.addEventListener("transitionend", onTransitionEnd);
}

// Change the pagination page
function changePage(step) {
  const numberOfPages = Math.ceil(allPosts.length / postsPerPage);
  currentPage = Math.max(0, Math.min(currentPage + step, numberOfPages - 1));
  displayPaginatedPosts(allPosts);
}

// Populate the tag filter options
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
  tagFilter.innerHTML = '<option value="all">All</option>';
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

// Filter posts by the selected tag
function filterPostsByTag() {
  const selectedTag = tagFilter.value;
  const filteredPosts =
    selectedTag === "all"
      ? allPosts
      : allPosts.filter((post) => post.tags && post.tags.includes(selectedTag));
  displayPosts(filteredPosts);
  carousel.style.display = selectedTag === "all" ? "block" : "none";
}

// Filter posts by the search input
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

// Fetch posts on load
fetchPosts();
