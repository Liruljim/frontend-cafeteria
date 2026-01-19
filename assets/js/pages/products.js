// assets/js/pages/products.js
import { apiGet, apiPost, apiPut, apiDelete } from "/assets/js/api.js";

function getElements() {
  return {
    tableBody: document.getElementById("productosTableBody"),
    form: document.getElementById("formProducto"),
    // modal elements
    modal: document.getElementById('productoModal'),
    modalForm: document.getElementById('modalFormProducto'),
    btnOpenModal: document.getElementById('btnOpenModalProducto'),
    btnCloseModal: document.getElementById('btnCloseModalProducto'),
    btnCancelModal: document.getElementById('btnCancelModalProducto')
  };
}

let editId = null;

// 1. Listar productos
export async function cargarProductos() {
  const { tableBody } = getElements();
  if (!tableBody) return;

  const data = await apiGet("productos");
  if (data?.error) {
    alert(data.error);
    return;
  }

  tableBody.innerHTML = (data || []).map(p => `
    <tr>
      <td class="px-4 py-2">${p.nombre}</td>
      <td class="px-4 py-2">${p.precio}</td>
      <td class="px-4 py-2">${p.stock}</td>
      <td class="px-4 py-2">
        <button class="bg-blue-600 px-2 py-1 rounded" onclick="editarProducto('${p.id}')">Editar</button>
        <button class="bg-red-600 px-2 py-1 rounded" onclick="eliminarProducto('${p.id}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}

// 2. Crear producto
async function crearProductoHandler(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombreModal") ? document.getElementById("nombreModal").value : (document.getElementById("nombre")?.value || '');
  const precio = document.getElementById("precioModal") ? document.getElementById("precioModal").value : (document.getElementById("precio")?.value || 0);
  const stock = document.getElementById("stockModal") ? document.getElementById("stockModal").value : (document.getElementById("stock")?.value || 0);

  let res;
  if (editId) {
    res = await apiPut(`productos/${editId}`, { nombre, precio, stock });
  } else {
    res = await apiPost("productos", { nombre, precio, stock });
  }

  if (res?.error) {
    alert(res.error);
  } else {
    alert(editId ? "Producto actualizado" : "Producto creado");
    const { form } = getElements();
    if (form) form.reset();
    // reset modal fields if present
    const nombreEl = document.getElementById('nombreModal');
    const precioEl = document.getElementById('precioModal');
    const stockEl = document.getElementById('stockModal');
    if (nombreEl) nombreEl.value = '';
    if (precioEl) precioEl.value = '';
    if (stockEl) stockEl.value = '';
    editId = null;
    // reset modal title
    const modalTitle = document.getElementById('productoModalTitle');
    if (modalTitle) modalTitle.textContent = 'Nuevo producto';
    await cargarProductos();
  }
}

// 3. Editar producto
window.editarProducto = async (id) => {
  try {
    const { modal } = getElements();
    // try to fetch product details
    let data;
    try {
      data = await apiGet(`productos/${id}`);
    } catch (e) {
      data = null;
    }

    // populate modal fields
    const nombreEl = document.getElementById('nombreModal');
    const precioEl = document.getElementById('precioModal');
    const stockEl = document.getElementById('stockModal');
    if (data) {
      if (nombreEl) nombreEl.value = data.nombre || '';
      if (precioEl) precioEl.value = data.precio || '';
      if (stockEl) stockEl.value = data.stock || '';
    }

    editId = id;
    const modalTitle = document.getElementById('productoModalTitle');
    if (modalTitle) modalTitle.textContent = 'Editar producto';

    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  } catch (e) {
    console.error('Error opening edit modal', e);
    alert('No se pudo abrir el editor');
  }
};

// 4. Eliminar producto
window.eliminarProducto = async (id) => {
  if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

  const res = await apiDelete(`productos/${id}`);
  if (res?.error) {
    alert(res.error);
  } else {
    alert("Producto eliminado");
    await cargarProductos();
  }
};

// Inicializar si se carga directo
export async function initProducts() {
  const { form, modal, modalForm, btnOpenModal, btnCloseModal, btnCancelModal } = getElements();

  // legacy inline form (if present)
  if (form) form.addEventListener("submit", crearProductoHandler);

  // modal open/close handlers
  if (btnOpenModal && modal) btnOpenModal.addEventListener('click', () => { modal.classList.remove('hidden'); modal.classList.add('flex'); });
  if (btnCloseModal && modal) btnCloseModal.addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });
  if (btnCancelModal && modal) btnCancelModal.addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });

  if (modalForm) modalForm.addEventListener('submit', async (e) => {
    await crearProductoHandler(e);
    // close modal on success (assume crearProductoHandler resets and reloads)
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  });

  await cargarProductos();
}

document.addEventListener("DOMContentLoaded", () => {
  // fallback: initialize if module loaded before page script
  initProducts().catch(() => {});
});