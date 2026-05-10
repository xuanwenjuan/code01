const CollectionsModule = (function() {
    let tableBody;
    let addBtn;
    let keywordInput;
    let craftSelect;
    let stockSelect;
    let yearSelect;
    let levelSelect;
    let statusSelect;
    let gallerySelect;
    let resetBtn;

    function init() {
        tableBody = document.getElementById('collections-table-body');
        addBtn = document.getElementById('add-collection-btn');
        keywordInput = document.getElementById('filter-keyword');
        craftSelect = document.getElementById('filter-craft');
        stockSelect = document.getElementById('filter-stock');
        yearSelect = document.getElementById('filter-year');
        levelSelect = document.getElementById('filter-level');
        statusSelect = document.getElementById('filter-status');
        gallerySelect = document.getElementById('filter-gallery');
        resetBtn = document.getElementById('reset-filter');

        ensureAllCollectionsConsistent();

        if (addBtn) {
            addBtn.addEventListener('click', function() {
                showForm();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetFilters();
            });
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', Helpers.debounce(function() {
                render();
            }, 300));
        }

        [craftSelect, stockSelect, yearSelect, levelSelect, statusSelect, gallerySelect].forEach(select => {
            if (select) {
                select.addEventListener('change', render);
            }
        });

        updateCraftFilter();
        updateGalleryFilter();
        render();
    }

    function ensureAllCollectionsConsistent() {
        const collections = StorageManager.getCollections();
        let hasChanges = false;

        collections.forEach(collection => {
            const originalStatus = collection.status;
            const originalTotal = collection.totalQuantity;
            const originalAvailable = collection.availableQuantity;

            StatusManager.ensureQuantityConsistency(collection);

            if (collection.status !== originalStatus ||
                collection.totalQuantity !== originalTotal ||
                collection.availableQuantity !== originalAvailable) {
                hasChanges = true;
            }
        });

        if (hasChanges) {
            StorageManager.setCollections(collections);
        }
    }

    function updateCraftFilter() {
        if (!craftSelect) return;

        const options = CraftsModule.getCraftOptions();
        const currentValue = craftSelect.value;
        craftSelect.innerHTML = '<option value="">全部</option>';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            craftSelect.appendChild(option);
        });
        craftSelect.value = currentValue;
    }

    function updateGalleryFilter() {
        if (!gallerySelect) return;

        const collections = StorageManager.getCollections();
        const galleries = [...new Set(collections.map(c => c.gallery).filter(g => g))];
        const currentValue = gallerySelect.value;
        
        gallerySelect.innerHTML = '<option value="">全部</option>';
        galleries.forEach(gallery => {
            const option = document.createElement('option');
            option.value = gallery;
            option.textContent = gallery;
            gallerySelect.appendChild(option);
        });
        gallerySelect.value = currentValue;
    }

    function resetFilters() {
        if (keywordInput) keywordInput.value = '';
        if (craftSelect) craftSelect.value = '';
        if (stockSelect) stockSelect.value = '';
        if (yearSelect) yearSelect.value = '';
        if (levelSelect) levelSelect.value = '';
        if (statusSelect) statusSelect.value = '';
        if (gallerySelect) gallerySelect.value = '';
        render();
    }

    function getFilteredCollections() {
        let collections = StorageManager.getCollections();

        if (keywordInput && keywordInput.value.trim()) {
            const keyword = keywordInput.value.trim().toLowerCase();
            collections = collections.filter(c => 
                c.name.toLowerCase().includes(keyword) ||
                (c.craftsman && c.craftsman.toLowerCase().includes(keyword)) ||
                (c.school && c.school.toLowerCase().includes(keyword)) ||
                (c.gallery && c.gallery.toLowerCase().includes(keyword))
            );
        }

        if (craftSelect && craftSelect.value) {
            collections = collections.filter(c => c.craftId === parseInt(craftSelect.value));
        }

        if (stockSelect && stockSelect.value) {
            const stockValue = stockSelect.value;
            collections = collections.filter(c => {
                const available = c.availableQuantity;
                if (stockValue === '0') return available === 0;
                if (stockValue === '1-5') return available >= 1 && available <= 5;
                if (stockValue === '6-20') return available >= 6 && available <= 20;
                if (stockValue === '21+') return available > 20;
                return true;
            });
        }

        if (yearSelect && yearSelect.value) {
            const yearValue = parseInt(yearSelect.value);
            collections = collections.filter(c => {
                const years = Helpers.calculateStorageYears(c.storageDate);
                if (yearValue === 10) return years >= 10;
                return years <= yearValue;
            });
        }

        if (levelSelect && levelSelect.value) {
            collections = collections.filter(c => c.level === levelSelect.value);
        }

        if (statusSelect && statusSelect.value) {
            collections = collections.filter(c => c.status === statusSelect.value);
        }

        if (gallerySelect && gallerySelect.value) {
            collections = collections.filter(c => c.gallery === gallerySelect.value);
        }

        return collections;
    }

    function getAgedYearsDisplay(collection) {
        const storageYears = Helpers.calculateStorageYears(collection.storageDate);
        const agedWarning = StatusManager.getAgedWarning(storageYears);
        
        let yearsText = `${storageYears} 年`;
        
        if (agedWarning) {
            const warningColor = agedWarning.level === 'warning' ? '#e74c3c' : '#f39c12';
            yearsText += ` <span style="color: ${warningColor};" title="${agedWarning.message}">⚠️</span>`;
        }
        
        return yearsText;
    }

    function render() {
        const collections = getFilteredCollections();

        if (!tableBody) return;

        if (collections.length === 0) {
            Helpers.showEmptyState(tableBody, '暂无符合条件的藏品');
            return;
        }

        tableBody.innerHTML = '';
        collections.forEach(collection => {
            const craftName = CraftsModule.getCraftName(collection.craftId);
            const storageYears = Helpers.calculateStorageYears(collection.storageDate);
            const agedWarning = StatusManager.getAgedWarning(storageYears);
            const isAged = agedWarning && agedWarning.level === 'warning';
            const agedTitle = agedWarning ? agedWarning.message : '';
            
            const row = document.createElement('tr');
            if (isAged) {
                row.style.background = isAged ? 'rgba(243, 156, 18, 0.05)' : '';
            }
            
            row.innerHTML = `
                <td>${collection.id}</td>
                <td>${Helpers.escapeHtml(collection.name)}${isAged ? ' <span style="color: #f39c12;" title="' + agedTitle + '">⚠️</span>' : ''}</td>
                <td>${Helpers.escapeHtml(craftName)}</td>
                <td>${Helpers.escapeHtml(collection.school || '-')}</td>
                <td>${Helpers.escapeHtml(collection.craftsman || '-')}</td>
                <td>${Helpers.getLevelBadge(collection.level)}</td>
                <td>${collection.totalQuantity}</td>
                <td>${collection.availableQuantity}</td>
                <td>${Helpers.escapeHtml(collection.gallery || '-')}</td>
                <td>${getAgedYearsDisplay(collection)}</td>
                <td>${Helpers.getStatusBadge(collection.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-edit" data-action="view" data-id="${collection.id}">详情</button>
                        <button class="action-btn action-btn-edit" data-action="edit" data-id="${collection.id}" ${collection.status === StatusManager.STATUS.SEALED ? 'disabled title="已封存藏品无法编辑"' : ''}>编辑</button>
                        ${collection.status !== StatusManager.STATUS.SEALED ? `
                            <button class="action-btn action-btn-borrow" data-action="borrow" data-id="${collection.id}" ${collection.availableQuantity <= 0 ? 'disabled' : ''}>借用</button>
                        ` : ''}
                        <button class="action-btn action-btn-delete" data-action="delete" data-id="${collection.id}">删除</button>
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

                if (action === 'view') {
                    showCollectionDetail(id);
                } else if (action === 'edit') {
                    editCollection(id);
                } else if (action === 'borrow') {
                    borrowCollection(id);
                } else if (action === 'delete') {
                    deleteCollection(id);
                }
            });
        });
    }

    function showCollectionDetail(id) {
        const collections = StorageManager.getCollections();
        const collection = collections.find(c => c.id === id);

        if (!collection) {
            Toast.error('藏品不存在');
            return;
        }

        const craftName = CraftsModule.getCraftName(collection.craftId);
        const storageYears = Helpers.calculateStorageYears(collection.storageDate);
        const borrowedQuantity = collection.totalQuantity - collection.availableQuantity;
        const agedWarning = StatusManager.getAgedWarning(storageYears);

        const borrows = StorageManager.getBorrows().filter(b => 
            b.collectionId === id && b.status === StatusManager.STATUS.BORROWED
        );

        const logs = StorageManager.getLogs()
            .filter(l => l.collectionName === collection.name)
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);

        let agedWarningHtml = '';
        if (agedWarning) {
            const warningBg = agedWarning.level === 'warning' ? '#fff3cd' : '#d1ecf1';
            const warningText = agedWarning.level === 'warning' ? '#856404' : '#0c5460';
            const warningIcon = agedWarning.level === 'warning' ? '⚠️' : 'ℹ️';
            agedWarningHtml = `
                <div style="background: ${warningBg}; color: ${warningText}; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                    ${warningIcon} ${agedWarning.message}
                </div>
            `;
        }

        let borrowsHtml = '';
        if (borrows.length > 0) {
            borrowsHtml = `
                <div style="margin-top: 20px;">
                    <h4 style="margin-bottom: 10px; color: #2c3e50;">📋 当前借用记录</h4>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
                        ${borrows.map(b => `
                            <div style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                <p style="margin: 0;"><strong>借用编号：</strong>${b.id}</p>
                                <p style="margin: 0;"><strong>借用数量：</strong>${b.quantity} 件</p>
                                <p style="margin: 0;"><strong>借用展馆：</strong>${b.borrowGallery}</p>
                                <p style="margin: 0;"><strong>借用人：</strong>${b.borrowPerson || '-'}</p>
                                <p style="margin: 0;"><strong>借用时间：</strong>${Helpers.formatDateTime(b.borrowDate)}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        let logsHtml = '';
        if (logs.length > 0) {
            logsHtml = `
                <div style="margin-top: 20px;">
                    <h4 style="margin-bottom: 10px; color: #2c3e50;">📝 最近操作记录</h4>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
                        ${logs.map(l => `
                            <div style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; font-size: 0.9rem;">
                                <span style="color: #7f8c8d;">${Helpers.formatDateTime(l.time)}</span>
                                <span style="margin: 0 8px;">|</span>
                                <strong>${l.type}</strong>
                                <span style="margin: 0 8px;">|</span>
                                <span>${l.content}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        Modal.open({
            title: '藏品详情',
            size: 'lg',
            html: `
                <div style="line-height: 2;">
                    ${agedWarningHtml}
                    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                        <div style="flex: 1; min-width: 200px;">
                            <p><strong>藏品编号：</strong>${collection.id}</p>
                            <p><strong>藏品名称：</strong>${Helpers.escapeHtml(collection.name)}</p>
                            <p><strong>工艺品类：</strong>${Helpers.escapeHtml(craftName)}</p>
                            <p><strong>工艺流派：</strong>${Helpers.escapeHtml(collection.school || '-')}</p>
                            <p><strong>制作匠人：</strong>${Helpers.escapeHtml(collection.craftsman || '-')}</p>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p><strong>珍贵等级：</strong>${Helpers.getLevelBadge(collection.level)}</p>
                            <p><strong>藏品状态：</strong>${Helpers.getStatusBadge(collection.status)}</p>
                            <p><strong>总数量：</strong>${collection.totalQuantity} 件</p>
                            <p><strong>可用数量：</strong>${collection.availableQuantity} 件</p>
                            <p><strong>借用数量：</strong>${borrowedQuantity} 件</p>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #e0e0e0; margin-top: 15px; padding-top: 15px;">
                        <p><strong>存放展馆：</strong>${Helpers.escapeHtml(collection.gallery || '-')}</p>
                        <p><strong>入库日期：</strong>${Helpers.formatDate(collection.storageDate)}</p>
                        <p><strong>入库年限：</strong>${getAgedYearsDisplay(collection)}</p>
                        <p><strong>状态说明：</strong>${StatusManager.getStatusDescription(collection.status)}</p>
                    </div>
                    ${borrowsHtml}
                    ${logsHtml}
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary modal-close">关闭</button>
                ${collection.status !== StatusManager.STATUS.SEALED ? `
                    <button class="btn btn-primary modal-edit">编辑</button>
                ` : ''}
                ${collection.status !== StatusManager.STATUS.SEALED && collection.availableQuantity > 0 ? `
                    <button class="btn btn-warning modal-borrow">借用</button>
                ` : ''}
            `
        });

        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', Modal.close);
        }

        const editBtn = document.querySelector('.modal-edit');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                Modal.close();
                setTimeout(function() {
                    editCollection(id);
                }, 300);
            });
        }

        const borrowBtn = document.querySelector('.modal-borrow');
        if (borrowBtn) {
            borrowBtn.addEventListener('click', function() {
                Modal.close();
                setTimeout(function() {
                    borrowCollection(id);
                }, 300);
            });
        }
    }

    function showForm(data = null) {
        const isEdit = data !== null;
        const title = isEdit ? '编辑藏品信息' : '添加藏品信息';
        const craftOptions = CraftsModule.getCraftOptions();

        if (craftOptions.length === 0) {
            Modal.alert({
                title: '提示',
                message: '请先添加工艺品类',
                onClose: function() {
                    document.querySelector('[data-tab="crafts"]').click();
                }
            });
            return;
        }

        if (isEdit && data && data.status === StatusManager.STATUS.SEALED) {
            Modal.alert({
                title: '提示',
                message: '已封存的藏品无法编辑'
            });
            return;
        }

        const today = Helpers.formatDate(new Date());

        Modal.form({
            title,
            size: 'lg',
            fields: [
                {
                    name: 'name',
                    label: '藏品名称',
                    required: true,
                    placeholder: '请输入藏品名称',
                    value: data ? data.name : ''
                },
                {
                    name: 'craftId',
                    label: '工艺品类',
                    type: 'select',
                    required: true,
                    options: craftOptions,
                    value: data ? data.craftId : ''
                },
                {
                    name: 'school',
                    label: '工艺流派',
                    placeholder: '请输入工艺流派',
                    value: data ? data.school : ''
                },
                {
                    name: 'craftsman',
                    label: '制作匠人',
                    placeholder: '请输入制作匠人',
                    value: data ? data.craftsman : ''
                },
                {
                    name: 'level',
                    label: '珍贵等级',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '普通', label: '普通' },
                        { value: '珍贵', label: '珍贵' },
                        { value: '特级', label: '特级' }
                    ],
                    value: data ? data.level : '普通'
                },
                {
                    name: 'totalQuantity',
                    label: '藏品数量',
                    type: 'number',
                    required: true,
                    min: 1,
                    placeholder: '请输入藏品数量',
                    value: data ? data.totalQuantity : ''
                },
                {
                    name: 'gallery',
                    label: '存放展馆',
                    required: true,
                    placeholder: '请输入存放展馆',
                    value: data ? data.gallery : ''
                },
                {
                    name: 'storageDate',
                    label: '入库日期',
                    type: 'date',
                    required: true,
                    value: data ? data.storageDate : today
                }
            ],
            data: data || {},
            helpText: isEdit ? '修改藏品数量时，可用数量会根据总数量自动调整（已借用数量不会改变）。' : '',
            onSubmit: function(formData) {
                const errors = [];

                if (!formData.name || formData.name.trim() === '') {
                    errors.push({ field: 'name', message: '请输入藏品名称' });
                }
                if (!formData.craftId) {
                    errors.push({ field: 'craftId', message: '请选择工艺品类' });
                }
                if (!formData.level) {
                    errors.push({ field: 'level', message: '请选择珍贵等级' });
                }
                if (!formData.totalQuantity || isNaN(Number(formData.totalQuantity)) || Number(formData.totalQuantity) < 1) {
                    errors.push({ field: 'totalQuantity', message: '请输入有效的藏品数量（至少1件）' });
                }
                if (!formData.gallery || formData.gallery.trim() === '') {
                    errors.push({ field: 'gallery', message: '请输入存放展馆' });
                }
                if (!formData.storageDate) {
                    errors.push({ field: 'storageDate', message: '请选择入库日期' });
                } else {
                    const inputDate = new Date(formData.storageDate);
                    const todayDate = new Date(today);
                    if (inputDate > todayDate) {
                        errors.push({ field: 'storageDate', message: '入库日期不能晚于今天' });
                    }
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (isEdit) {
                    updateCollection(data.id, formData);
                } else {
                    createCollection(formData);
                }

                return true;
            }
        });
    }

    function createCollection(formData) {
        const collections = StorageManager.getCollections();
        const newId = StorageManager.incrementCounter('collection');
        const totalQuantity = parseInt(formData.totalQuantity);

        const newCollection = {
            id: newId,
            name: formData.name.trim(),
            craftId: parseInt(formData.craftId),
            school: formData.school || '',
            craftsman: formData.craftsman || '',
            level: formData.level,
            totalQuantity: totalQuantity,
            availableQuantity: totalQuantity,
            gallery: formData.gallery.trim(),
            storageDate: formData.storageDate,
            status: StatusManager.STATUS.NORMAL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        StatusManager.ensureQuantityConsistency(newCollection);

        collections.push(newCollection);
        StorageManager.setCollections(collections);

        const craftName = CraftsModule.getCraftName(newCollection.craftId);

        LogsModule.addLog({
            type: '添加',
            content: `添加藏品：${newCollection.name}（${craftName}），数量：${totalQuantity}件，存放：${newCollection.gallery}，等级：${newCollection.level}`,
            operator: Helpers.getCurrentUser(),
            collectionName: newCollection.name,
            quantityChange: totalQuantity,
            remainingStock: totalQuantity,
            statusChange: newCollection.status
        });

        Toast.success('藏品信息添加成功');
        render();
        updateCraftFilter();
        updateGalleryFilter();
    }

    function editCollection(id) {
        const collections = StorageManager.getCollections();
        const collection = collections.find(c => c.id === id);

        if (!collection) {
            Toast.error('藏品不存在');
            return;
        }

        if (collection.status === StatusManager.STATUS.SEALED) {
            Modal.alert({
                title: '提示',
                message: '已封存的藏品无法编辑'
            });
            return;
        }

        showForm(collection);
    }

    function updateCollection(id, formData) {
        const collections = StorageManager.getCollections();
        const index = collections.findIndex(c => c.id === id);

        if (index === -1) {
            Toast.error('藏品不存在');
            return;
        }

        if (collections[index].status === StatusManager.STATUS.SEALED) {
            Modal.alert({
                title: '提示',
                message: '已封存的藏品无法编辑'
            });
            return;
        }

        const oldName = collections[index].name;
        const oldTotal = collections[index].totalQuantity;
        const oldAvailable = collections[index].availableQuantity;
        const oldGallery = collections[index].gallery;
        const oldLevel = collections[index].level;
        const newTotal = parseInt(formData.totalQuantity);

        const borrowedQuantity = oldTotal - oldAvailable;
        const newAvailable = newTotal - borrowedQuantity;

        if (newAvailable < 0) {
            Modal.alert({
                title: '提示',
                message: `总数量不能小于已借用数量（${borrowedQuantity}件）`
            });
            return;
        }

        collections[index].name = formData.name.trim();
        collections[index].craftId = parseInt(formData.craftId);
        collections[index].school = formData.school || '';
        collections[index].craftsman = formData.craftsman || '';
        collections[index].level = formData.level;
        collections[index].totalQuantity = newTotal;
        collections[index].availableQuantity = newAvailable;
        collections[index].gallery = formData.gallery.trim();
        collections[index].storageDate = formData.storageDate;
        collections[index].updatedAt = new Date().toISOString();

        StatusManager.recalculateStatusForCollection(collections[index], borrowedQuantity);

        StorageManager.setCollections(collections);

        const changes = [];
        if (oldName !== formData.name.trim()) changes.push(`名称：${oldName}→${formData.name.trim()}`);
        if (oldLevel !== formData.level) changes.push(`等级：${oldLevel}→${formData.level}`);
        if (oldGallery !== formData.gallery.trim()) changes.push(`展馆：${oldGallery}→${formData.gallery.trim()}`);
        if (oldTotal !== newTotal) changes.push(`数量：${oldTotal}→${newTotal}`);

        LogsModule.addLog({
            type: '修改',
            content: `修改藏品：${oldName}，${changes.join('；') || '信息更新'}，状态：${collections[index].status}`,
            operator: Helpers.getCurrentUser(),
            collectionName: collections[index].name,
            quantityChange: newTotal - oldTotal,
            remainingStock: newAvailable,
            statusChange: collections[index].status
        });

        Toast.success('藏品信息更新成功');
        render();
        updateGalleryFilter();
    }

    function borrowCollection(id) {
        const collections = StorageManager.getCollections();
        const collection = collections.find(c => c.id === id);

        if (!collection) {
            Toast.error('藏品不存在');
            return;
        }

        if (collection.status === StatusManager.STATUS.SEALED) {
            Toast.error('该藏品已封存，无法借用');
            return;
        }

        if (collection.availableQuantity <= 0) {
            Toast.error('该藏品暂无可用数量');
            return;
        }

        BorrowModule.showBorrowForm(collection);
    }

    function deleteCollection(id) {
        const collections = StorageManager.getCollections();
        const collection = collections.find(c => c.id === id);

        if (!collection) {
            Toast.error('藏品不存在');
            return;
        }

        const borrowedQuantity = collection.totalQuantity - collection.availableQuantity;
        if (borrowedQuantity > 0) {
            Modal.alert({
                title: '提示',
                message: `该藏品有${borrowedQuantity}件正在借用中，请先归还后再删除`
            });
            return;
        }

        Modal.confirm({
            title: '确认删除',
            message: `确定要删除藏品"${collection.name}"吗？\n\n此操作不可恢复，且该藏品的所有操作记录将保留。`,
            type: 'danger',
            confirmText: '删除',
            onConfirm: function() {
                const newCollections = collections.filter(c => c.id !== id);
                StorageManager.setCollections(newCollections);

                const craftName = CraftsModule.getCraftName(collection.craftId);

                LogsModule.addLog({
                    type: '删除',
                    content: `删除藏品：${collection.name}（${craftName}），原数量：${collection.totalQuantity}件，状态：${collection.status}`,
                    operator: Helpers.getCurrentUser(),
                    collectionName: collection.name,
                    quantityChange: -collection.totalQuantity,
                    remainingStock: 0,
                    statusChange: '删除'
                });

                Toast.success('藏品删除成功');
                render();
                updateGalleryFilter();
            }
        });
    }

    function getCollectionById(id) {
        const collections = StorageManager.getCollections();
        return collections.find(c => c.id === id);
    }

    function getAvailableCollections() {
        const collections = StorageManager.getCollections();
        return collections.filter(c => c.availableQuantity > 0 && c.status !== StatusManager.STATUS.SEALED);
    }

    function getBorrowedCollections() {
        const borrows = StorageManager.getBorrows();
        return borrows.filter(b => b.status === StatusManager.STATUS.BORROWED);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        render,
        getCollectionById,
        getAvailableCollections,
        getBorrowedCollections,
        updateCraftFilter,
        updateGalleryFilter
    };
})();
