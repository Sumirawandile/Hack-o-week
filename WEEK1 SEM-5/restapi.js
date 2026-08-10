const http = require("http");
const url = require("url");

const PORT = 5000;

let expenses = [];
let nextId = 1;

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Others"];

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function validateExpense(data) {
  if (!data.title || !data.title.trim()) return "Title is required";
  if (!data.amount || Number(data.amount) <= 0) return "Amount must be greater than 0";
  if (!data.category || !CATEGORIES.includes(data.category)) return "Valid category is required";
  if (!data.date) return "Date is required";
  return null;
}

function getExpenses(req, res, query) {
  let result = expenses;

  if (query.search) {
    const term = query.search.toLowerCase();
    result = result.filter((e) => e.title.toLowerCase().includes(term));
  }

  if (query.category && query.category !== "All") {
    result = result.filter((e) => e.category === query.category);
  }

  result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
  sendJSON(res, 200, result);
}
async function addExpense(req, res) {
  const data = await readBody(req);
  const error = validateExpense(data);
  if (error) return sendJSON(res, 400, { message: error });

  const expense = {
    _id: String(nextId++),
    title: data.title.trim(),
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    description: (data.description || "").trim(),
  };

  expenses.push(expense);
  sendJSON(res, 201, expense);
}

async function updateExpense(req, res, id) {
  const data = await readBody(req);
  const error = validateExpense(data);
  if (error) return sendJSON(res, 400, { message: error });

  const index = expenses.findIndex((e) => e._id === id);
  if (index === -1) return sendJSON(res, 404, { message: "Expense not found" });

  expenses[index] = {
    _id: id,
    title: data.title.trim(),
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    description: (data.description || "").trim(),
  };

  sendJSON(res, 200, expenses[index]);
}

function deleteExpense(req, res, id) {
  const index = expenses.findIndex((e) => e._id === id);
  if (index === -1) return sendJSON(res, 404, { message: "Expense not found" });

  expenses.splice(index, 1);
  sendJSON(res, 200, { message: "Deleted successfully" });
}


function getHomePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Expense Tracker</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background:#f4f7fb;
    color:#2b2f38;
  }

  header {
    background: #000080;
    color: white;
    padding:35px 20px 45px;
    text-align:center;
    border-radius: 0 0 24px 24px;
    box-shadow: 0 4px 16px rgba(74,127,214,0.25);
  }
  header h1 { font-size:40px; }
  header p { margin-top:6px; font-size:14px; opacity:0.9; }

  .container { max-width:820px; margin:-25px auto 40px; padding:0 20px; }

  .summary { display:flex; gap:16px; margin-bottom:24px; }
  .summary-card {
    flex:1; background:#fff; border-radius:14px; padding:18px;
    text-align:center; box-shadow:0 6px 16px rgba(43,47,56,0.08);
    transition: transform 0.2s ease;
  }
  .summary-card:hover { transform: translateY(-3px); }
  .summary-card .label { font-size:15px; color:#767c88; }
  .summary-card .value { font-size:21px; font-weight:700; color:#4a7fd6; margin-top:6px; }

  .form-box {
    background:#fff; border-radius:16px; padding:24px;
    margin-bottom:24px; box-shadow:0 6px 16px rgba(43,47,56,0.06);
  }
  .form-box h2 { margin-bottom:16px; font-size:18px; }
  .row { display:flex; gap:12px; margin-bottom:12px; flex-wrap:wrap; }
  .row > div { flex:1; min-width:150px; }

  label { display:block; font-size:12.5px; color:#767c88; margin-bottom:4px; }

  input, select, textarea {
    padding:10px 12px; border:1px solid #e2e6ee; border-radius:10px;
    font-size:14px; width:100%; font-family:inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  input:focus, select:focus, textarea:focus {
    outline:none; border-color:#4a7fd6; box-shadow:0 0 0 3px #eaf1fd;
  }
  textarea { resize:vertical; }

  .error { color:#e2574c; font-size:12px; min-height:14px; display:block; margin-top:3px; }

  .form-buttons { margin-top:6px; }
  button {
    padding:10px 22px; border:none; border-radius:999px; cursor:pointer;
    font-weight:600; font-size:14px; transition: all 0.2s ease;
  }
  .btn-add { background:#4a7fd6; color:#fff; }
  .btn-add:hover { background:#3f6fc0; box-shadow:0 6px 14px rgba(74,127,214,0.3); transform: translateY(-1px); }
  .btn-clear { background:#eef1f6; color:#2b2f38; margin-left:10px; }
  .btn-clear:hover { background:#e2e6ee; }

  .filters { display:flex; gap:12px; margin-bottom:22px; }
  .filters input { flex:2; }
  .filters select { flex:1; }

  .expense-card {
    background:#fff; border-radius:14px; padding:16px 18px; margin-bottom:12px;
    box-shadow:0 4px 12px rgba(43,47,56,0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .expense-card:hover { transform: translateY(-2px); box-shadow:0 8px 18px rgba(43,47,56,0.1); }

  .expense-top { display:flex; justify-content:space-between; align-items:center; }
  .expense-title { font-weight:600; font-size:15.5px; }
  .expense-amount { color:#3fb98c; font-weight:700; font-size:16px; }

  .expense-meta { font-size:12px; color:#767c88; margin:8px 0; display:flex; align-items:center; gap:8px; }
  .category-tag { background:#eaf1fd; color:#4a7fd6; padding:3px 10px; border-radius:999px; font-weight:600; }

  .expense-desc { font-size:13px; color:#767c88; margin-bottom:12px; }

  .card-actions { display:flex; gap:8px; }
  .btn-edit { background:#e7f8f1; color:#3fb98c; padding:6px 14px; font-size:12.5px; }
  .btn-edit:hover { background:#d7f2e6; }
  .btn-delete { background:#fdecea; color:#e2574c; padding:6px 14px; font-size:12.5px; }
  .btn-delete:hover { background:#fadbd8; }

  .empty-state { text-align:center; color:#767c88; padding:50px 20px; display:none; }
  .empty-state .icon { font-size:40px; margin-bottom:10px; }
  .empty-state p { font-size:16px; font-weight:600; color:#2b2f38; margin-bottom:4px; }

  @media (max-width: 600px) {
    .summary { flex-direction:column; }
    .filters { flex-direction:column; }
  }
</style>
</head>
<body>

<header>
  <h1>Expense Tracker</h1>
  <p>Keep an eye on where your money goes</p>
</header>

<div class="container">

  <div class="summary">
    <div class="summary-card">
      <span class="label">Total Spending</span>
      <span class="value" id="totalSpending">₹0</span>
    </div>
    <div class="summary-card">
      <span class="label">Total Transactions</span>
      <span class="value" id="totalTransactions">0</span>
    </div>
    <div class="summary-card">
      <span class="label">Highest Expense</span>
      <span class="value" id="highestExpense">₹0</span>
    </div>
  </div>

  <div class="form-box">
    <h2 id="formTitle">Add Expense</h2>
    <form id="expenseForm">
      <input type="hidden" id="expenseId" />
      <div class="row">
        <div>
          <label for="title">Title</label>
          <input type="text" id="title" placeholder="e.g. Lunch with friends" />
          <span class="error" id="titleError"></span>
        </div>
        <div>
          <label for="amount">Amount (₹)</label>
          <input type="number" id="amount" placeholder="e.g. 250" step="0.01" />
          <span class="error" id="amountError"></span>
        </div>
      </div>
      <div class="row">
        <div>
          <label for="category">Category</label>
          <select id="category">
            <option value="">Select category</option>
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Health</option>
            <option>Entertainment</option>
            <option>Others</option>
          </select>
          <span class="error" id="categoryError"></span>
        </div>
        <div>
          <label for="date">Date</label>
          <input type="date" id="date" />
          <span class="error" id="dateError"></span>
        </div>
      </div>
      <div class="row">
        <div>
          <label for="description">Description (optional)</label>
          <textarea id="description" placeholder="Add a short note..." rows="2"></textarea>
        </div>
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn-add" id="submitBtn">Add Expense</button>
        <button type="button" class="btn-clear" id="clearBtn">Clear</button>
      </div>
    </form>
  </div>

  <div class="filters">
    <input type="text" id="searchInput" placeholder="Search by title..." />
    <select id="filterCategory">
      <option value="All">All Categories</option>
      <option>Food</option>
      <option>Travel</option>
      <option>Shopping</option>
      <option>Bills</option>
      <option>Health</option>
      <option>Entertainment</option>
      <option>Others</option>
    </select>
  </div>

  <div id="expenseList"></div>
  <div class="empty-state" id="emptyState">
    <div class="icon"></div>
    <p>No expenses yet</p>
    <span>Add your first expense above to get started!</span>
  </div>

</div>

<script>
  const form = document.getElementById("expenseForm");
  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");

  const expenseIdField = document.getElementById("expenseId");
  const titleInput = document.getElementById("title");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const dateInput = document.getElementById("date");
  const descInput = document.getElementById("description");

  const searchInput = document.getElementById("searchInput");
  const filterCategory = document.getElementById("filterCategory");

  const expenseList = document.getElementById("expenseList");
  const emptyState = document.getElementById("emptyState");

  let expenses = [];

  async function loadExpenses() {
    const search = searchInput.value.trim();
    const category = filterCategory.value;
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category !== "All") params.append("category", category);

    const res = await fetch("/api/expenses?" + params.toString());
    expenses = await res.json();
    renderExpenses();
    updateSummary();
  }

  function renderExpenses() {
    expenseList.innerHTML = "";
    if (expenses.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    expenses.forEach((exp) => {
      const div = document.createElement("div");
      div.className = "expense-card";
      const dateStr = new Date(exp.date).toLocaleDateString();
      div.innerHTML = \`
        <div class="expense-top">
          <span class="expense-title">\${exp.title}</span>
          <span class="expense-amount">₹\${exp.amount.toFixed(2)}</span>
        </div>
        <div class="expense-meta">
          <span class="category-tag">\${exp.category}</span>
          <span>\${dateStr}</span>
        </div>
        \${exp.description ? '<div class="expense-desc">' + exp.description + '</div>' : ""}
        <div class="card-actions">
          <button class="btn-edit" onclick="editExpense('\${exp._id}')">Edit</button>
          <button class="btn-delete" onclick="deleteExpense('\${exp._id}')">Delete</button>
        </div>
      \`;
      expenseList.appendChild(div);
    });
  }

  function updateSummary() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const highest = expenses.length ? Math.max(...expenses.map((e) => e.amount)) : 0;
    document.getElementById("totalSpending").textContent = "₹" + total.toFixed(2);
    document.getElementById("totalTransactions").textContent = expenses.length;
    document.getElementById("highestExpense").textContent = "₹" + highest.toFixed(2);
  }

  function validate() {
    let ok = true;
    document.getElementById("titleError").textContent = "";
    document.getElementById("amountError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("dateError").textContent = "";

    if (!titleInput.value.trim()) {
      document.getElementById("titleError").textContent = "Title is required";
      ok = false;
    }
    if (!amountInput.value || Number(amountInput.value) <= 0) {
      document.getElementById("amountError").textContent = "Amount must be greater than 0";
      ok = false;
    }
    if (!categoryInput.value) {
      document.getElementById("categoryError").textContent = "Category is required";
      ok = false;
    }
    if (!dateInput.value) {
      document.getElementById("dateError").textContent = "Date is required";
      ok = false;
    } else {
      const selectedDate = new Date(dateInput.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        document.getElementById("dateError").textContent = "Future date is not allowed";
        alert("Incorrect date selected! You cannot pick a future date.");
        ok = false;
      }
    }
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: titleInput.value.trim(),
      amount: Number(amountInput.value),
      category: categoryInput.value,
      date: dateInput.value,
      description: descInput.value.trim(),
    };

    const id = expenseIdField.value;
    const endpoint = id ? "/api/expenses/" + id : "/api/expenses";
    const method = id ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.message || "Something went wrong");
      return;
    }

    resetForm();
    loadExpenses();
  });

  function editExpense(id) {
    const exp = expenses.find((e) => e._id === id);
    if (!exp) return;
    expenseIdField.value = exp._id;
    titleInput.value = exp.title;
    amountInput.value = exp.amount;
    categoryInput.value = exp.category;
    dateInput.value = exp.date.slice(0, 10);
    descInput.value = exp.description || "";
    formTitle.textContent = "Edit Expense";
    submitBtn.textContent = "Update Expense";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;
    await fetch("/api/expenses/" + id, { method: "DELETE" });
    loadExpenses();
  }

  function resetForm() {
    form.reset();
    expenseIdField.value = "";
    formTitle.textContent = "Add Expense";
    submitBtn.textContent = "Add Expense";
  }

  clearBtn.addEventListener("click", resetForm);
  searchInput.addEventListener("input", loadExpenses);
  filterCategory.addEventListener("change", loadExpenses);

  loadExpenses();
</script>
</body>
</html>
  `;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const reqPath = parsed.pathname;
  const query = parsed.query;

  if (reqPath === "/api/expenses" && req.method === "GET") {
    return getExpenses(req, res, query);
  }

  if (reqPath === "/api/expenses" && req.method === "POST") {
    return addExpense(req, res);
  }

  if (reqPath.startsWith("/api/expenses/") && req.method === "PUT") {
    const id = reqPath.split("/")[3];
    return updateExpense(req, res, id);
  }

  if (reqPath.startsWith("/api/expenses/") && req.method === "DELETE") {
    const id = reqPath.split("/")[3];
    return deleteExpense(req, res, id);
  }

  if (reqPath === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(getHomePage());
  }

  sendJSON(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});