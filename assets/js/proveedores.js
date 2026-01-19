document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('providerForm');
    const tableBody = document.getElementById('providerTableBody');
    const messageDiv = document.getElementById('message');
    const categorySelect = document.getElementById('category_id');
    const filterCategorySelect = document.getElementById('filterCategory');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');

    let isEditing = false;
    let editId = null;

    const showMessage = (msg, type = 'success') => {
        messageDiv.textContent = msg;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        setTimeout(() => messageDiv.style.display = 'none', 3000);
    };

    const loadCategories = async () => {
        try {
            const categories = await window.api.get('/categorias');
            categories.forEach(cat => {
                const opt1 = new Option(cat.nombre, cat.id);
                const opt2 = new Option(cat.nombre, cat.id);
                categorySelect.add(opt1);
                filterCategorySelect.add(opt2);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProviders = async () => {
        try {
            const filterId = filterCategorySelect.value;
            const params = filterId ? { category_id: filterId } : {};
            const providers = await window.api.get('/proveedores', params);
            
            tableBody.innerHTML = '';
            providers.forEach(prov => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${prov.nombre}</td>
                    <td>${prov.categorias ? prov.categorias.nombre : 'N/A'}</td>
                    <td>${prov.telefono || '-'}</td>
                    <td>${prov.email || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editProvider('${prov.id}', '${prov.nombre}', '${prov.category_id}', '${prov.telefono || ''}', '${prov.email || ''}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProvider('${prov.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    window.editProvider = (id, nombre, catId, tel, email) => {
        isEditing = true;
        editId = id;
        document.getElementById('providerId').value = id;
        document.getElementById('nombre').value = nombre;
        document.getElementById('category_id').value = catId;
        document.getElementById('telefono').value = tel;
        document.getElementById('email').value = email;
        
        saveBtn.textContent = 'Actualizar Proveedor';
        cancelBtn.style.display = 'inline-block';
    };

    window.deleteProvider = async (id) => {
        if (!confirm('¿Eliminar proveedor?')) return;
        try {
            await window.api.delete(`/proveedores/${id}`);
            showMessage('Proveedor eliminado');
            loadProviders();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Filter change
    filterCategorySelect.addEventListener('change', loadProviders);

    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        editId = null;
        form.reset();
        saveBtn.textContent = 'Guardar Proveedor';
        cancelBtn.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('nombre').value,
            category_id: document.getElementById('category_id').value,
            telefono: document.getElementById('telefono').value,
            email: document.getElementById('email').value
        };

        try {
            if (isEditing) {
                await window.api.put(`/proveedores/${editId}`, data);
                showMessage('Proveedor actualizado');
            } else {
                await window.api.post('/proveedores', data);
                showMessage('Proveedor creado');
            }
            form.reset();
            isEditing = false;
            editId = null;
            saveBtn.textContent = 'Guardar Proveedor';
            cancelBtn.style.display = 'none';
            loadProviders();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    loadCategories();
    loadProviders();
});
