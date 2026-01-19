document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const tableBody = document.getElementById('productTableBody');
    const messageDiv = document.getElementById('message');
    const categorySelect = document.getElementById('category_id');
    const providerSelect = document.getElementById('proveedor_id');
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
                categorySelect.add(new Option(cat.nombre, cat.id));
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProviders = async (categoryId) => {
        providerSelect.innerHTML = '<option value="">Seleccione un proveedor</option>';
        if (!categoryId) {
            providerSelect.disabled = true;
            return;
        }
        
        try {
            providerSelect.disabled = false;
            // Fetch providers for this category specifically
            const providers = await window.api.get('/proveedores', { category_id: categoryId });
            providers.forEach(prov => {
                providerSelect.add(new Option(prov.nombre, prov.id));
            });
        } catch (error) {
            console.error('Error loading providers:', error);
            providerSelect.innerHTML = '<option value="">Error cargando proveedores</option>';
        }
    };

    const loadProducts = async () => {
        try {
            const products = await window.api.get('/productos');
            tableBody.innerHTML = '';
            products.forEach(prod => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${prod.nombre}</td>
                    <td>${prod.sku || '-'}</td>
                    <td>${prod.categorias ? prod.categorias.nombre : 'N/A'}</td>
                    <td>${prod.proveedores ? prod.proveedores.nombre : 'N/A'}</td>
                    <td>$${prod.precio}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editProduct('${prod.id}', '${prod.nombre}', '${prod.sku || ''}', '${prod.category_id}', '${prod.proveedor_id}', '${prod.precio}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct('${prod.id}')">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Category Change Event
    categorySelect.addEventListener('change', (e) => {
        loadProviders(e.target.value);
    });

    window.editProduct = async (id, nombre, sku, catId, provId, precio) => {
        isEditing = true;
        editId = id;
        document.getElementById('productId').value = id;
        document.getElementById('nombre').value = nombre;
        document.getElementById('sku').value = sku;
        document.getElementById('precio').value = precio;
        
        // Set category first
        document.getElementById('category_id').value = catId;
        
        // Load providers for that category, then set provider
        await loadProviders(catId);
        document.getElementById('proveedor_id').value = provId;

        saveBtn.textContent = 'Actualizar Producto';
        cancelBtn.style.display = 'inline-block';
    };

    window.deleteProduct = async (id) => {
        if (!confirm('¿Eliminar producto?')) return;
        try {
            await window.api.delete(`/productos/${id}`);
            showMessage('Producto eliminado');
            loadProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    cancelBtn.addEventListener('click', () => {
        isEditing = false;
        editId = null;
        form.reset();
        saveBtn.textContent = 'Guardar Producto';
        cancelBtn.style.display = 'none';
        providerSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
        providerSelect.disabled = true;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('nombre').value,
            sku: document.getElementById('sku').value,
            category_id: document.getElementById('category_id').value,
            proveedor_id: document.getElementById('proveedor_id').value,
            precio: parseFloat(document.getElementById('precio').value)
        };

        try {
            if (isEditing) {
                await window.api.put(`/productos/${editId}`, data);
                showMessage('Producto actualizado');
            } else {
                await window.api.post('/productos', data);
                showMessage('Producto creado');
            }
            form.reset();
            isEditing = false;
            editId = null;
            providerSelect.innerHTML = '<option value="">Seleccione una categoría primero</option>';
            providerSelect.disabled = true;
            saveBtn.textContent = 'Guardar Producto';
            cancelBtn.style.display = 'none';
            loadProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    loadCategories();
    loadProducts();
});
