let title = document.getElementById("title");
let desc = document.getElementById("desc");
let select = document.getElementById("select");
let date = document.getElementById("date");
let status = document.getElementById("status");
let time = document.getElementById("time");
let department = document.getElementById("department");
let btn1 = document.getElementById("btn1");
let btn2 = document.getElementById("btn2");
let maintasksection = document.getElementById("maintasksection");
let addemp = document.getElementById("addemp");
let taskadddiv = document.getElementById("taskadddiv");
let searchbar = document.getElementById("searchbar");
// Initialize search functionality
function initializeSearch() {
  if (!searchbar) return;
  searchbar.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const taskCards = maintasksection.children;
    for (let card of taskCards) {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p').textContent.toLowerCase();
      if (title.includes(searchTerm) || desc.includes(searchTerm)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

let editIndex = -1; 
addemp.addEventListener("click", function () {
  taskadddiv.style.display = "block";
  // prevent background scroll while modal is open and focus first input
  try{ document.body.style.overflow = 'hidden'; }catch(e){}
  try{ title.focus(); }catch(e){}
});

btn1.addEventListener("click", () => {
  const errEl = document.getElementById('task-error');
  if (errEl) errEl.textContent = '';
  if (!title.value || !title.value.trim()){
    if (errEl) errEl.textContent = 'Title is required.';
    try{ title.focus(); }catch(e){}
    return;
  }
  fetchdata();
  display();
  try{ document.body.style.overflow = ''; }catch(e){}
});
function clearForm() {
    title.value = "";
    desc.value = "";
    select.value = "";
    date.value = "";
    time.value = "";
    status.value = "";
    department.value = "";
    const errEl = document.getElementById('task-error');
    if (errEl) errEl.textContent = '';
}

btn2.addEventListener("click", function(){
    // cancel: clear and hide
    clearForm();
    taskadddiv.style.display = "none";
    try{ document.body.style.overflow = ''; }catch(e){}
})

let arr = [];

// Load tasks when page loads
async function loadTasks() {
  try {
    const response = await fetch('https://crm-system-9eof.onrender.com/tasks');
    arr = await response.json();
    display();
  } catch (error) {
    console.error('Error loading tasks:', error);
    arr = JSON.parse(localStorage.getItem("task")) || [];
    display();
  }
}

// Draggable functionality
function initDraggable() {
  const modal = document.getElementById('taskadddiv');
  const modalHeader = document.getElementById('modalHeader');
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }

    if (e.target.closest('#modalHeader')) {
      isDragging = true;
      modalHeader.style.cursor = 'grabbing';
    }
  }

  function dragEnd() {
    isDragging = false;
    modalHeader.style.cursor = 'grab';
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }

      xOffset = currentX;
      yOffset = currentY;

      setTranslate(currentX, currentY, modal);
    }
  }

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }

  modalHeader.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  modalHeader.addEventListener("touchstart", dragStart);
  document.addEventListener("touchmove", drag);
  document.addEventListener("touchend", dragEnd);

  // Reset position when closing modal
  btn2.addEventListener('click', () => {
    xOffset = 0;
    yOffset = 0;
    modal.style.transform = '';
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  initializeSearch();
  initDraggable();
});

async function fetchdata() {
  taskadddiv.style.display = "none";
  try{ document.body.style.overflow = ''; }catch(e){}
  let obj = {
    title: title.value,
    desc: desc.value,
    select: select.value,
    date: date.value,
    time: time.value,
    status: status.value,
    department: department.value
  };

  try {
    if (editIndex !== -1) {
      const taskId = arr[editIndex].id;
      const response = await fetch(`https://crm-system-9eof.onrender.com/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      editIndex = -1;
    } else {
      const response = await fetch('https://crm-system-9eof.onrender.com/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });
      
      if (!response.ok) throw new Error('Failed to create task');
    }
    
    loadTasks(); // Reload tasks after update
  } catch (error) {
    console.error('Error:', error);
    // Fallback to localStorage if API fails
    if (editIndex !== -1) {
      arr[editIndex] = obj;
      editIndex = -1;
    } else {
      arr.push(obj);
    }
    localStorage.setItem("task", JSON.stringify(arr));
    display();
  }
}

function display() {
  maintasksection.innerHTML = "";

  arr.forEach((item, index) => {
    maintasksection.append(createcard(item, index));
  });
}

function createcard(item, index) {
  let card = document.createElement("div");
  let h3 = document.createElement("h3");
  h3.textContent = item.title;
  let p1 = document.createElement("p");
  let p2 = document.createElement("p");
  let p3 = document.createElement("p");
  let p4 = document.createElement("p");
  let p5 = document.createElement("p");
  p1.textContent = item.desc;
  p2.textContent = item.date;
  p3.textContent = item.time;
  p4.textContent = item.status;
  p5.className = 'task-assignment';
  if (item.assigneeName) {
    p5.innerHTML = `
      <div class="assigned-employee">
        <strong>Assigned to:</strong>
        <div class="employee-details">
          <span class="name">${item.assigneeName}</span>
          ${item.assigneePosition ? `<span class="position">${item.assigneePosition}</span>` : ''}
          ${item.assigneeDepartment ? `<span class="department">${item.assigneeDepartment}</span>` : ''}
        </div>
      </div>
    `;
  } else {
    p5.innerHTML = '<div class="assigned-employee unassigned"><strong>Status:</strong> Unassigned</div>';
  }
  let edit = document.createElement("button");
  edit.className = "edit";
  edit.textContent = "Edit";
  let deleted = document.createElement("button");
  deleted.className = "deleted";
  deleted.textContent = "Delete";

  edit.addEventListener("click", () => {
    editdata(item, index);
    edititem(item, index);
  });

  deleted.addEventListener("click", async function(){
    try {
      const taskId = item.id;
      const response = await fetch(`https://crm-system-9eof.onrender.com/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete task');
      loadTasks(); // Reload tasks after deletion
    } catch (error) {
      console.error('Error:', error);
      // Fallback to localStorage if API fails
      arr = arr.filter((e,i) => i !== index);
      localStorage.setItem("task", JSON.stringify(arr));
      display();
    }
  })

  // Create department badge
  let deptBadge = document.createElement("div");
  deptBadge.className = `department-badge ${getDepartmentClass(item.department)}`;
  deptBadge.innerHTML = `
    <span class="material-icons-outlined">${getDepartmentIcon(item.department)}</span>
    <span>${item.department || 'No Department'}</span>
  `;

  // Add department badge after title
  card.append(h3, deptBadge, p1, p2, p3, p4, edit, deleted);
  return card;
}

// Helper function to get department icon
function getDepartmentIcon(department) {
  const icons = {
    'IT': 'computer',
    'HR': 'people',
    'Finance': 'attach_money',
    'Marketing': 'campaign',
    'Operations': 'settings',
    'Sales': 'trending_up'
  };
  return icons[department] || 'business';
}

// Helper function to get department class
function getDepartmentClass(department) {
  return department ? department.toLowerCase().replace(/\s+/g, '-') : 'no-department';
}

display();

function editdata(item, index) {
  taskadddiv.style.display = "block";
  try{ document.body.style.overflow = 'hidden'; }catch(e){}
  try{ document.getElementById('task-error').textContent = ''; }catch(e){}
  try{ title.focus(); }catch(e){}
  title.value = item.title;
  desc.value = item.desc;
  select.value = item.select;
  date.value = item.date;
  time.value = item.time;
  status.value = item.status;
  department.value = item.department || '';
  editIndex = index; 
}

function edititem(item, index) {
  localStorage.setItem("task", JSON.stringify(arr));
  arr[index] = {
    title: title.value,
    desc: desc.value,
    select: select.value,
    date: date.value,
    time: time.value,
    status: status.value,
  };
  localStorage.setItem("task", JSON.stringify(arr));
  display();
}


// Search functionality
const clearSearchBtn = document.getElementById('clearSearch');

function initializeSearch() {
  let searchDebounceTimer = null;
  if (!searchbar) return;

  searchbar.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    
    // Show/hide clear button
    clearSearchBtn.classList.toggle('visible', searchTerm.length > 0);
    
    // Debounce search
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);
  });

  // Clear search
  clearSearchBtn.addEventListener('click', function() {
    searchbar.value = '';
    clearSearchBtn.classList.remove('visible');
    searchbar.focus();
    display(arr); // Show all tasks
  });

  // Handle keyboard events
  searchbar.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchbar.value = '';
      clearSearchBtn.classList.remove('visible');
      searchbar.blur();
      display(arr);
    }
  });
}

function performSearch(searchTerm) {
  if (!searchTerm) {
    display(arr);
    return;
  }

  const searchedData = arr.filter(task => {
    const searchableFields = [
      task.title,
      task.desc,
      task.select,
      task.status,
      task.assigneeName
    ].map(field => (field || '').toLowerCase());

    const termLower = searchTerm.toLowerCase();
    return searchableFields.some(field => field.includes(termLower));
  });

  if (searchedData.length === 0) {
    maintasksection.innerHTML = `
      <div class="no-results">
        <span class="material-icons-outlined">search_off</span>
        <p>No tasks found matching "${searchTerm}"</p>
      </div>
    `;
  } else {
    display(searchedData);
  }
}
