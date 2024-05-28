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
let isTransitioning = false;

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
  }
}

function init() {
  populateTags();
  displayPaginatedPosts(allPosts);
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
  }, 1000);
}

function updateNavigation() {
  const prevButton = document.querySelector(".carousel-control.prev");
  const nextButton = document.querySelector(".carousel-control.next");
  prevButton.addEventListener("click", () => moveSlide(-1));
  nextButton.addEventListener("click", () => moveSlide(1));
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

function changePage(step) {
  const numberOfPages = Math.ceil(allPosts.length / postsPerPage);
  currentPage = Math.max(0, Math.min(currentPage + step, numberOfPages - 1));
  displayPaginatedPosts(allPosts);
}

function populateTags() {
  const tags = new Set();
  allPosts.forEach((post) => {
    if (post.tags)
      post.tags.forEach((tag) => {
        if (tag.trim()) tags.add(tag);
      });
  });
  tagFilter.innerHTML = '<option value="all">View all tags</option>';
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
  displayPaginatedPosts(filteredPosts);
  if (selectedTag === "all") {
    carousel.style.display = "block";
    renderCarousel();
  } else {
    carousel.style.display = "none";
  }
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
  displayPaginatedPosts(filteredPosts);
  if (searchTerm) {
    carousel.style.display = "none";
  } else {
    carousel.style.display = "block";
    renderCarousel();
  }
}

function attachEventListeners() {
  tagFilter.addEventListener("change", filterPostsByTag);
  searchInput.addEventListener("input", searchPosts);
}

function centerCarousel() {
  const slides = document.querySelectorAll(".carousel-item-container");
  if (slides.length > 0) {
    slides[0].parentNode.style.justifyContent = "center";
  }
}

fetchPosts();
