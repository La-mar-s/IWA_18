/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath()
    let column = null

    for (const element of path) {
        const { area } = element.dataset
        if (area) {
            column = area
            break;
        }
    }

    if (!column) return
    updateDragging({ over: column })
    updateDraggingHtml({ over: column })
}


const handleDragStart = (event) => {
  const orderId = event.target.dataset.id;
  updateDragging({ source: orderId });
};

const handleDragEnd = (event) => {
  updateDragging({ source: null });
  updateDraggingHtml({ over: null });
};

const handleHelpToggle = (event) => {
  html.help.overlay.classList.toggle("visible");
  if (html.help.overlay.classList.contains("visible")) {
    html.help.overlay.focus();
  } else {
    html.other.add.focus();
  }
};

const handleAddToggle = (event) => {
  if (html.add.overlay.classList.contains("visible")) {
    html.add.overlay.classList.remove("visible");
    html.add.title.value = "";
    html.add.table.selectedIndex = 0;
  } else {
    html.add.overlay.classList.add("visible");
    html.add.title.focus();
  }
};

const handleAddSubmit = (event) => {
  event.preventDefault();
  const title = html.add.title.value.trim();
  const table = html.add.table.value;

  if (title && table) {
    const order = createOrderData({ title, table, column: "ordered" });
    state.orders[order.id] = order;
    html.columns.ordered.appendChild(createOrderHtml(order));
    handleAddToggle();
  }
};

const handleEditToggle = (event) => {
  const orderId = event.target.dataset.id;
  if (orderId) {
    const order = state.orders[orderId];
    html.edit.title.value = order.title;
    html.edit.table.value = order.table;
    html.edit.column.value = order.column;
    html.edit.id.value = order.id;
    html.edit.overlay.classList.add("visible");
    html.edit.title.focus();
  }
};

const handleEditSubmit = (event) => {
  event.preventDefault();
  const orderId = html.edit.id.value;
  const title = html.edit.title.value.trim();
  const table = html.edit.table.value;
  const column = html.edit.column.value;

  if (title && table && column && orderId) {
    const order = state.orders[orderId];
    order.title = title;
    order.table = table;
    order.column = column;

    const orderHtml = document.querySelector(`[data-id="${orderId}"]`);
    orderHtml.querySelector("[data-order-title]").textContent = title;
    orderHtml.querySelector("[data-order-table]").textContent = table;

    handleEditToggle();
  }
};

const handleDelete = (event) => {
  const orderId = html.edit.id.value;
  if (orderId && confirm("Are you sure you want to delete this order?")) {
    const orderHtml = document.querySelector(`[data-id="${orderId}"]`);
    orderHtml.remove();
    delete state.orders[orderId];
    handleEditToggle();
  }
};


html.add.cancel.addEventListener('click', handleAddToggle)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpToggle)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart)
    htmlColumn.addEventListener('dragend', handleDragEnd)
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver)
}