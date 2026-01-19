document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pisoForm');
    const tableBody = document.getElementById('pisoTableBody');
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

    const loadPisos = async () => {
        try {
            const pisos = await window.api.get('/pisos');
            tableBody.innerHTML = '';
            pisos.forEach(piso => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${piso.nombre}</td>
                    <td>${piso.descripcion || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editPiso('${piso.id}', '${piso.nombre}', '${piso.descripcion || ''}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePiso('${piso.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    window.editPiso = (id, nombre, descripcion) => {
        isEditing = true;
        editId = id;
        document.getElementById('pisoId').value = id;
        document.getElementById('nombre').value = nombre;
        document.getElementById('descripcion').value = descripcion;
        saveBtn.textContent = 'Actualizar Piso';
        cancelBtn.style.display = 'inline-block';
    };

    window.deletePiso = async (id) => {
        if (!confirm('¿Eliminar piso?')) return;
        try {
            await window.api.delete(`/pisos/${id}`);
            showMessage('Piso eliminado');
            loadPisos();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        editId = null;
        form.reset();
        saveBtn.textContent = 'Guardar Piso';
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
                await window.api.put(`/pisos/${editId}`, data);
                showMessage('Piso actualizado');
            } else {
                await window.api.post('/pisos', data);
                showMessage('Piso creado');
            }
            form.reset();
            isEditing = false;
            editId = null;
            saveBtn.textContent = 'Guardar Piso';
            cancelBtn.style.display = 'none';
            loadPisos();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    loadPisos();
});
