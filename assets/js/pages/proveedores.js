import { apiGet, apiPost, apiPut, apiDelete } from "/assets/js/api.js"; 

async function getElements() {
  return {
    tableBody: document.getElementById("proveedoresTableBody"),
    form: document.getElementById("formProveedor"),

    // modal elements
    modal: document.getElementById('proveedorModal'),
    modalForm: document.getElementById('modalFormProveedor'),
    btnOpenModal: document.getElementById('btnOpenModalProveedor'),
    btnCloseModal: document.getElementById('btnCloseModalProveedor'),
    btnCancelModal: document.getElementById('btnCancelModalProveedor')
  };
}

let editId = null;

// 1. Listar proveedores
export async function cargarProveedores() {
  const { tableBody } = await getElements();
  if (!tableBody) return;

  const data = await apiGet("proveedores");
  if (data?.error) {
    alert(data.error);
    return;
  }

  tableBody.innerHTML = (data || []).map(p => `
    <tr>
      <td class="px-4 py-2">${p.nombre}</td>
      <td class="px-4 py-2">${p.direccion}</td>
      <td class="px-4 py-2">${p.telefono}</td>
      <td class="px-4 py-2">${p.email}</td>
      <td class="px-4 py-2">
        <button class="bg-blue-600 px-2 py-1 rounded" onclick="editarProveedor('${p.id}')">Editar</button>
        <button class="bg-red-600 px-2 py-1 rounded" onclick="eliminarProveedor('${p.id}')">Eliminar</button>
      </td>
    </tr>
  `).join("");
}
// 2. Crear proveedor
async function crearProveedorHandler(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombreModal") ? document.getElementById("nombreModal").value : '';
  const direccion = document.getElementById("direccionModal") ? document.getElementById("direccionModal").value : '';
  const telefono = document.getElementById("telefonoModal") ? document.getElementById("telefonoModal").value : '';
  const email = document.getElementById("emailModal") ? document.getElementById("emailModal").value : '';

    let res;
    if (editId) {
      res = await apiPut(`proveedores/${editId}`, { nombre, direccion, telefono, email });
    } else {
      res = await apiPost("proveedores", { nombre, direccion, telefono, email });
    }

    if (res?.error) {
        alert(res.error);
    } else {
        alert(editId ? "Proveedor actualizado" : "Proveedor creado");
        const { form } = await getElements();
        if (form) form.reset();
        // reset modal fields if present
        const nombreEl = document.getElementById('nombreModal');
        const direccionEl = document.getElementById('direccionModal');
        const telefonoEl = document.getElementById('telefonoModal');
        const emailEl = document.getElementById('emailModal');
        if (nombreEl) nombreEl.value = '';
        if (direccionEl) direccionEl.value = '';
        if (telefonoEl) telefonoEl.value = '';
        if (emailEl) emailEl.value = '';
        editId = null;
        // reset modal title
        const modalTitle = document.getElementById('proveedorModalTitle');
        if (modalTitle) modalTitle.textContent = 'Crear proveedor';
    }
// 3. Editar proveedor
window.editarProveedor = async (id) => {
    try {
        const { modal } = await getElements();
        // try to fetch product details
        let data;
        try {
            data = await apiGet(`proveedores/${id}`);
        } catch (e) {
            data = null;
        }

        // populate modal fields
        const nombreEl = document.getElementById('nombreModal');
        const direccionEl = document.getElementById('direccionModal');
        const telefonoEl = document.getElementById('telefonoModal');
        const emailEl = document.getElementById('emailModal');
        if (data) {
            if (nombreEl) nombreEl.value = data.nombre || '';
            if (direccionEl) direccionEl.value = data.direccion || '';
            if (telefonoEl) telefonoEl.value = data.telefono || '';
            if (emailEl) emailEl.value = data.email || '';
        }

        editId = id;
        const modalTitle = document.getElementById('proveedorModalTitle');
        if (modalTitle) modalTitle.textContent = 'Editar proveedor';

        if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    } catch (e) {
        console.error('Error opening edit modal', e);
        alert('No se pudo abrir el editor');
    }
}
// 4 eliminar proveedor
    window.eliminarProveedor = async (id) => {
    if (!confirm("¿Está seguro de que desea eliminar este proveedor?")) return;

    const res = await apiDelete(`proveedores/${id}`);
    if (res?.error) {
      alert(res.error);
    } else {
      alert("Proveedor eliminado");
      await cargarProveedores();
    }
  }
};

// Inicialización si se carga directo
export async function initProveedoresPage() {
    const { form, btnOpenModal, btnCloseModal, btnCancelModal, modalForm, modal } = await getElements();
    // legacy inline form (if present)
    if (form) form.addEventListener("submit", crearProveedorHandler);
    // modal open/close handlers
    if (btnOpenModal && modal) btnOpenModal.addEventListener('click', () => { modal.classList.remove('hidden'); modal.classList.add('flex'); });
    if (btnCloseModal && modal) btnCloseModal.addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });
    if (btnCancelModal && modal) btnCancelModal.addEventListener('click', () => { modal.classList.add('hidden'); modal.classList.remove('flex'); });
    if (modalForm) modalForm.addEventListener('submit', async (e) => {
        await crearProveedorHandler(e);
        // close modal on success (assume crearProveedorHandler resets and reloads)
        if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    });
    await cargarProveedores();
}

document.addEventListener("DOMContentLoaded", () => {
  initProveedoresPage();
});
