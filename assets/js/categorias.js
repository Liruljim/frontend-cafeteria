document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('categoryForm');
    const tableBody = document.getElementById('categoryTableBody');
    const messageDiv = document.getElementById('message');
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
            tableBody.innerHTML = '';
            categories.forEach(cat => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cat.nombre}</td>
                    <td>${cat.descripcion || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editCategory('${cat.id}', '${cat.nombre}', '${cat.descripcion || ''}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory('${cat.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            showMessage('Error al cargar categorías: ' + error.message, 'error');
        }
    };

    window.editCategory = (id, nombre, descripcion) => {
        isEditing = true;
        editId = id;
        document.getElementById('categoryId').value = id;
        document.getElementById('nombre').value = nombre;
        document.getElementById('descripcion').value = descripcion;
        saveBtn.textContent = 'Actualizar Categoría';
        cancelBtn.style.display = 'inline-block';
    };

    window.deleteCategory = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
        try {
            await window.api.delete(`/categorias/${id}`);
            showMessage('Categoría eliminada');
            loadCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        editId = null;
        form.reset();
        saveBtn.textContent = 'Guardar Categoría';
        cancelBtn.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('nombre').value,
            descripcion: document.getElementById('descripcion').value
        };

        try {
            if (isEditing) {
                await window.api.put(`/categorias/${editId}`, data);
                showMessage('Categoría actualizada');
            } else {
                await window.api.post('/categorias', data);
                showMessage('Categoría creada');
            }
            form.reset();
            isEditing = false;
            editId = null;
            saveBtn.textContent = 'Guardar Categoría';
            cancelBtn.style.display = 'none';
            loadCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    loadCategories();
});
