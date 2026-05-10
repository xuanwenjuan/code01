const CraftsModule = (function() {
    let tableBody;
    let addBtn;

    function init() {
        tableBody = document.getElementById('crafts-table-body');
        addBtn = document.getElementById('add-craft-btn');

        if (addBtn) {
            addBtn.addEventListener('click', function() {
                showForm();
            });
        }

        render();
    }

    function render() {
        const crafts = StorageManager.getCrafts();
        const collections = StorageManager.getCollections();

        if (!tableBody) return;

        if (crafts.length === 0) {
            Helpers.showEmptyState(tableBody, '暂无工艺品类，请添加');
            return;
        }

        tableBody.innerHTML = '';
        crafts.forEach(craft => {
            const relatedCount = collections.filter(c => c.craftId === craft.id).length;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${craft.id}</td>
                <td>${Helpers.escapeHtml(craft.name)}</td>
                <td>${Helpers.escapeHtml(craft.description || '-')}</td>
                <td>${relatedCount} 件</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" data-action="edit" data-id="${craft.id}">编辑</button>
                        <button class="action-btn action-btn-delete" data-action="delete" data-id="${craft.id}" ${relatedCount > 0 ? 'disabled title="该品类下有藏品，无法删除"' : ''}>删除</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        bindEvents();
    }

    function bindEvents() {
        if (!tableBody) return;

        tableBody.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                const id = parseInt(this.getAttribute('data-id'));

                if (action === 'edit') {
                    editCraft(id);
                } else if (action === 'delete') {
                    deleteCraft(id);
                }
            });
        });
    }

    function showForm(data = null) {
        const isEdit = data !== null;
        const title = isEdit ? '编辑工艺品类' : '添加工艺品类';

        Modal.form({
            title,
            fields: [
                {
                    name: 'name',
                    label: '工艺品类名称',
                    required: true,
                    placeholder: '请输入工艺品类名称',
                    value: data ? data.name : ''
                },
                {
                    name: 'description',
                    label: '描述',
                    type: 'textarea',
                    placeholder: '请输入工艺品类描述',
                    value: data ? data.description : ''
                }
            ],
            data: data || {},
            onSubmit: function(formData) {
                const errors = [];

                if (!formData.name || formData.name.trim() === '') {
                    errors.push({ field: 'name', message: '请输入工艺品类名称' });
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (isEdit) {
                    updateCraft(data.id, formData);
                } else {
                    createCraft(formData);
                }

                return true;
            }
        });
    }

    function createCraft(formData) {
        const crafts = StorageManager.getCrafts();
        const newId = StorageManager.incrementCounter('craft');

        const newCraft = {
            id: newId,
            name: formData.name.trim(),
            description: formData.description || ''
        };

        crafts.push(newCraft);
        StorageManager.setCrafts(crafts);

        LogsModule.addLog({
            type: '添加',
            content: `添加工艺品类：${newCraft.name}`,
            operator: Helpers.getCurrentUser(),
            collectionName: '-',
            quantityChange: 0,
            remainingStock: 0,
            statusChange: '-'
        });

        Toast.success('工艺品类添加成功');
        render();
    }

    function editCraft(id) {
        const crafts = StorageManager.getCrafts();
        const craft = crafts.find(c => c.id === id);

        if (!craft) {
            Toast.error('工艺品类不存在');
            return;
        }

        showForm(craft);
    }

    function updateCraft(id, formData) {
        const crafts = StorageManager.getCrafts();
        const index = crafts.findIndex(c => c.id === id);

        if (index === -1) {
            Toast.error('工艺品类不存在');
            return;
        }

        const oldName = crafts[index].name;
        crafts[index].name = formData.name.trim();
        crafts[index].description = formData.description || '';

        StorageManager.setCrafts(crafts);

        LogsModule.addLog({
            type: '修改',
            content: `修改工艺品类：${oldName} → ${crafts[index].name}`,
            operator: Helpers.getCurrentUser(),
            collectionName: '-',
            quantityChange: 0,
            remainingStock: 0,
            statusChange: '-'
        });

        Toast.success('工艺品类更新成功');
        render();
    }

    function deleteCraft(id) {
        const crafts = StorageManager.getCrafts();
        const collections = StorageManager.getCollections();
        const craft = crafts.find(c => c.id === id);

        if (!craft) {
            Toast.error('工艺品类不存在');
            return;
        }

        const relatedCount = collections.filter(c => c.craftId === id).length;
        if (relatedCount > 0) {
            Toast.error('该品类下有藏品，无法删除');
            return;
        }

        Modal.confirm({
            title: '确认删除',
            message: `确定要删除工艺品类"${craft.name}"吗？此操作不可恢复。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: function() {
                const newCrafts = crafts.filter(c => c.id !== id);
                StorageManager.setCrafts(newCrafts);

                LogsModule.addLog({
                    type: '删除',
                    content: `删除工艺品类：${craft.name}`,
                    operator: Helpers.getCurrentUser(),
                    collectionName: '-',
                    quantityChange: 0,
                    remainingStock: 0,
                    statusChange: '-'
                });

                Toast.success('工艺品类删除成功');
                render();
            }
        });
    }

    function getCraftOptions() {
        const crafts = StorageManager.getCrafts();
        return crafts.map(c => ({ value: c.id, label: c.name }));
    }

    function getCraftName(id) {
        const crafts = StorageManager.getCrafts();
        const craft = crafts.find(c => c.id === id);
        return craft ? craft.name : '未知品类';
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        render,
        getCraftOptions,
        getCraftName
    };
})();
