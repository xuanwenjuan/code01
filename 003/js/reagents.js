const ReagentManager = {
    currentEditId: null,
    currentOpType: null,
    currentOpReagent: null,

    getAll() {
        return Storage.get(Storage.KEYS.REAGENTS);
    },

    getById(id) {
        const reagents = this.getAll();
        return reagents.find(r => r.id === id);
    },

    getFiltered(filters) {
        let reagents = this.getAll();

        if (filters.category) {
            reagents = reagents.filter(r => r.category === filters.category);
        }
        if (filters.status) {
            if (filters.status === '不足') {
                reagents = reagents.filter(r => r.availableQty <= r.totalQty * 0.2);
            } else if (filters.status === '过期') {
                reagents = reagents.filter(r => this.isExpired(r));
            } else if (filters.status === '临近过期') {
                reagents = reagents.filter(r => this.isNearExpired(r));
            } else {
                reagents = reagents.filter(r => r.status === filters.status);
            }
        }
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            reagents = reagents.filter(r => 
                r.name.toLowerCase().includes(keyword) || 
                r.code.toLowerCase().includes(keyword)
            );
        }

        return reagents;
    },

    isExpired(reagent) {
        if (!reagent.expireDate) return false;
        return new Date(reagent.expireDate) < new Date();
    },

    isNearExpired(reagent, days = 30) {
        if (!reagent.expireDate) return false;
        const expireDate = new Date(reagent.expireDate);
        const now = new Date();
        const diffTime = expireDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= days;
    },

    checkExpireAlerts() {
        const reagents = this.getAll();
        const expired = reagents.filter(r => this.isExpired(r));
        const nearExpired = reagents.filter(r => this.isNearExpired(r));

        let message = '';
        if (expired.length > 0) {
            message += `⚠️ 有 ${expired.length} 个试剂已过期！\n`;
            message += expired.map(r => `  - ${r.name} (${r.code})`).join('\n') + '\n\n';
        }
        if (nearExpired.length > 0) {
            message += `📅 有 ${nearExpired.length} 个试剂即将过期（30天内）！\n`;
            message += nearExpired.map(r => `  - ${r.name} (${r.code}) - ${r.expireDate}`).join('\n');
        }

        if (message) {
            setTimeout(() => {
                Utils.showWarning(message.replace(/\n/g, '<br>'));
            }, 500);
        }
    },

    canOperate(reagent) {
        if (this.isExpired(reagent)) {
            Utils.showError('该试剂已过期，无法进行此操作');
            return false;
        }
        return true;
    },

    add(reagent) {
        const reagents = this.getAll();
        const totalQty = parseFloat(reagent.totalQty) || 0;
        const newReagent = {
            id: Storage.generateId(),
            name: reagent.name,
            code: reagent.code,
            category: reagent.category,
            unit: reagent.unit,
            totalQty: totalQty,
            availableQty: totalQty,
            usedQty: 0,
            location: reagent.location || '',
            supplier: reagent.supplier || '',
            expireDate: reagent.expireDate || '',
            status: '正常',
            remark: reagent.remark || '',
            createTime: Utils.getCurrentDateTime()
        };
        reagents.push(newReagent);
        Storage.set(Storage.KEYS.REAGENTS, reagents);

        OperationLogManager.add('试剂管理', '新增', reagent.name, `编号：${reagent.code}`);
        return newReagent;
    },

    update(id, reagent) {
        const reagents = this.getAll();
        const index = reagents.findIndex(r => r.id === id);
        if (index !== -1) {
            const oldReagent = reagents[index];
            const totalQty = parseFloat(reagent.totalQty) || 0;
            
            if (totalQty < oldReagent.usedQty) {
                Utils.showError(`总数量不能小于已使用数量（${oldReagent.usedQty} ${oldReagent.unit}）`);
                return null;
            }

            const availableDiff = totalQty - oldReagent.totalQty;
            const newAvailable = Math.max(0, oldReagent.availableQty + availableDiff);

            reagents[index] = {
                ...oldReagent,
                name: reagent.name,
                code: reagent.code,
                category: reagent.category,
                unit: reagent.unit,
                totalQty: totalQty,
                availableQty: newAvailable,
                location: reagent.location || '',
                supplier: reagent.supplier || '',
                expireDate: reagent.expireDate || '',
                remark: reagent.remark || '',
                status: this.getReagentStatus({
                    ...oldReagent,
                    totalQty: totalQty,
                    availableQty: newAvailable,
                    expireDate: reagent.expireDate || ''
                })
            };
            Storage.set(Storage.KEYS.REAGENTS, reagents);

            OperationLogManager.add('试剂管理', '修改', reagent.name, `编号：${reagent.code}`);
            return reagents[index];
        }
        return null;
    },

    delete(id) {
        const reagent = this.getById(id);
        if (!reagent) return false;

        const reagents = this.getAll();
        const filtered = reagents.filter(r => r.id !== id);
        Storage.set(Storage.KEYS.REAGENTS, filtered);

        OperationLogManager.add('试剂管理', '删除', reagent.name, `编号：${reagent.code}`);
        return true;
    },

    receive(reagentId, data) {
        const reagent = this.getById(reagentId);
        if (!reagent) {
            Utils.showError('试剂不存在');
            return false;
        }

        if (!this.canOperate(reagent)) {
            return false;
        }

        const qty = parseFloat(data.qty) || 0;
        if (qty <= 0) {
            Utils.showError('领用数量必须大于0');
            return false;
        }
        if (qty > reagent.availableQty) {
            Utils.showError(`领用数量不能大于可用数量（${reagent.availableQty} ${reagent.unit}）`);
            return false;
        }

        const beforeQty = reagent.availableQty;
        const afterQty = reagent.availableQty - qty;
        const newUsedQty = reagent.usedQty + qty;

        this.updateQty(reagentId, afterQty, newUsedQty);

        ReagentLogManager.add({
            reagentId: reagent.id,
            reagentName: reagent.name,
            type: '领用',
            qty: qty,
            operator: data.operator,
            purpose: data.purpose || '',
            beforeQty: beforeQty,
            afterQty: afterQty,
            remark: data.remark || ''
        });

        OperationLogManager.add('试剂管理', '领用', reagent.name, 
            `数量：${qty} ${reagent.unit}，领用人：${data.operator}`);

        return true;
    },

    return(reagentId, data) {
        const reagent = this.getById(reagentId);
        if (!reagent) {
            Utils.showError('试剂不存在');
            return false;
        }

        if (!this.canOperate(reagent)) {
            return false;
        }

        const qty = parseFloat(data.qty) || 0;
        if (qty <= 0) {
            Utils.showError('归还数量必须大于0');
            return false;
        }
        if (qty > reagent.usedQty) {
            Utils.showError(`归还数量不能大于已使用数量（${reagent.usedQty} ${reagent.unit}）`);
            return false;
        }

        const beforeQty = reagent.availableQty;
        const afterQty = reagent.availableQty + qty;
        const newUsedQty = reagent.usedQty - qty;

        if (afterQty > reagent.totalQty) {
            Utils.showError(`归还后可用数量不能超过总数量（${reagent.totalQty} ${reagent.unit}）`);
            return false;
        }

        this.updateQty(reagentId, afterQty, newUsedQty);

        ReagentLogManager.add({
            reagentId: reagent.id,
            reagentName: reagent.name,
            type: '归还',
            qty: qty,
            operator: data.operator,
            purpose: '',
            beforeQty: beforeQty,
            afterQty: afterQty,
            remark: data.remark || ''
        });

        OperationLogManager.add('试剂管理', '归还', reagent.name,
            `数量：${qty} ${reagent.unit}，归还人：${data.operator}`);

        return true;
    },

    scrap(reagentId, data) {
        const reagent = this.getById(reagentId);
        if (!reagent) {
            Utils.showError('试剂不存在');
            return false;
        }

        if (!this.canOperate(reagent)) {
            return false;
        }

        if (!data.reason || data.reason.trim() === '') {
            Utils.showError('请填写报废原因');
            return false;
        }

        const qty = parseFloat(data.qty) || 0;
        if (qty <= 0) {
            Utils.showError('报废数量必须大于0');
            return false;
        }
        if (qty > reagent.availableQty) {
            Utils.showError(`报废数量不能大于可用数量（${reagent.availableQty} ${reagent.unit}）`);
            return false;
        }

        const beforeQty = reagent.availableQty;
        const afterQty = reagent.availableQty - qty;

        this.updateQty(reagentId, afterQty, reagent.usedQty);

        ReagentLogManager.add({
            reagentId: reagent.id,
            reagentName: reagent.name,
            type: '报废',
            qty: qty,
            operator: data.operator,
            purpose: '',
            beforeQty: beforeQty,
            afterQty: afterQty,
            remark: `报废原因：${data.reason}${data.remark ? '，' + data.remark : ''}`
        });

        OperationLogManager.add('试剂管理', '报废', reagent.name,
            `数量：${qty} ${reagent.unit}，原因：${data.reason}`);

        return true;
    },

    updateQty(id, availableQty, usedQty) {
        const reagents = this.getAll();
        const index = reagents.findIndex(r => r.id === id);
        if (index !== -1) {
            reagents[index].availableQty = availableQty;
            reagents[index].usedQty = usedQty;
            reagents[index].status = this.getReagentStatus(reagents[index]);

            Storage.set(Storage.KEYS.REAGENTS, reagents);
            return reagents[index];
        }
        return null;
    },

    getReagentStatus(reagent) {
        if (this.isExpired(reagent)) {
            return '过期';
        }
        if (this.isNearExpired(reagent)) {
            return '临近过期';
        }
        if (reagent.availableQty <= 0) {
            return '不足';
        }
        if (reagent.availableQty <= reagent.totalQty * 0.2) {
            return '不足';
        }
        return '正常';
    },

    getStatusClass(status) {
        const classes = {
            '正常': 'status-健康',
            '不足': 'status-需养护',
            '临近过期': 'status-良好',
            '过期': 'status-枯萎',
            '报废': 'status-枯萎'
        };
        return classes[status] || 'status-良好';
    },

    getCurrentFilters() {
        return {
            category: document.getElementById('reagentFilterCategory').value,
            status: document.getElementById('reagentFilterStatus').value,
            keyword: document.getElementById('reagentFilterKeyword').value.trim()
        };
    },

    getOperationButtons(reagent) {
        const isExpired = this.isExpired(reagent);
        const isNearExpired = this.isNearExpired(reagent);
        const buttons = [];

        buttons.push(`<button class="btn-edit" onclick="ReagentManager.edit('${reagent.id}')">编辑</button>`);

        if (isExpired) {
            buttons.push(`<button class="btn-primary" style="background:#999;cursor:not-allowed;" disabled title="已过期">领用</button>`);
            buttons.push(`<button class="btn-primary" style="background:#999;cursor:not-allowed;" disabled title="已过期">归还</button>`);
            buttons.push(`<button class="btn-danger" onclick="ReagentManager.openOpModal('scrap', '${reagent.id}')" title="报废处理">报废</button>`);
        } else {
            const receiveDisabled = reagent.availableQty <= 0 ? 'disabled style="background:#999;cursor:not-allowed;"' : 'style="background:#43a047;"';
            const returnDisabled = reagent.usedQty <= 0 ? 'disabled style="background:#999;cursor:not-allowed;"' : 'style="background:#1e88e5;"';
            
            const receiveTitle = reagent.availableQty <= 0 ? 'title="无可用库存"' : '';
            const returnTitle = reagent.usedQty <= 0 ? 'title="无可归还数量"' : '';

            buttons.push(`<button class="btn-primary" ${receiveDisabled} ${receiveTitle} onclick="ReagentManager.openOpModal('receive', '${reagent.id}')">领用</button>`);
            buttons.push(`<button class="btn-primary" ${returnDisabled} ${returnTitle} onclick="ReagentManager.openOpModal('return', '${reagent.id}')">归还</button>`);
            buttons.push(`<button class="btn-danger" onclick="ReagentManager.openOpModal('scrap', '${reagent.id}')">报废</button>`);
        }

        return buttons.join('');
    },

    renderList() {
        const filters = this.getCurrentFilters();
        const reagents = this.getFiltered(filters);
        const container = document.getElementById('reagentList');

        if (!reagents.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🧪</div>
                    <p>暂无试剂记录，请点击上方按钮添加</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reagents.map(reagent => {
            const status = this.getReagentStatus(reagent);
            const statusClass = this.getStatusClass(status);
            const isExpired = this.isExpired(reagent);
            const isNearExpired = this.isNearExpired(reagent);
            
            let expireBadge = '';
            if (isExpired) {
                expireBadge = '<span class="status-tag status-枯萎" style="margin-left:8px;">已过期</span>';
            } else if (isNearExpired) {
                expireBadge = '<span class="status-tag status-良好" style="margin-left:8px;">即将过期</span>';
            }

            return `
                <div class="plant-card" ${isExpired ? 'style="opacity:0.7;border-color:#ffcdd2;"' : ''}>
                    <h3>${reagent.name}${expireBadge}</h3>
                    <div class="info-row">
                        <span class="label">试剂编号：</span>
                        <span class="value">${reagent.code}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">试剂类别：</span>
                        <span class="value">${reagent.category}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">存放位置：</span>
                        <span class="value">${reagent.location || '-'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">总数量：</span>
                        <span class="value">${reagent.totalQty} ${reagent.unit}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">可用数量：</span>
                        <span class="value" style="${reagent.availableQty <= reagent.totalQty * 0.2 ? 'color:#e65100;font-weight:bold;' : ''}">${reagent.availableQty} ${reagent.unit}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">已使用：</span>
                        <span class="value">${reagent.usedQty} ${reagent.unit}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">有效期：</span>
                        <span class="value" style="${isExpired ? 'color:#c62828;font-weight:bold;' : (isNearExpired ? 'color:#e65100;font-weight:bold;' : '')}">${reagent.expireDate || '长期有效'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">状态：</span>
                        <span class="value status-tag ${statusClass}">${status}</span>
                    </div>
                    <div class="actions">
                        ${this.getOperationButtons(reagent)}
                    </div>
                </div>
            `;
        }).join('');
    },

    openModal() {
        this.currentEditId = null;
        document.getElementById('reagentModalTitle').textContent = '添加试剂';
        document.getElementById('reagentForm').reset();
        document.getElementById('reagentModal').classList.add('active');
    },

    edit(id) {
        const reagent = this.getById(id);
        if (!reagent) return;

        this.currentEditId = id;
        document.getElementById('reagentModalTitle').textContent = '编辑试剂';
        document.getElementById('reagentName').value = reagent.name;
        document.getElementById('reagentCode').value = reagent.code;
        document.getElementById('reagentCategory').value = reagent.category;
        document.getElementById('reagentUnit').value = reagent.unit;
        document.getElementById('reagentTotalQty').value = reagent.totalQty;
        document.getElementById('reagentLocation').value = reagent.location || '';
        document.getElementById('reagentSupplier').value = reagent.supplier || '';
        document.getElementById('reagentExpireDate').value = reagent.expireDate || '';
        document.getElementById('reagentRemark').value = reagent.remark || '';
        document.getElementById('reagentModal').classList.add('active');
    },

    closeModal() {
        this.currentEditId = null;
        document.getElementById('reagentModal').classList.remove('active');
    },

    openOpModal(type, reagentId) {
        const reagent = this.getById(reagentId);
        if (!reagent) return;

        if (type !== 'scrap' && !this.canOperate(reagent)) {
            return;
        }

        if (type === 'receive' && reagent.availableQty <= 0) {
            Utils.showError('该试剂无可用库存，无法领用');
            return;
        }
        if (type === 'return' && reagent.usedQty <= 0) {
            Utils.showError('该试剂无可归还数量，无法归还');
            return;
        }

        this.currentOpType = type;
        this.currentOpReagent = reagent;
        document.getElementById('reagentOpType').value = type;
        document.getElementById('reagentOpId').value = reagentId;
        document.getElementById('reagentOpName').value = reagent.name;
        document.getElementById('reagentOpCurrentQty').value = `${reagent.availableQty} ${reagent.unit}`;

        const typeNames = {
            receive: '领用',
            return: '归还',
            scrap: '报废'
        };
        document.getElementById('reagentOpModalTitle').textContent = `试剂${typeNames[type]}`;

        document.getElementById('reagentOpQtyLabel').innerHTML = `${typeNames[type]}数量 <span class="required">*</span>`;
        document.getElementById('reagentOpOperatorLabel').innerHTML = `${typeNames[type]}人 <span class="required">*</span>`;

        document.getElementById('reagentOpPurposeGroup').style.display = type === 'receive' ? 'block' : 'none';
        document.getElementById('reagentOpReasonGroup').style.display = type === 'scrap' ? 'block' : 'none';

        const qtyInput = document.getElementById('reagentOpQty');
        if (type === 'receive') {
            qtyInput.max = reagent.availableQty;
            qtyInput.placeholder = `最多可领用 ${reagent.availableQty} ${reagent.unit}`;
        } else if (type === 'return') {
            qtyInput.max = reagent.usedQty;
            qtyInput.placeholder = `最多可归还 ${reagent.usedQty} ${reagent.unit}`;
        } else {
            qtyInput.max = reagent.availableQty;
            qtyInput.placeholder = `最多可报废 ${reagent.availableQty} ${reagent.unit}`;
        }

        document.getElementById('reagentOpForm').reset();
        document.getElementById('reagentOpName').value = reagent.name;
        document.getElementById('reagentOpCurrentQty').value = `${reagent.availableQty} ${reagent.unit}`;
        document.getElementById('reagentOpId').value = reagentId;
        document.getElementById('reagentOpType').value = type;

        document.getElementById('reagentOpModal').classList.add('active');
    },

    closeOpModal() {
        this.currentOpType = null;
        this.currentOpReagent = null;
        document.getElementById('reagentOpModal').classList.remove('active');
    },

    confirmDelete(id) {
        if (confirm('确定要删除这个试剂记录吗？')) {
            this.delete(id);
            Utils.showSuccess('试剂删除成功');
            this.refresh();
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('reagentName').value.trim();
        const code = document.getElementById('reagentCode').value.trim();
        const category = document.getElementById('reagentCategory').value;
        const unit = document.getElementById('reagentUnit').value;
        const totalQty = document.getElementById('reagentTotalQty').value;
        const location = document.getElementById('reagentLocation').value.trim();
        const supplier = document.getElementById('reagentSupplier').value.trim();
        const expireDate = document.getElementById('reagentExpireDate').value;
        const remark = document.getElementById('reagentRemark').value.trim();

        let error = Utils.validateRequired(name, '试剂名称');
        if (error) { Utils.showError(error); return; }

        error = Utils.validateRequired(code, '试剂编号');
        if (error) { Utils.showError(error); return; }

        if (parseFloat(totalQty) < 0) {
            Utils.showError('总数量不能为负数');
            return;
        }

        const reagent = {
            name, code, category, unit, totalQty,
            location, supplier, expireDate, remark
        };

        if (this.currentEditId) {
            const result = this.update(this.currentEditId, reagent);
            if (result) {
                Utils.showSuccess('试剂更新成功');
                this.closeModal();
                this.refresh();
            }
        } else {
            this.add(reagent);
            Utils.showSuccess('试剂添加成功');
            this.closeModal();
            this.refresh();
        }
    },

    handleOpSubmit(e) {
        e.preventDefault();

        const type = document.getElementById('reagentOpType').value;
        const reagentId = document.getElementById('reagentOpId').value;
        const qty = document.getElementById('reagentOpQty').value;
        const operator = document.getElementById('reagentOpOperator').value.trim();
        const purpose = document.getElementById('reagentOpPurpose').value.trim();
        const reason = document.getElementById('reagentOpReason').value.trim();
        const remark = document.getElementById('reagentOpRemark').value.trim();

        let error = Utils.validateRequired(qty, '数量');
        if (error) { Utils.showError(error); return; }

        if (parseFloat(qty) <= 0) {
            Utils.showError('数量必须大于0');
            return;
        }

        error = Utils.validateRequired(operator, '操作人');
        if (error) { Utils.showError(error); return; }

        const data = {
            qty, operator, purpose, reason, remark
        };

        let result = false;
        if (type === 'receive') {
            result = this.receive(reagentId, data);
        } else if (type === 'return') {
            result = this.return(reagentId, data);
        } else if (type === 'scrap') {
            result = this.scrap(reagentId, data);
        }

        if (result) {
            const typeNames = { receive: '领用', return: '归还', scrap: '报废' };
            Utils.showSuccess(`试剂${typeNames[type]}成功`);
            this.closeOpModal();
            this.refresh();
            ReagentLogManager.refresh();
        }
    },

    refresh() {
        this.renderList();
    }
};

function openReagentModal() {
    ReagentManager.openModal();
}

function closeReagentModal() {
    ReagentManager.closeModal();
}

function closeReagentOpModal() {
    ReagentManager.closeOpModal();
}
