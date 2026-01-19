document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('inventoryTableBody');
    const movementsBody = document.getElementById('movementsTableBody');
    const filterPiso = document.getElementById('filterPiso');
    const filterProducto = document.getElementById('filterProducto');
    
    // Modal elements
    const modal = document.getElementById('modalAjuste');
    const modalInfo = document.getElementById('modalInfo');
    const ajusteForm = document.getElementById('ajusteForm');
    const ajusteModo = document.getElementById('ajusteModo');
    const cantidadLabel = document.getElementById('cantidadLabel');

    const loadFilters = async () => {
        try {
            const [pisos, productos] = await Promise.all([
                window.api.get('/pisos'),
                window.api.get('/productos')
            ]);

            pisos.forEach(p => filterPiso.add(new Option(p.nombre, p.id)));
            productos.forEach(p => filterProducto.add(new Option(p.nombre, p.id)));
        } catch (error) {
            console.error(error);
        }
    };

    window.loadInventory = async () => {
        try {
            const params = {};
            if (filterPiso.value) params.piso_id = filterPiso.value;
            if (filterProducto.value) params.producto_id = filterProducto.value;

            const inventory = await window.api.get('/inventario', params);
            tableBody.innerHTML = '';
            
            if (inventory.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay registros de inventario (Cree productos y pisos primero)</td></tr>';
                return;
            }

            inventory.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.productos ? item.productos.nombre : 'Unknown'}</td>
                    <td>${item.productos ? item.productos.sku : '-'}</td>
                    <td>${item.pisos ? item.pisos.nombre : 'Unknown'}</td>
                    <td style="font-weight:bold; font-size:1.1em">${item.stock}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openModal('${item.producto_id}', '${item.piso_id}', '${item.productos.nombre}', '${item.pisos.nombre}')">Ajustar Stock</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
            
            loadMovements(); // Also refresh log
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    };

    const loadMovements = async () => {
        try {
            const movements = await window.api.get('/inventario/movimientos');
            movementsBody.innerHTML = '';
            movements.forEach(mov => {
                const tr = document.createElement('tr');
                const date = new Date(mov.fecha).toLocaleString();
                tr.innerHTML = `
                    <td>${date}</td>
                    <td>${mov.productos ? mov.productos.nombre : '-'}</td>
                    <td>${mov.pisos ? mov.pisos.nombre : '-'}</td>
                    <td><span style="font-weight:bold; color:${mov.tipo_movimiento === 'ENTRADA' ? 'green' : (mov.tipo_movimiento === 'SALIDA' ? 'red' : 'blue')}">${mov.tipo_movimiento}</span></td>
                    <td>${mov.cantidad}</td>
                    <td>${mov.observacion || '-'}</td>
                `;
                movementsBody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading movements:', error);
        }
    };

    // Modal Logic
    window.openModal = (prodId, pisoId, prodName, pisoName) => {
        document.getElementById('ajusteProdId').value = prodId;
        document.getElementById('ajustePisoId').value = pisoId;
        modalInfo.textContent = `Ajustando: ${prodName} en ${pisoName}`;
        ajusteForm.reset();
        updateLabel();
        modal.style.display = 'flex';
    };

    window.closeModal = () => {
        modal.style.display = 'none';
    };

    window.updateLabel = () => {
        if (ajusteModo.value === 'SET') {
            cantidadLabel.textContent = 'Nuevo stock total';
            document.getElementById('ajusteCantidad').placeholder = "Ej. 50";
        } else {
            cantidadLabel.textContent = 'Cantidad a variar (+/-)';
            document.getElementById('ajusteCantidad').placeholder = "Ej. 10 o -5";
        }
    };

    ajusteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            producto_id: document.getElementById('ajusteProdId').value,
            piso_id: document.getElementById('ajustePisoId').value,
            modo: document.getElementById('ajusteModo').value,
            cantidad: parseInt(document.getElementById('ajusteCantidad').value),
            observacion: document.getElementById('ajusteObs').value
        };

        try {
            await window.api.put('/inventario', data);
            closeModal();
            loadInventory(); // Refresh table
        } catch (error) {
            alert(error.message);
        }
    });

    // Close modal on outside click
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    loadFilters();
    loadInventory();
});
