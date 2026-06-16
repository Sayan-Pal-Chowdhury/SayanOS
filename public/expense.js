const form = document.getElementById("expenseForm");
const titleInput = document.getElementById("expenseTitle");
const amountInput = document.getElementById("expenseAmount");
const categoryInput = document.getElementById("expenseCategory");
const list = document.getElementById("expenseList");
const todayTotal = document.getElementById("todayTotal");
const monthTotal = document.getElementById("monthTotal");

const storageKey = "sayanOSExpenses";
let expenses = JSON.parse(localStorage.getItem(storageKey) || "[]");

function formatMoney(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(expenses));
}

function render() {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const monthKey = todayKey.slice(0, 7);
  const today = expenses
    .filter(item => item.date.slice(0, 10) === todayKey)
    .reduce((sum, item) => sum + item.amount, 0);
  const month = expenses
    .filter(item => item.date.slice(0, 7) === monthKey)
    .reduce((sum, item) => sum + item.amount, 0);

  todayTotal.textContent = formatMoney(today);
  monthTotal.textContent = formatMoney(month);

  if (!expenses.length) {
    list.innerHTML = "<p class=\"hero-line\">No expenses yet. Add one to test the module.</p>";
    return;
  }

  list.innerHTML = expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(item => `
      <div class="expense-row">
        <div>
          <strong>${escapeHtml(item.title)}</strong><br>
          <small>${escapeHtml(item.category)} · ${new Date(item.date).toLocaleDateString("en-IN")}</small>
        </div>
        <strong>${formatMoney(item.amount)}</strong>
        <button data-id="${item.id}" aria-label="Delete ${escapeHtml(item.title)}">Delete</button>
      </div>
    `)
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  if (!title || !amount) return;

  expenses.push({
    id: crypto.randomUUID(),
    title,
    amount,
    category: categoryInput.value,
    date: new Date().toISOString(),
  });
  save();
  form.reset();
  categoryInput.value = "Food";
  render();
});

list.addEventListener("click", event => {
  const id = event.target?.dataset?.id;
  if (!id) return;
  expenses = expenses.filter(item => item.id !== id);
  save();
  render();
});

render();
