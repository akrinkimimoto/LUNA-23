
const url = `https://crm-system-9eof.onrender.com/users`;

// DOM Elements
const tbody = document.getElementById("tbody");
const container = document.getElementById("container");
const formContainer = document.querySelector(".form-container");
const paginationBox = document.getElementById("pagination-wrapper");
const searchBtn = document.querySelector(".searchBtn");
const addEmpBtn = document.querySelector(".addEmp");
const formData = document.querySelector("form");
const refresh = document.querySelector(".all_data");
const statusBtn = document.querySelector(".status");
const positionBtn = document.querySelector(".positionBtn");
const departmentBtn = document.querySelector(".department");

// Cache for all employees data
let allEmployees = [];

// User info
let username = document.getElementById("username");
const user = JSON.parse(localStorage.getItem('username')) || 'User';

// Debounce helper to prevent too many API calls
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}
username.innerText = user;

// Search functionality
async function performSearch(searchTerm) {
  searchTerm = searchTerm.toLowerCase().trim();
  const searchContainer = searchBtn.parentElement;
  
  try {
    searchContainer.classList.add('searching');
    
    // If cache is empty, fetch all employees
    if (!allEmployees.length) {
      const res = await fetch(url);
      allEmployees = await res.json();
    }
    
    // If search is empty, restore default view
    if (!searchTerm) {
      fetchedData(url, 1, 10);
      searchContainer.classList.remove('searching');
      return;
    }
    
    // Filter employees based on search term
    const filteredEmployees = allEmployees.filter(employee => {
      const { position, department, status, firstName, lastName } = employee;
      const searchFields = [position, department, status, firstName, lastName].map(
        field => field?.toLowerCase() || ''
      );
      return searchFields.some(field => field.includes(searchTerm));
    });
    
    if (filteredEmployees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#6b7280">
        No employees found matching "${searchTerm}"
      </td></tr>`;
    } else {
      list_data(filteredEmployees);
    }
    
    paginationBox.style.display = "none";
    
  } catch (error) {
    console.error("Search failed:", error);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:#6b7280">
      Error occurred while searching. Please try again.
    </td></tr>`;
  } finally {
    searchContainer.classList.remove('searching');
  }
}

// Set up search event listeners
const debouncedSearch = debounce((e) => performSearch(e.target.value), 300);
if (searchBtn) {
  const clearBtn = searchBtn.parentElement.querySelector('.search-clear');
  
  searchBtn.addEventListener('input', debouncedSearch);
  searchBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(e.target.value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      searchBtn.value = '';
      performSearch('');
      searchBtn.blur();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchBtn.value = '';
      performSearch('');
      searchBtn.focus();
    });
  }
}

addEmpBtn.addEventListener("click", () => {
  container.style.display = "none";
  paginationBox.style.display = "none";
  formContainer.style.display = "block";
});

formData.addEventListener("submit", (event) => {
  event.preventDefault();
  container.style.display = "block";
  paginationBox.style.display = "flex";
  formContainer.style.display = "none";
  postData(url);
});

refresh.addEventListener("click", () => {
  if (searchBtn) searchBtn.value = '';
  allEmployees = []; // Clear cache
  paginationBox.style.display = "flex";
  fetchedData(url, 1, 10);
});


async function postData(url) {
  try {
    const res = await fetch(`${url}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.value,
        position: formData.position.value,
        department: formData.department.value,
        status: formData.status.value,
        phone_number: formData.phone.value,
        email: formData.email.value,
      }),
    });
    
    const data = await res.json();
    fetchedData(url, 1, 10);
  } catch (error) {
    console.log(error);
  }
}


async function fetchedData(url, page, limit) {
  try {
    const res = await fetch(`${url}?_page=${page}&_limit=${limit}`);
    const total_Item = res.headers.get("X-Total-Count");
    const total_Page = Math.ceil(total_Item / limit);
    pagination(total_Page, limit);
    const data = await res.json();
    list_data(data);
  } catch (error) {
    console.log(error);
  }
}



async function searchedData(url) {
  try {
    const res = await fetch(`${url}`);
    const data = await res.json();
    list_data(data);
  } catch (error) {
    console.log(error);
  }
}

function pagination(total_Page, limit) {
  paginationBox.innerHTML = "";
  for (let i = 1; i <= total_Page; i++) {
    paginationBox.append(paginationBtn(i, limit));
  }
}


function paginationBtn(id, limit) {
  const pgBtn = document.createElement("button");
  pgBtn.className = "pagination-button";
  pgBtn.innerText = id;
  pgBtn.addEventListener("click", () => {
    fetchedData(url, id, limit);
  });
  return pgBtn;
}


function list_data(data) {
  tbody.innerHTML = "";
  data.forEach((element) => {
    tbody.append(card(element));
  });
}


function card(item) {
  const tr = document.createElement("tr");
  tr.dataset.id = item.id;
  tr.className = "row";
  
  const name = document.createElement("td");
 
  name.innerText = `${item.name}`;
  
  const position = document.createElement("td");
  position.innerText = item.position;
  
  const department = document.createElement("td");
  department.innerText = item.department;
  
  const status = document.createElement("button");
  status.innerText = item.status;
  status.className = "tdButton";
  status.style.borderRadius = "2px";
  status.style.border = "none";
  
  if (item.status == "Active") {
    status.style.backgroundColor = "#c6ebb4";
    status.style.color = "#52C41A";
  } else if (item.status == "In a meeting") {
    status.style.backgroundColor = "#E6F7FF";
    status.style.color = "#1890ff";
 
  } else if (item.status == "Out Sick") {
    status.style.backgroundColor = "#fff2e8";
    status.style.color = "#fa541c";
  }
  
  const phone_no = document.createElement("td");
  phone_no.innerText = item.phone_number;
  
  const email = document.createElement("td");
  email.innerText = item.email;
  
  tr.append(name, position, department, status, phone_no, email);
  return tr;
}


fetchedData(url, 1, 10);
