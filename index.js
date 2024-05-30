const blogPage = "https://v2.api.noroff.dev/blog/posts/juliebertine/";
const content = document.getElementById("posts-container");
const paginationContent = document.getElementById("posts-pagination");
const tagFilter = document.getElementById("tag-filter");
const searchInput = document.getElementById("search-input");
const carousel = document.querySelector(".carousel");

let currentSlide = 0;
let currentPage = 1;
let allPosts = [];
let mainPosts = [];
let postsPerPage = 12;
let isTransitioning = false;
let startX = 0;
let endX = 0;
let myTag = "";
let searchTimeout;

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
    content.focus();
  }
}

function init() {
  populateTags();
  fetchMainContent();
  window.addEventListener("resize", renderCarousel);
  attachEventListeners();
  renderCarousel();
}

function createPostHTML(post) {
  return `
    <div class="single-blog-post">
      <div class="overlay">
        <a href="/post/blog-post.html?ID=${post.id}">
          <h3 class="carouselTitle">${post.title}</h3>
        </a>
        ${
          post.media
            ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}"></a>`
            : ""
        }
      </div>
    </div>`;
}

function renderCarousel() {
  const fragment = document.createDocumentFragment();
  const postsToShow = allPosts.slice(0, 3);
  postsToShow.forEach((post, index) => {
    const container = document.createElement("div");
    container.classList.add("carousel-item-container");
    if (index === 0) container.classList.add("active");
    container.innerHTML = createPostHTML(post);
    fragment.appendChild(container);
  });
  content.innerHTML = "";
  content.appendChild(fragment);
  updateNavigation();
  centerCarousel();
}

function moveSlide(step) {
  if (isTransitioning) return;
  isTransitioning = true;
  const slides = document.querySelectorAll(".carousel-item-container");
  const totalSlides = slides.length;

  slides.forEach((slide) => slide.classList.remove("active"));

  currentSlide = (currentSlide + step + totalSlides) % totalSlides;
  slides[currentSlide].classList.add("active");

  setTimeout(() => {
    isTransitioning = false;
  }, 100);
}

function updateNavigation() {
  const prevButton = document.querySelector(".carousel-control.prev");
  const nextButton = document.querySelector(".carousel-control.next");
  prevButton.addEventListener("click", () => moveSlide(-1));
  nextButton.addEventListener("click", () => moveSlide(1));
}

function handleTouchStart(event) {
  startX = event.touches[0].clientX;
}

function handleTouchMove(event) {
  endX = event.touches[0].clientX;
}

function handleTouchEnd() {
  if (startX - endX > 50) {
    moveSlide(1);
  } else if (endX - startX > 50) {
    moveSlide(-1);
  }
}

function appendMain(posts) {
  paginationContent.innerHTML = "";
  const fragment = document.createDocumentFragment();

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("single-pagination-post");
    postDiv.innerHTML = createPostHTML(post);
    fragment.appendChild(postDiv);
  });
  paginationContent.appendChild(fragment);
  updatePaginationControls();
}

function changePage(step) {
  const numberOfPages = Math.ceil(allPosts.length / postsPerPage);
  currentPage = Math.max(1, Math.min(currentPage + step, numberOfPages));
  fetchMainContent().then(updatePaginationButtons);
}

function populateTags() {
  const tags = new Set();
  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tag.trim()) tags.add(tag);
      });
    }
  });
  tagFilter.innerHTML = '<option value="">View all tags</option>';
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

function filterPostsByTag() {
  myTag = tagFilter.value;
  currentPage = 1;
  fetchMainContent().then(updatePaginationButtons);
}

function searchPosts() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
      postsPerPage = 100;
    } else {
      postsPerPage = 12;
    }

    fetchMainContent().then(() => {
      const filteredPosts = searchTerm
        ? mainPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchTerm) ||
              (post.content && post.content.toLowerCase().includes(searchTerm))
          )
        : mainPosts;
      appendMain(filteredPosts);

      if (searchTerm) {
        carousel.style.display = "none";
      } else {
        carousel.style.display = "block";
        renderCarousel();
      }

      updatePaginationButtons();
    });
  }, 300);
}

function attachEventListeners() {
  tagFilter.addEventListener("change", filterPostsByTag);
  searchInput.addEventListener("input", searchPosts);
  content.addEventListener("touchstart", handleTouchStart);
  content.addEventListener("touchmove", handleTouchMove);
  content.addEventListener("touchend", handleTouchEnd);

  const prevButton = document.querySelector(
    '.pagination-controls button[aria-label="Previous Page"]'
  );
  const nextButton = document.querySelector(
    '.pagination-controls button[aria-label="Next Page"]'
  );
  prevButton.addEventListener("click", () => changePage(-1));
  nextButton.addEventListener("click", () => changePage(1));
}

function centerCarousel() {
  const slides = document.querySelectorAll(".carousel-item-container");
  if (slides.length > 0) {
    slides[0].parentNode.style.justifyContent = "center";
  }
}

function updatePaginationControls() {
  const prevButton = document.querySelector(
    '.pagination-controls button[aria-label="Previous Page"]'
  );
  const nextButton = document.querySelector(
    '.pagination-controls button[aria-label="Next Page"]'
  );
  const numberOfPages = Math.ceil(allPosts.length / postsPerPage);
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === numberOfPages;
}

function updatePaginationButtons() {
  const prevButton = document.querySelector(
    '.pagination-controls button[aria-label="Previous Page"]'
  );
  const nextButton = document.querySelector(
    '.pagination-controls button[aria-label="Next Page"]'
  );
  const currentItemsCount = mainPosts.length;
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentItemsCount < postsPerPage;
}

async function fetchMainContent() {
  try {
    const response = await fetch(
      `https://v2.api.noroff.dev/blog/posts/juliebertine/?limit=${postsPerPage}&page=${currentPage}&_tag=${myTag}`
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    mainPosts = data.data;
    appendMain(mainPosts);
  } catch (error) {
    console.error("Error fetching data:", error);
    content.innerHTML =
      "<p>Error fetching the blog posts. Please try again later.</p>";
  }
}

fetchPosts();
