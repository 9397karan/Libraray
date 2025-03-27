let books = [];
let page = 1;
let totalPages = 0;
let searchQuery = "";
let sortCriteria = "";

let prev = document.getElementById("prev-btn");
let next = document.getElementById("next-btn");
let searchInput = document.getElementById("search");
let searchBtn = document.getElementById("searchBtn");
let sortOptions = document.getElementById("sortOptions");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");
const booksContainer = document.getElementById("booksContainer");

async function fetchApi(page, query = "") {
    try {
        const res = await fetch(
            `https://api.freeapi.app/api/v1/public/books?page=${page}&limit=10&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=${query}`
        );
        const data = await res.json();
        totalPages = data.data.totalPages;
        books = data.data.data;
        renderCards();
        updateButtons();
    } catch (error) {
        console.log(error);
    }
}

function renderCards() {
    let sortedBooks = [...books]; // Clone the books array to avoid mutating the original

    // Apply Sorting
    if (sortCriteria === "title") {
        sortedBooks.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
    } else if (sortCriteria === "date") {
        sortedBooks.sort((a, b) => (b.volumeInfo.publishedDate || "").localeCompare(a.volumeInfo.publishedDate || ""));
    }

    booksContainer.innerHTML = sortedBooks.length
        ? sortedBooks
              .map(
                  (e) => isGridView
                      ? `
        <div class="card">
          <a href="${e.volumeInfo.infoLink}" target="_blank">
            <img src="${e.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180'}" alt="Book Cover">
            <h2>${e.volumeInfo.title.length > 20 ? e.volumeInfo.title.slice(0, 15) + ".." : e.volumeInfo.title}</h2>
            <div>
                <p>Author: ${e.volumeInfo.authors ? e.volumeInfo.authors.join(", ").slice(0, 15) + "..-" : "Unknown"}</p>
                <p>Publisher: ${e.volumeInfo.publisher ? e.volumeInfo.publisher.slice(0,20) + ".." : "Unknown"}</p>
                <p>Published: ${e.volumeInfo.publishedDate || "Unknown"}</p>
            </div>
          </a>
        </div>`
                      : `
        <div class="card list-card">
          <a href="${e.volumeInfo.infoLink}" target="_blank">
            <img src="${e.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x180'}" alt="Book Cover">
            <div>
                <h2>${e.volumeInfo.title}</h2>
                <p><strong>Author:</strong> ${e.volumeInfo.authors ? e.volumeInfo.authors.join(", ") : "Unknown"}</p>
                <p><strong>Publisher:</strong> ${e.volumeInfo.publisher || "Unknown"}</p>
                <p><strong>Published:</strong> ${e.volumeInfo.publishedDate || "Unknown"}</p>
            </div>
          </a>
        </div>`
              )
              .join("")
        : `<h3 style="text-align: center; width: 100%;">No results found</h3>`;
}

function updateButtons() {
    prev.disabled = page === 1;
    next.disabled = page >= totalPages;
}

// Pagination buttons
prev.addEventListener("click", function () {
    if (page > 1) {
        page--;
        fetchApi(page, searchQuery);
    }
});

next.addEventListener("click", function () {
    if (page < totalPages) {
        page++;
        fetchApi(page, searchQuery);
    }
});

// Search Functionality
function searchResult() {
    searchQuery = searchInput.value.trim().toLowerCase();
    page = 1;
    fetchApi(page, searchQuery);
}

searchBtn.addEventListener("click", searchResult);
searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") searchResult();
});

// Sorting Functionality
sortOptions.addEventListener("change", function () {
    sortCriteria = this.value;
    renderCards(); 
});

// View Toggle
let isGridView = true; // Default to Grid View

gridViewBtn.addEventListener("click", function () {
    isGridView = true;
    updateView();
    renderCards();
});

listViewBtn.addEventListener("click", function () {
    isGridView = false;
    updateView();
    renderCards();
});

function updateView() {
    booksContainer.className = isGridView ? "books-card grid-view" : "books-card list-view";

    // Update button states
    gridViewBtn.classList.toggle("active", isGridView);
    listViewBtn.classList.toggle("active", !isGridView);
}

// Initialize View
updateView();
fetchApi(page);
