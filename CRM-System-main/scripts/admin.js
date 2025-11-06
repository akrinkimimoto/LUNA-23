
const userBtn = document.getElementById('join');
userBtn.innerText = "ADMIN";

// Dark mode removed — no-op

// --- Search: suggestions + filtering ---
const searchInput = document.getElementById('search');
const suggestionsDropdown = document.getElementById('search-suggestions');
let activeIndex = -1;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlightMatch(text, query) {
  if (!query) return escapeHTML(text);
  const t = String(text);
  const q = String(query).toLowerCase();
  const idx = t.toLowerCase().indexOf(q);
  if (idx === -1) return escapeHTML(t);
  return (
    escapeHTML(t.slice(0, idx)) +
    '<mark>' + escapeHTML(t.slice(idx, idx + q.length)) + '</mark>' +
    escapeHTML(t.slice(idx + q.length))
  );
}

function updateActiveVisual() {
  if (!suggestionsDropdown) return;
  const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
  items.forEach((it, i) => {
    if (i === activeIndex) {
      it.classList.add('active');
      it.setAttribute('aria-selected', 'true');
      // ensure active item is visible
      it.scrollIntoView({ block: 'nearest' });
    } else {
      it.classList.remove('active');
      it.setAttribute('aria-selected', 'false');
    }
  });
}

function escapeHTML(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function highlightMatch(text, query) {
      if (!query) return escapeHTML(text);
      const t = String(text || '');
      const q = String(query).toLowerCase();
      const idx = t.toLowerCase().indexOf(q);
      if (idx === -1) return escapeHTML(t);
      return (
        escapeHTML(t.slice(0, idx)) +
        '<mark>' + escapeHTML(t.slice(idx, idx + q.length)) + '</mark>' +
        escapeHTML(t.slice(idx + q.length))
      );
    }

    function showSuggestions(query) {
  const text = (query || '').trim();
  const lower = text.toLowerCase();

  // If empty, show all
  if (!text) {
    if (suggestionsDropdown) suggestionsDropdown.classList.remove('active');
    appendData(hotelData);
    activeIndex = -1;
    return;
  }

  const matches = hotelData.filter(u => u.name && u.name.toLowerCase().includes(lower));

  if (suggestionsDropdown) {
    suggestionsDropdown.innerHTML = '';
    suggestionsDropdown.setAttribute('role', 'listbox');
    if (matches.length) {
      matches.forEach((m, i) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '-1');
        item.dataset.index = i;
        item.innerHTML = highlightMatch(m.name, text);
        item.addEventListener('click', () => {
          if (searchInput) searchInput.value = m.name;
          suggestionsDropdown.classList.remove('active');
          appendData([m]);
          activeIndex = -1;
        });
        suggestionsDropdown.appendChild(item);
      });
      suggestionsDropdown.classList.add('active');
      activeIndex = -1;
    } else {
      suggestionsDropdown.classList.remove('active');
      activeIndex = -1;
    }
  }

  appendData(matches);
}

const debouncedSearch = debounce((q) => showSuggestions(q), 250);

if (searchInput) {
  searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

  // keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  searchInput.addEventListener('keydown', (e) => {
    if (!suggestionsDropdown || !suggestionsDropdown.classList.contains('active')) {
      return;
    }
    const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveVisual();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveVisual();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        items[activeIndex].click();
      }
    } else if (e.key === 'Escape') {
      suggestionsDropdown.classList.remove('active');
      activeIndex = -1;
    }
  });
}

// close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!searchInput || !suggestionsDropdown) return;
  if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
    suggestionsDropdown.classList.remove('active');
    activeIndex = -1;
  }
});

// ------------------------------------

let sortAtoZBtn = document.getElementById("sort-price-low-to-high");
let sortZtoABtn = document.getElementById("sort-price-high-to-low");

let sortRatingAtoZBtn = document.getElementById("sort-rating-low-to-high");
let sortRatingztoABtn = document.getElementById("sort-rating-high-to-low");


let mainSection = document.getElementById("product_container");

let count = document.getElementById("count");


let hotelData = [];



fetchdata();
function fetchdata() {
  fetch("https://crm-system-9eof.onrender.com/users")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log(data);
      appendData(data);
      hotelData = data;
    })
    .catch(function (error) {
      console.log(error);
    });
}


function appendData(data) {
  mainSection.innerHTML = "";
  count.textContent = `${data.length} Results`;
  let cardlist = document.createElement("div");
  cardlist.className = "card-list";
  mainSection.append(cardlist);

  data.forEach(function (item) {
    cardlist.append(cretecard(item));
  });
}


function cretecard(item) {
  let card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", item.id);

  let cardimg = document.createElement("div");
  cardimg.className = "card-img";

  let img = document.createElement("img");
  img.src = "https://cdn-icons-png.flaticon.com/512/1869/1869679.png";
  img.setAttribute("alt", "book");
  cardimg.append(img);

  let Id = document.createElement("h3");
  Id.innerText = `ID: ${item.id}`
 

  let cardbody = document.createElement("div");
  cardbody.className = "card-body";

  let h4 = document.createElement("h2");
  h4.className = "card-title";
  h4.textContent = item.name;
  h4.style.height = "60px";

  let loc = document.createElement("h3");
  loc.className = "location";
  loc.textContent = item.position;

  let p = document.createElement("p");
  p.className = "card-desc";
  p.textContent = item.department;

  let p3 = document.createElement("h3");
  p3.className = "card-price";
  p3.textContent = item.status;

  let h5=document.createElement("h4");

  h5.textContent=item.phone_number;

  let h6=document.createElement("h4");
  h6.className="rating";
  h6.textContent=item.email;

  let btn = document.createElement("button");
  btn.className = "card-button";
  btn.setAttribute("data-id", item.id);
  btn.textContent = "Delete";
  btn.addEventListener("click", function () {
    let bookId = item.id;
    fetch(`https://crm-system-9eof.onrender.com/users/${item.id}`, {
      method: "DELETE",
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        location.reload();
        console.log(data);
        appendData(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  cardbody.append(Id,h4, loc, p, p3, h5,h6, btn);

  card.append(cardimg, cardbody);
  return card;
}


let updateHotelIdInput = document.getElementById("update-hotel-id");
let updateHotelTitleInput = document.getElementById("update-hotel-name");
let updateHotelImageInput = document.getElementById("update-hotel-image");
let updateHotelLocationInput = document.getElementById("update-hotel-location");
let updateHotelDescriptionInput = document.getElementById("update-hotel-desc");
let updateHotelPriceInput = document.getElementById("update-hotel-price");
let updateHotelReviewInput = document.getElementById("update-hotel-review");
let updateHotelemailInput = document.getElementById("update-hotel-email");
let updateHotelBtn = document.getElementById("update-hotel");


updateHotelBtn.addEventListener("click", function () {
  fetch(`https://crm-system-9eof.onrender.com/users/${updateHotelIdInput.value}`, {
    method: "PUT",
    body: JSON.stringify({
      name: updateHotelTitleInput.value,
      position: updateHotelLocationInput.value,
      department: updateHotelDescriptionInput.value,
     
      status: updateHotelPriceInput.value,
      phone_number: updateHotelReviewInput.value,
      email: updateHotelemailInput.value
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      location.reload();
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
});


let hotelTitleInput = document.getElementById("hotel-name");
let hotelImageInput = document.getElementById("hotel-image");
let hotelLocationInput = document.getElementById("hotel-location");
let hotelDescriptionInput = document.getElementById("hotel-desc");
let hotelPriceInput = document.getElementById("hotel-price");
let hotelphoneInput = document.getElementById("hotel-phone");
let hotelemailInput = document.getElementById("hotel-email");
let hotelCreateBtn = document.getElementById("add-hotel");

hotelCreateBtn.addEventListener("click", AddHotel);

function AddHotel() {
  fetch(`https://crm-system-9eof.onrender.com/users`, {
    method: "POST",
    body: JSON.stringify({
      name: hotelTitleInput.value,
      position: hotelLocationInput.value,
      department: hotelDescriptionInput.value,
      status: hotelPriceInput.value,
      phone_number: hotelphoneInput.value,
     email: hotelemailInput.value,
    }),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      location.reload();
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}


let updatePriceHotelId = document.getElementById("update-score-hotel-id");
let updatePriceHotelPrice = document.getElementById("update-score-hotel-price");
let updatePriceHotelPriceButton = document.getElementById("update-score-hotel");

updatePriceHotelPriceButton.addEventListener('click', ()=>{
  fetch(`https://crm-system-9eof.onrender.com/users/${updatePriceHotelId.value}`, {
    method: "PATCH",
    body: JSON.stringify({
      phone_number: updatePriceHotelPrice.value,
    }),
    headers: {
      "Content-type": "application/json",
    },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      location.reload();
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
})

sortAtoZBtn.addEventListener("click", sort1);
function sort1() {
  fetch(
    `https://mock-api-hotels.onrender.com/hotels?_sort=price&_order=asc`
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

sortZtoABtn.addEventListener("click", sort2);
function sort2() {
  fetch(
    `https://mock-api-hotels.onrender.com/hotels?_sort=price&_order=desc`
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

sortRatingAtoZBtn.addEventListener("click", sort3);
function sort3() {
  fetch(
    `https://mock-api-hotels.onrender.com/hotels?_sort=review&_order=asc`
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

sortRatingztoABtn.addEventListener("click", sort4);
function sort4() {
  fetch(
    `https://mock-api-hotels.onrender.com/hotels?_sort=review&_order=desc`
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      appendData(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}



