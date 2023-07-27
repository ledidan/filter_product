let allData = [];
const itemsPerPage = 2;
let currentPage = 1;
function getDataAndDisplay() {
  const username = "ck_0dfda3ddc8cec461045067826a6cc34622992dac";
  const password = "cs_9429729612e4774580b1a553833e1d6a3c454ec2";
  const authString = `${username}:${password}`;
  const encodedAuth = btoa(authString);
  const apiUrl = "https://sc.gaco.vn/wp-json/wc/v3/products";

  return new Promise((resolve, reject) => {
    $.ajax({
      url: apiUrl,
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Basic ${encodedAuth}`);
      },
      success: function (data) {
        allData = data;
        resolve(data); // Resolve the Promise with the data
      },
      error: function (xhr, textStatus, errorThrown) {
        console.error("Lỗi khi lấy dữ liệu từ API:", errorThrown);
        reject(errorThrown); // Reject the Promise with the error
      },
    });
  });
}

getDataAndDisplay()
  .then((data) => {
    console.log(data); // The API data
    console.log(allData);
    updateCategoryDropdown(); // The same API data stored in the allData variable
    displayResults(data); //
  })
  .catch((error) => {
    console.error(error);
  });

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function search() {
  const searchTerm = removeAccents(searchInput.value.toLowerCase());
  const selectedCategory = categorySelect.value;
  const minPrice = parseInt(priceMin.value) || 0;
  const maxPrice = parseInt(priceMax.value) || Infinity;

  const filteredData = allData.filter(
    (item) =>
      removeAccents(item.name.toLowerCase()).includes(searchTerm) &&
      (selectedCategory === "all" ||
        item.categories.some(
          (category) => category.name === selectedCategory
        )) &&
      item.price >= minPrice &&
      item.price <= maxPrice
  );
  displayResults(filteredData);
  createPaginationControls(filteredData.length);
}

function displayResults(results) {
  const searchResults = $("#searchResults");
  searchResults.empty();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const itemsForCurrentPage = results.slice(startIndex, endIndex);

  itemsForCurrentPage.forEach((item) => {
    const card = $("<div>").addClass("card");

    const nameHeading = $("<h2>").text(item.name);
    const priceParagraph = $("<p>").text("Price: $" + item.price);
    const categories = item.categories.map((category) => category.name);
    const categoriesParagraph = $("<p>").text(
      "Categories: " + categories.join(", ")
    );

    const imageContainer = $("<div>").addClass("image-container");
    if (item.images.length > 0) {
      const imgElement = $("<img>").attr("src", item.images[0].src);
      imageContainer.append(imgElement);
    }
    card.append(
      imageContainer,
      nameHeading,
      priceParagraph,
      categoriesParagraph
    );
    createPaginationControls(results.length);
    searchResults.append(card);
  });
}

function createPaginationControls(totalItems) {
  const paginationContainer = $("#paginationContainer");
  paginationContainer.empty();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const prevButton = $("<button>")
    .text("Previous")
    .prop("disabled", currentPage === 1);
  prevButton.on("click", () => {
    if (currentPage > 1) {
      currentPage--;
      search();
    }
  });

  const nextButton = $("<button>")
    .text("Next")
    .prop("disabled", currentPage === totalPages);
  nextButton.on("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      search();
    }
  });

  const pageInfo = $("<span>").text(`Page ${currentPage} of ${totalPages}`);

  paginationContainer.append(prevButton, pageInfo, nextButton);
}

function updateCategoryDropdown() {
  const categorySelect = $("#categorySelect");
  categorySelect.html('<option value="all">All</option>');
  const categories = allData.flatMap((item) =>
    item.categories.map((category) => category.name)
  );
  const uniqueCategories = [...new Set(categories)];
  uniqueCategories.forEach((category) => {
    const option = $("<option>").attr("value", category).text(category);
    categorySelect.append(option);
  });
}

const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
searchInput.addEventListener("input", search);
categorySelect.addEventListener("change", search);
const priceFilterButton = document.getElementById("priceFilterButton");
priceFilterButton.addEventListener("click", search);

getDataAndDisplay();
search();
updateCategoryDropdown();
