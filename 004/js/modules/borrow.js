const BorrowModule = (function() {
    let tableBody;
    let borrowBtn;
    let returnBtn;
    let sealBtn;

    function init() {
        tableBody = document.getElementById('borrow-table-body');
        borrowBtn = document.getElementById('borrow-btn');
        returnBtn = document.getElementById('return-btn');
        sealBtn = document.getElementById('seal-btn');

        if (borrowBtn) {
            borrowBtn.addEventListener('click', function() {
                showBorrowForm();
            });
        }

        if (returnBtn) {
            returnBtn.addEventListener('click', function() {
                showReturnForm();
            });
        }

        if (sealBtn) {
            sealBtn.addEventListener('click', function() {
                showSealForm();
            });
        }

        render();
    }

    function render() {
        const borrows = StorageManager.getBorrows().filter(b => b.status === StatusManager.STATUS.BORROWED);

        if (!tableBody) return;

        if (borrows.length === 0) {
            Helpers.showEmptyState(tableBody, '暂无借用中的藏品');
            return;
        }

        tableBody.innerHTML = '';
        borrows.forEach(borrow => {
            const collection = CollectionsModule.getCollectionById(borrow.collectionId);
            const collectionName = collection ? collection.name : '未知藏品';
            const isOverdue = borrow.expectedReturn && new Date(borrow.expectedReturn) < new Date();
            const overdueText = isOverdue ? '<span style="color: #e74c3c; margin-left: 5px;">(已逾期)</span>' : '';
            
            const row = document.createElement('tr');
            if (isOverdue) {
                row.style.background = 'rgba(231, 76, 60, 0.05)';
            }
            
            row.innerHTML = `
                <td>${borrow.id}</td>
                <td>${Helpers.escapeHtml(collectionName)}</td>
                <td>${borrow.quantity}</td>
                <td>${Helpers.escapeHtml(borrow.borrowGallery)}</td>
                <td>${Helpers.escapeHtml(borrow.operator)}</td>
                <td>${Helpers.formatDateTime(borrow.borrowDate)}</td>
                <td>${borrow.expectedReturn ? Helpers.formatDate(borrow.expectedReturn) : '-'}${overdueText}</td>
                <td>${Helpers.getStatusBadge(borrow.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-return" data-action="return" data-id="${borrow.id}">归还</button>
                        <button class="action-btn action-btn-edit" data-action="view" data-id="${borrow.id}">详情</button>
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

                if (action === 'return') {
                    returnBorrowById(id);
                } else if (action === 'view') {
                    showBorrowDetail(id);
                }
            });
        });
    }

    function showBorrowForm(collection = null) {
        const availableCollections = CollectionsModule.getAvailableCollections();

        if (availableCollections.length === 0) {
            Modal.alert({
                title: '提示',
                message: '暂无可借用的藏品'
            });
            return;
        }

        const collectionOptions = availableCollections.map(c => ({
            value: c.id,
            label: `${c.name}（剩余${c.availableQuantity}件）- ${c.level}`,
            level: c.level
        }));

        const selectedCollection = collection || availableCollections[0];
        const maxQuantity = selectedCollection ? selectedCollection.availableQuantity : 1;
        const isPrecious = selectedCollection && (selectedCollection.level === StatusManager.LEVEL.PRECIOUS || selectedCollection.level === StatusManager.LEVEL.SPECIAL);

        Modal.form({
            title: '展品借用登记',
            size: 'lg',
            fields: [
                {
                    name: 'collectionId',
                    label: '选择藏品',
                    type: 'select',
                    required: true,
                    options: collectionOptions.map(opt => ({ value: opt.value, label: opt.label })),
                    value: collection ? collection.id : ''
                },
                {
                    name: 'quantity',
                    label: '借用数量',
                    type: 'number',
                    required: true,
                    min: 1,
                    max: maxQuantity,
                    placeholder: `最多可借${maxQuantity}件`,
                    value: 1,
                    help: `当前选择的藏品最多可借${maxQuantity}件${isPrecious ? '（珍贵/特级藏品建议最多借1件）' : ''}`
                },
                {
                    name: 'borrowGallery',
                    label: '借用展馆',
                    required: true,
                    placeholder: '请输入借用展馆名称'
                },
                {
                    name: 'borrowPerson',
                    label: '借用人',
                    required: true,
                    placeholder: '请输入借用人姓名'
                },
                {
                    name: 'operator',
                    label: '经办人',
                    required: true,
                    placeholder: '请输入经办人姓名',
                    value: Helpers.getCurrentUser()
                },
                {
                    name: 'expectedReturn',
                    label: '预计归还日期',
                    type: 'date',
                    required: true,
                    value: Helpers.formatDate(Helpers.addDays(new Date(), 7))
                },
                {
                    name: 'remark',
                    label: '备注',
                    type: 'textarea',
                    placeholder: '请输入备注信息（可选）'
                }
            ],
            helpText: isPrecious 
                ? `⚠️ 重要提醒：您正在借用【${selectedCollection.level}】藏品「${selectedCollection.name}」，请确保已获得相应权限审批！` 
                : '',
            onSubmit: function(formData) {
                const selectedId = parseInt(formData.collectionId);
                const targetCollection = availableCollections.find(c => c.id === selectedId);
                const borrowQuantity = parseInt(formData.quantity);

                const validation = StatusManager.validateBorrowOperation(targetCollection, borrowQuantity);
                const errors = [];

                if (!formData.collectionId) {
                    errors.push({ field: 'collectionId', message: '请选择藏品' });
                }
                if (!borrowQuantity || borrowQuantity < 1) {
                    errors.push({ field: 'quantity', message: '请输入有效的借用数量' });
                } else if (targetCollection && borrowQuantity > targetCollection.availableQuantity) {
                    errors.push({ field: 'quantity', message: `借用数量不能超过可用数量（${targetCollection.availableQuantity}件）` });
                }
                if (!formData.borrowGallery || formData.borrowGallery.trim() === '') {
                    errors.push({ field: 'borrowGallery', message: '请输入借用展馆' });
                }
                if (!formData.borrowPerson || formData.borrowPerson.trim() === '') {
                    errors.push({ field: 'borrowPerson', message: '请输入借用人' });
                }
                if (!formData.operator || formData.operator.trim() === '') {
                    errors.push({ field: 'operator', message: '请输入经办人' });
                }
                if (!formData.expectedReturn) {
                    errors.push({ field: 'expectedReturn', message: '请选择预计归还日期' });
                } else {
                    const expectedDate = new Date(formData.expectedReturn);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (expectedDate < today) {
                        errors.push({ field: 'expectedReturn', message: '预计归还日期不能早于今天' });
                    }
                }

                if (!validation.valid) {
                    validation.errors.forEach(err => {
                        errors.push({ field: 'quantity', message: err });
                    });
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (validation.requiresPermission) {
                    return Modal.confirm({
                        title: '权限确认',
                        message: `您正在借用【${targetCollection.level}】藏品「${targetCollection.name}」，数量${borrowQuantity}件。\n\n请确认已获得相应的审批权限，是否继续？`,
                        type: 'warning',
                        confirmText: '确认借用',
                        cancelText: '取消',
                        onConfirm: function() {
                            createBorrow(formData, targetCollection, borrowQuantity);
                        }
                    });
                }

                createBorrow(formData, targetCollection, borrowQuantity);
                return true;
            }
        });
    }

    function createBorrow(formData, collection, quantity) {
        const borrows = StorageManager.getBorrows();
        const collections = StorageManager.getCollections();
        const newId = StorageManager.incrementCounter('borrow');

        const newBorrow = {
            id: newId,
            collectionId: collection.id,
            collectionName: collection.name,
            quantity: quantity,
            borrowGallery: formData.borrowGallery.trim(),
            borrowPerson: formData.borrowPerson.trim(),
            operator: formData.operator.trim(),
            borrowDate: new Date().toISOString(),
            expectedReturn: formData.expectedReturn,
            actualReturn: null,
            remark: formData.remark || '',
            status: StatusManager.STATUS.BORROWED,
            createdAt: new Date().toISOString()
        };

        borrows.push(newBorrow);
        StorageManager.setBorrows(borrows);

        const collIndex = collections.findIndex(c => c.id === collection.id);
        collections[collIndex].availableQuantity -= quantity;

        StatusManager.recalculateStatusForCollection(
            collections[collIndex],
            (collections[collIndex].totalQuantity - collections[collIndex].availableQuantity)
        );

        StorageManager.setCollections(collections);

        LogsModule.addLog({
            type: '借用',
            content: `借用藏品：${collection.name}，数量：${quantity}件，借用人：${formData.borrowPerson.trim()}，展馆：${formData.borrowGallery.trim()}，预计归还：${formData.expectedReturn}`,
            operator: formData.operator.trim(),
            collectionName: collection.name,
            quantityChange: -quantity,
            remainingStock: collections[collIndex].availableQuantity,
            statusChange: collections[collIndex].status
        });

        Toast.success('借用登记成功');
        render();
        CollectionsModule.render();
    }

    function showReturnForm() {
        const borrowedBorrows = StorageManager.getBorrows().filter(b => b.status === StatusManager.STATUS.BORROWED);

        if (borrowedBorrows.length === 0) {
            Modal.alert({
                title: '提示',
                message: '暂无需要归还的藏品'
            });
            return;
        }

        const borrowOptions = borrowedBorrows.map(b => {
            const collection = CollectionsModule.getCollectionById(b.collectionId);
            const name = collection ? collection.name : '未知';
            const isOverdue = b.expectedReturn && new Date(b.expectedReturn) < new Date();
            const overdueText = isOverdue ? ' (已逾期)' : '';
            return {
                value: b.id,
                label: `${name}（${b.quantity}件）- ${b.borrowGallery}${overdueText}`
            };
        });

        Modal.form({
            title: '归还入库',
            fields: [
                {
                    name: 'borrowId',
                    label: '选择借用记录',
                    type: 'select',
                    required: true,
                    options: borrowOptions
                },
                {
                    name: 'returnQuantity',
                    label: '归还数量',
                    type: 'number',
                    required: true,
                    min: 1,
                    placeholder: '请输入归还数量'
                },
                {
                    name: 'returnStatus',
                    label: '归还状态',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '完好', label: '完好无损' },
                        { value: '轻微破损', label: '轻微破损' },
                        { value: '严重破损', label: '严重破损' }
                    ]
                },
                {
                    name: 'operator',
                    label: '经办人',
                    required: true,
                    placeholder: '请输入经办人姓名',
                    value: Helpers.getCurrentUser()
                },
                {
                    name: 'remark',
                    label: '归还备注',
                    type: 'textarea',
                    placeholder: '请输入归还备注（如发现破损情况等）'
                }
            ],
            onSubmit: function(formData) {
                const borrowId = parseInt(formData.borrowId);
                const returnQuantity = parseInt(formData.returnQuantity);
                const borrow = borrowedBorrows.find(b => b.id === borrowId);

                const errors = [];

                if (!formData.borrowId) {
                    errors.push({ field: 'borrowId', message: '请选择借用记录' });
                }
                if (!returnQuantity || returnQuantity < 1) {
                    errors.push({ field: 'returnQuantity', message: '请输入有效的归还数量' });
                } else if (borrow && returnQuantity > borrow.quantity) {
                    errors.push({ field: 'returnQuantity', message: `归还数量不能超过借用数量（${borrow.quantity}件）` });
                }
                if (!formData.returnStatus) {
                    errors.push({ field: 'returnStatus', message: '请选择归还状态' });
                }
                if (!formData.operator || formData.operator.trim() === '') {
                    errors.push({ field: 'operator', message: '请输入经办人' });
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (formData.returnStatus === '严重破损') {
                    return Modal.confirm({
                        title: '破损提醒',
                        message: `归还状态为「严重破损」，系统将自动封存${returnQuantity}件藏品。是否确认？`,
                        type: 'danger',
                        confirmText: '确认处理',
                        cancelText: '取消',
                        onConfirm: function() {
                            processReturn(borrowId, returnQuantity, formData);
                        }
                    });
                }

                processReturn(borrowId, returnQuantity, formData);
                return true;
            }
        });
    }

    function returnBorrowById(id) {
        const borrows = StorageManager.getBorrows();
        const borrow = borrows.find(b => b.id === id && b.status === StatusManager.STATUS.BORROWED);

        if (!borrow) {
            Toast.error('借用记录不存在或已归还');
            return;
        }

        const collection = CollectionsModule.getCollectionById(borrow.collectionId);
        const name = collection ? collection.name : '未知';
        const isOverdue = borrow.expectedReturn && new Date(borrow.expectedReturn) < new Date();

        Modal.form({
            title: '归还入库',
            fields: [
                {
                    name: 'returnQuantity',
                    label: '归还数量',
                    type: 'number',
                    required: true,
                    min: 1,
                    max: borrow.quantity,
                    placeholder: `最多归还${borrow.quantity}件`,
                    value: borrow.quantity
                },
                {
                    name: 'returnStatus',
                    label: '归还状态',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '完好', label: '完好无损' },
                        { value: '轻微破损', label: '轻微破损' },
                        { value: '严重破损', label: '严重破损' }
                    ]
                },
                {
                    name: 'operator',
                    label: '经办人',
                    required: true,
                    placeholder: '请输入经办人姓名',
                    value: Helpers.getCurrentUser()
                },
                {
                    name: 'remark',
                    label: '归还备注',
                    type: 'textarea',
                    placeholder: '请输入归还备注（如发现破损情况等）'
                }
            ],
            helpText: `藏品：${name}，借用数量：${borrow.quantity}件${isOverdue ? ' ⚠️ 已逾期' : ''}`,
            onSubmit: function(formData) {
                const returnQuantity = parseInt(formData.returnQuantity);
                const errors = [];

                if (!returnQuantity || returnQuantity < 1) {
                    errors.push({ field: 'returnQuantity', message: '请输入有效的归还数量' });
                } else if (returnQuantity > borrow.quantity) {
                    errors.push({ field: 'returnQuantity', message: `归还数量不能超过借用数量（${borrow.quantity}件）` });
                }
                if (!formData.returnStatus) {
                    errors.push({ field: 'returnStatus', message: '请选择归还状态' });
                }
                if (!formData.operator || formData.operator.trim() === '') {
                    errors.push({ field: 'operator', message: '请输入经办人' });
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (formData.returnStatus === '严重破损') {
                    return Modal.confirm({
                        title: '破损提醒',
                        message: `归还状态为「严重破损」，系统将自动封存${returnQuantity}件藏品。是否确认？`,
                        type: 'danger',
                        confirmText: '确认处理',
                        cancelText: '取消',
                        onConfirm: function() {
                            processReturn(id, returnQuantity, formData);
                        }
                    });
                }

                processReturn(id, returnQuantity, formData);
                return true;
            }
        });
    }

    function processReturn(borrowId, returnQuantity, formData) {
        const borrows = StorageManager.getBorrows();
        const collections = StorageManager.getCollections();
        const borrowIndex = borrows.findIndex(b => b.id === borrowId);

        if (borrowIndex === -1) {
            Toast.error('借用记录不存在');
            return;
        }

        const borrow = borrows[borrowIndex];
        const collection = CollectionsModule.getCollectionById(borrow.collectionId);

        if (!collection) {
            Toast.error('藏品不存在');
            return;
        }

        if (returnQuantity === borrow.quantity) {
            borrows[borrowIndex].status = '已归还';
            borrows[borrowIndex].actualReturn = new Date().toISOString();
            borrows[borrowIndex].returnStatus = formData.returnStatus;
            borrows[borrowIndex].returnRemark = formData.remark || '';
        } else {
            borrows[borrowIndex].quantity -= returnQuantity;
            const newBorrow = {
                ...borrow,
                id: StorageManager.incrementCounter('borrow'),
                quantity: returnQuantity,
                status: '已归还',
                actualReturn: new Date().toISOString(),
                returnStatus: formData.returnStatus,
                returnRemark: formData.remark || ''
            };
            borrows.push(newBorrow);
        }

        StorageManager.setBorrows(borrows);

        const collIndex = collections.findIndex(c => c.id === borrow.collectionId);
        
        if (formData.returnStatus === '严重破损') {
            collections[collIndex].totalQuantity -= returnQuantity;
            
            StatusManager.recalculateStatusForCollection(
                collections[collIndex],
                (collections[collIndex].totalQuantity - collections[collIndex].availableQuantity)
            );
        } else {
            collections[collIndex].availableQuantity += returnQuantity;
            
            StatusManager.recalculateStatusForCollection(
                collections[collIndex],
                (collections[collIndex].totalQuantity - collections[collIndex].availableQuantity)
            );
        }

        StorageManager.setCollections(collections);

        const statusText = formData.returnStatus === '严重破损' 
            ? `已封存（${formData.returnStatus}）` 
            : `已归还（${formData.returnStatus}）`;

        LogsModule.addLog({
            type: '归还',
            content: `归还藏品：${collection.name}，数量：${returnQuantity}件，状态：${formData.returnStatus}${formData.remark ? '，备注：' + formData.remark : ''}`,
            operator: formData.operator.trim(),
            collectionName: collection.name,
            quantityChange: formData.returnStatus === '严重破损' ? 0 : returnQuantity,
            remainingStock: collections[collIndex].availableQuantity,
            statusChange: statusText
        });

        if (formData.returnStatus === '严重破损') {
            LogsModule.addLog({
                type: '封存',
                content: `封存藏品：${collection.name}，数量：${returnQuantity}件，原因：归还时严重破损`,
                operator: formData.operator.trim(),
                collectionName: collection.name,
                quantityChange: -returnQuantity,
                remainingStock: collections[collIndex].availableQuantity,
                statusChange: StatusManager.STATUS.SEALED
            });
        }

        Toast.success(formData.returnStatus === '严重破损' ? '归还登记成功，破损藏品已封存' : '归还登记成功');
        render();
        CollectionsModule.render();
    }

    function showBorrowDetail(id) {
        const borrows = StorageManager.getBorrows();
        const borrow = borrows.find(b => b.id === id);

        if (!borrow) {
            Toast.error('借用记录不存在');
            return;
        }

        const collection = CollectionsModule.getCollectionById(borrow.collectionId);
        const collectionName = collection ? collection.name : '未知藏品';
        const isOverdue = borrow.expectedReturn && new Date(borrow.expectedReturn) < new Date() && borrow.status === StatusManager.STATUS.BORROWED;

        Modal.open({
            title: '借用记录详情',
            size: 'lg',
            html: `
                <div style="line-height: 2;">
                    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                        <div style="flex: 1; min-width: 200px;">
                            <p><strong>借用编号：</strong>${borrow.id}</p>
                            <p><strong>藏品名称：</strong>${Helpers.escapeHtml(collectionName)}</p>
                            <p><strong>借用数量：</strong>${borrow.quantity} 件</p>
                            <p><strong>借用展馆：</strong>${Helpers.escapeHtml(borrow.borrowGallery)}</p>
                            <p><strong>借用人：</strong>${Helpers.escapeHtml(borrow.borrowPerson || '-')}</p>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p><strong>经办人：</strong>${Helpers.escapeHtml(borrow.operator)}</p>
                            <p><strong>借用时间：</strong>${Helpers.formatDateTime(borrow.borrowDate)}</p>
                            <p><strong>预计归还：</strong>${borrow.expectedReturn ? Helpers.formatDate(borrow.expectedReturn) : '-'}${isOverdue ? ' <span style="color: #e74c3c;">(已逾期)</span>' : ''}</p>
                            <p><strong>当前状态：</strong>${Helpers.getStatusBadge(borrow.status)}</p>
                        </div>
                    </div>
                    ${borrow.actualReturn ? `
                        <div style="border-top: 1px solid #e0e0e0; margin-top: 15px; padding-top: 15px;">
                            <p><strong>实际归还：</strong>${Helpers.formatDateTime(borrow.actualReturn)}</p>
                            <p><strong>归还状态：</strong>${borrow.returnStatus || '-'}</p>
                            <p><strong>归还备注：</strong>${Helpers.escapeHtml(borrow.returnRemark || '无')}</p>
                        </div>
                    ` : ''}
                    <div style="border-top: 1px solid #e0e0e0; margin-top: 15px; padding-top: 15px;">
                        <p><strong>备注：</strong>${Helpers.escapeHtml(borrow.remark || '无')}</p>
                    </div>
                </div>
            `,
            footerHtml: borrow.status === StatusManager.STATUS.BORROWED 
                ? `
                    <button class="btn btn-secondary modal-close">关闭</button>
                    <button class="btn btn-primary modal-return-now">立即归还</button>
                `
                : `<button class="btn btn-primary modal-close">关闭</button>`
        });

        const closeBtn = document.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', Modal.close);
        }

        const returnBtn = document.querySelector('.modal-return-now');
        if (returnBtn) {
            returnBtn.addEventListener('click', function() {
                Modal.close();
                setTimeout(function() {
                    returnBorrowById(id);
                }, 300);
            });
        }
    }

    function showSealForm() {
        const collections = StorageManager.getCollections().filter(c => c.status !== StatusManager.STATUS.SEALED);

        if (collections.length === 0) {
            Modal.alert({
                title: '提示',
                message: '暂无可封存的藏品'
            });
            return;
        }

        const collectionOptions = collections.map(c => ({
            value: c.id,
            label: `${c.name}（可用${c.availableQuantity}件，总计${c.totalQuantity}件）- ${c.level}`
        }));

        Modal.form({
            title: '破损封存',
            fields: [
                {
                    name: 'collectionId',
                    label: '选择藏品',
                    type: 'select',
                    required: true,
                    options: collectionOptions
                },
                {
                    name: 'sealQuantity',
                    label: '封存数量',
                    type: 'number',
                    required: true,
                    min: 1,
                    placeholder: '请输入封存数量'
                },
                {
                    name: 'sealReason',
                    label: '封存原因',
                    type: 'select',
                    required: true,
                    options: [
                        { value: '破损', label: '破损' },
                        { value: '修复', label: '修复中' },
                        { value: '保养', label: '保养中' },
                        { value: '其他', label: '其他' }
                    ]
                },
                {
                    name: 'operator',
                    label: '经办人',
                    required: true,
                    placeholder: '请输入经办人姓名',
                    value: Helpers.getCurrentUser()
                },
                {
                    name: 'reason',
                    label: '详细说明',
                    type: 'textarea',
                    required: true,
                    placeholder: '请输入详细的封存原因说明'
                }
            ],
            onSubmit: function(formData) {
                const collectionId = parseInt(formData.collectionId);
                const sealQuantity = parseInt(formData.sealQuantity);
                const collection = collections.find(c => c.id === collectionId);

                const validation = StatusManager.validateSealOperation(collection, sealQuantity);
                const errors = [];

                if (!formData.collectionId) {
                    errors.push({ field: 'collectionId', message: '请选择藏品' });
                }
                if (!sealQuantity || sealQuantity < 1) {
                    errors.push({ field: 'sealQuantity', message: '请输入有效的封存数量' });
                } else if (collection && sealQuantity > collection.totalQuantity) {
                    errors.push({ field: 'sealQuantity', message: `封存数量不能超过总数量（${collection.totalQuantity}件）` });
                }
                if (!formData.sealReason) {
                    errors.push({ field: 'sealReason', message: '请选择封存原因' });
                }
                if (!formData.operator || formData.operator.trim() === '') {
                    errors.push({ field: 'operator', message: '请输入经办人' });
                }
                if (!formData.reason || formData.reason.trim() === '') {
                    errors.push({ field: 'reason', message: '请输入详细说明' });
                }

                if (!validation.valid) {
                    validation.errors.forEach(err => {
                        errors.push({ field: 'sealQuantity', message: err });
                    });
                }

                if (errors.length > 0) {
                    return errors;
                }

                if (validation.hasBorrowedItems) {
                    const borrowedQty = collection.totalQuantity - collection.availableQuantity;
                    return Modal.confirm({
                        title: '注意',
                        message: `该藏品有${borrowedQty}件正在借用中，封存数量${sealQuantity}件将从总数量中扣除。\n\n是否继续？`,
                        type: 'warning',
                        confirmText: '确认封存',
                        cancelText: '取消',
                        onConfirm: function() {
                            processSeal(collectionId, sealQuantity, formData);
                        }
                    });
                }

                processSeal(collectionId, sealQuantity, formData);
                return true;
            }
        });
    }

    function processSeal(collectionId, sealQuantity, formData) {
        const collections = StorageManager.getCollections();
        const collIndex = collections.findIndex(c => c.id === collectionId);

        if (collIndex === -1) {
            Toast.error('藏品不存在');
            return;
        }

        const collection = collections[collIndex];

        if (sealQuantity > collection.totalQuantity) {
            Toast.error('封存数量不能超过总数量');
            return;
        }

        const availableToSeal = Math.min(sealQuantity, collection.availableQuantity);
        
        collections[collIndex].totalQuantity -= sealQuantity;
        collections[collIndex].availableQuantity -= availableToSeal;

        StatusManager.recalculateStatusForCollection(
            collections[collIndex],
            (collections[collIndex].totalQuantity - collections[collIndex].availableQuantity)
        );

        StorageManager.setCollections(collections);

        LogsModule.addLog({
            type: '封存',
            content: `封存藏品：${collection.name}，数量：${sealQuantity}件，原因：${formData.sealReason}，说明：${formData.reason}`,
            operator: formData.operator.trim(),
            collectionName: collection.name,
            quantityChange: -sealQuantity,
            remainingStock: collections[collIndex].availableQuantity,
            statusChange: collections[collIndex].status
        });

        Toast.success('封存登记成功');
        render();
        CollectionsModule.render();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        render,
        showBorrowForm,
        showReturnForm,
        showSealForm
    };
})();
