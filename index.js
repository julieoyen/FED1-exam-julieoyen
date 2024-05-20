const blogPage = "https://v2.api.noroff.dev/blog/posts/juliebertine/";
const content = document.getElementById("posts-container");
const paginationContent = document.getElementById("posts-pagination");
const tagFilter = document.getElementById("tag-filter");
const searchInput = document.getElementById("search-input");
const carousel = document.querySelector(".carousel");
let currentSlide = 1;
let currentPage = 0;
let allPosts = [];
const postsPerPage = 12;
const mobileSlidesToShow = 1;
const desktopSlidesToShow = 3;
const totalMobileSlides = 3;
const totalDesktopSlides = 5;
let isTransitioning = false;

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
          ? `<a href="/post/blog-post.html?ID=${post.id}"><img src="${post.media.url}" alt="${post.media.alt}" loading="lazy"></a>`
          : ""
      }
    </div>`;
}

function displayPosts(posts) {
  content.innerHTML = "";
  const isMobile = window.innerWidth < 769;
  const totalSlides = isMobile ? totalMobileSlides : totalDesktopSlides;
  const slidesToShow = isMobile ? mobileSlidesToShow : desktopSlidesToShow;
  const latestPosts = posts.slice(0, totalSlides);
  const fragment = document.createDocumentFragment();

  // Create duplicates of the last and first slides for seamless looping
  const lastSlide = document.createElement("div");
  lastSlide.classList.add("single-blog-post");
  lastSlide.innerHTML = createPostHTML(latestPosts[latestPosts.length - 1]);
  fragment.appendChild(lastSlide);

  latestPosts.forEach((post) => {
    const container = document.createElement("div");
    container.classList.add("single-blog-post");
    container.innerHTML = createPostHTML(post);
    fragment.appendChild(container);
  });

  const firstSlide = document.createElement("div");
  firstSlide.classList.add("single-blog-post");
  firstSlide.innerHTML = createPostHTML(latestPosts[0]);
  fragment.appendChild(firstSlide);

  content.appendChild(fragment);
  content.style.transform = `translateX(-${100 / slidesToShow}%)`; // Move to the first actual slide
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
  if (isTransitioning) return;
  isTransitioning = true;

  const isMobile = window.innerWidth < 769;
  const slidesToShow = isMobile ? mobileSlidesToShow : desktopSlidesToShow;
  const slides = document.querySelectorAll(".single-blog-post");
  currentSlide += step;

  const newTransform = -currentSlide * (100 / slidesToShow);
  content.style.transition = "transform 0.5s ease";
  content.style.transform = `translateX(${newTransform}%)`;

  content.addEventListener(
    "transitionend",
    () => {
      if (currentSlide === 0) {
        currentSlide = slides.length - 2;
        content.style.transition = "none";
        content.style.transform = `translateX(${
          -currentSlide * (100 / slidesToShow)
        }%)`;
      } else if (currentSlide === slides.length - 1) {
        currentSlide = 1;
        content.style.transition = "none";
        content.style.transform = `translateX(${
          -currentSlide * (100 / slidesToShow)
        }%)`;
      }
      isTransitioning = false;
    },
    { once: true }
  );
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

window.addEventListener("resize", () => displayPosts(allPosts)); // Adjust carousel on resize

fetchPosts();
