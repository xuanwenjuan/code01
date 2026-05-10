const PlantManager = {
    currentEditId: null,

    getAll() {
        return Storage.get(Storage.KEYS.PLANTS);
    },

    getById(id) {
        const plants = this.getAll();
        return plants.find(p => p.id === id);
    },

    getFiltered(filters) {
        let plants = this.getAll();

        if (filters.isOverdue) {
            plants = plants.filter(p => Utils.isOverdue(p));
        }
        if (filters.categoryId) {
            plants = plants.filter(p => p.categoryId === filters.categoryId);
        }
        if (filters.area) {
            plants = plants.filter(p => p.area === filters.area);
        }
        if (filters.cycle) {
            plants = plants.filter(p => p.cycle === filters.cycle);
        }
        if (filters.healthStatus) {
            plants = plants.filter(p => p.healthStatus === filters.healthStatus);
        }

        return plants;
    },

    getOverduePlants() {
        return this.getAll().filter(p => Utils.isOverdue(p) && p.healthStatus !== '枯萎');
    },

    getWarningPlants() {
        return this.getAll().filter(p => {
            if (p.healthStatus === '枯萎') return false;
            const daysSince = Utils.getDaysSinceLastCare(p);
            const cycleDays = Utils.parseCycleDays(p.cycle);
            return daysSince > cycleDays * 0.8;
        });
    },

    checkAndUpdateHealthStatus() {
        const plants = this.getAll();
        let updated = false;
        
        plants.forEach(plant => {
            if (plant.healthStatus === '枯萎') return;
            
            if (Utils.isOverdue(plant)) {
                const overdueDays = Utils.getOverdueDays(plant);
                
                if (overdueDays >= 14 && plant.healthStatus !== '枯萎') {
                    this.autoUpdateHealthStatus(plant.id, '枯萎', '超期养护14天以上');
                    updated = true;
                } else if (overdueDays >= 7 && plant.healthStatus === '健康') {
                    this.autoUpdateHealthStatus(plant.id, '需养护');
                    updated = true;
                }
            }
        });

        return updated;
    },

    autoUpdateHealthStatus(plantId, newStatus, reason = '') {
        const plants = this.getAll();
        const plant = plants.find(p => p.id === plantId);
        if (!plant) return false;
        
        plant.healthStatus = newStatus;
        Storage.set(Storage.KEYS.PLANTS, plants);
        
        if (reason) {
            LogManager.add({
                plantId: plant.id,
                plantName: plant.name,
                type: 'auto',
                typeName: '系统自动更新',
                operator: '系统',
                statusBefore: plant.healthStatus,
                statusAfter: newStatus,
                taskDate: Utils.getCurrentDate(),
                remark: `因${reason}，系统自动更新状态`,
                createTime: Utils.getCurrentDateTime()
            });
            
            OperationLogManager.add('绿植档案', '系统自动更新', plant.name, `状态变更：${plant.healthStatus} → ${newStatus}`);
        }
        
        return true;
    },

    add(plant) {
        const plants = this.getAll();
        const category = CategoryManager.getById(plant.categoryId);
        const newPlant = {
            id: Storage.generateId(),
            name: plant.name,
            code: plant.code,
            categoryId: plant.categoryId,
            categoryName: category ? category.name : '',
            area: plant.area,
            cycle: plant.cycle,
            soilStatus: plant.soilStatus || '适中',
            healthStatus: plant.healthStatus || '健康',
            lastCareDate: plant.lastCareDate || Utils.getCurrentDate(),
            createTime: Utils.getCurrentDateTime()
        };
        plants.push(newPlant);
        Storage.set(Storage.KEYS.PLANTS, plants);

        OperationLogManager.add('绿植档案', '新增', plant.name, `编号：${plant.code}，区域：${plant.area}`);
        return newPlant;
    },

    update(id, plant) {
        const plants = this.getAll();
        const index = plants.findIndex(p => p.id === id);
        if (index !== -1) {
            const category = CategoryManager.getById(plant.categoryId);
            plants[index] = {
                ...plants[index],
                name: plant.name,
                code: plant.code,
                categoryId: plant.categoryId,
                categoryName: category ? category.name : '',
                area: plant.area,
                cycle: plant.cycle,
                soilStatus: plant.soilStatus || '适中',
                healthStatus: plant.healthStatus || '健康',
                lastCareDate: plant.lastCareDate || Utils.getCurrentDate()
            };
            Storage.set(Storage.KEYS.PLANTS, plants);

            OperationLogManager.add('绿植档案', '修改', plant.name, `编号：${plant.code}，区域：${plant.area}`);
            return plants[index];
        }
        return null;
    },

    updateStatus(id, updates) {
        const plants = this.getAll();
        const index = plants.findIndex(p => p.id === id);
        if (index !== -1) {
            plants[index] = {
                ...plants[index],
                ...updates,
                lastCareDate: Utils.getCurrentDate()
            };
            Storage.set(Storage.KEYS.PLANTS, plants);
            return plants[index];
        }
        return null;
    },

    delete(id) {
        const plant = this.getById(id);
        const plants = this.getAll();
        const filtered = plants.filter(p => p.id !== id);
        Storage.set(Storage.KEYS.PLANTS, filtered);

        if (plant) {
            OperationLogManager.add('绿植档案', '删除', plant.name, `编号：${plant.code}，区域：${plant.area}`);
        }
        return true;
    },

    getPlantStatusBadge(plant) {
        const isOverdue = Utils.isOverdue(plant);
        const overdueDays = Utils.getOverdueDays(plant);
        const daysSince = Utils.getDaysSinceLastCare(plant);
        const cycleDays = Utils.parseCycleDays(plant.cycle);
        
        let badge = '';
        
        if (plant.healthStatus === '枯萎') {
            badge = '<span class="status-tag status-枯萎">已枯萎</span>';
        } else if (isOverdue) {
            if (overdueDays >= 14) {
                badge = `<span class="status-tag status-枯萎" style="margin-left:8px;">严重超期 (${overdueDays}天)</span>`;
            } else if (overdueDays >= 7) {
                badge = `<span class="status-tag status-需养护" style="margin-left:8px;">已超期 (${overdueDays}天)</span>`;
            } else {
                badge = `<span class="status-tag status-良好" style="margin-left:8px;">即将超期 (${overdueDays}天)</span>`;
            }
        } else if (daysSince >= cycleDays * 0.8) {
            const daysRemaining = cycleDays - daysSince;
            badge = `<span class="status-tag status-良好" style="margin-left:8px;">${daysRemaining}天后需养护</span>`;
        }
        
        return badge;
    },

    getLastCareDisplay(plant) {
        const daysSince = Utils.getDaysSinceLastCare(plant);
        const isOverdue = Utils.isOverdue(plant);
        const overdueDays = Utils.getOverdueDays(plant);
        
        if (plant.healthStatus === '枯萎') {
            return `<span style="color:#c62828;font-weight:bold;">${plant.lastCareDate}</span>`;
        } else if (isOverdue) {
            return `<span style="color:#e65100;font-weight:bold;">${plant.lastCareDate} (已超${overdueDays}天)</span>`;
        } else if (daysSince === 0) {
            return `<span style="color:#2e7d32;">${plant.lastCareDate} (今天)</span>`;
        } else {
            return `${plant.lastCareDate} (${daysSince}天前)`;
        }
    },

    renderList() {
        const filters = this.getCurrentFilters();
        const plants = this.getFiltered(filters);
        const container = document.getElementById('plantList');

        if (!plants.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🪴</div>
                    <p>暂无绿植档案，请点击上方按钮添加</p>
                </div>
            `;
            return;
        }

        container.innerHTML = plants.map(plant => {
            const statusBadge = this.getPlantStatusBadge(plant);
            const lastCareDisplay = this.getLastCareDisplay(plant);
            const isOverdue = Utils.isOverdue(plant);
            const overdueDays = Utils.getOverdueDays(plant);
            
            let cardStyle = '';
            if (plant.healthStatus === '枯萎') {
                cardStyle = ' style="opacity:0.7;border-color:#ffcdd2;"';
            } else if (isOverdue && overdueDays >= 14) {
                cardStyle = ' style="border-color:#ffcdd2;border-width:2px;"';
            } else if (isOverdue && overdueDays >= 7) {
                cardStyle = ' style="border-color:#ffe0b2;border-width:2px;"';
            }

            return `
                <div class="plant-card"${cardStyle}>
                    <h3>${plant.name}${statusBadge}</h3>
                    <div class="info-row">
                        <span class="label">品种编号：</span>
                        <span class="value">${plant.code}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">所属品类：</span>
                        <span class="value">${plant.categoryName}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">摆放区域：</span>
                        <span class="value">${plant.area}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">养护周期：</span>
                        <span class="value">${plant.cycle}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">盆土状态：</span>
                        <span class="value">${plant.soilStatus}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">健康状态：</span>
                        <span class="value status-tag status-${plant.healthStatus}">${plant.healthStatus}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">上次养护：</span>
                        <span class="value">${lastCareDisplay}</span>
                    </div>
                    <div class="actions">
                        <button class="btn-edit" onclick="PlantManager.edit('${plant.id}')">编辑</button>
                        <button class="btn-danger" onclick="PlantManager.confirmDelete('${plant.id}')">删除</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    getCurrentFilters() {
        return {
            categoryId: document.getElementById('filterCategory').value,
            area: document.getElementById('filterArea').value,
            cycle: document.getElementById('filterCycle').value,
            healthStatus: document.getElementById('filterStatus').value,
            isOverdue: document.getElementById('filterOverdue') ? document.getElementById('filterOverdue').checked
        };
    },

    openModal() {
        this.currentEditId = null;
        document.getElementById('plantModalTitle').textContent = '添加绿植档案';
        document.getElementById('plantForm').reset();
        document.getElementById('plantLastCareDate').value = Utils.getCurrentDate();
        document.getElementById('plantModal').classList.add('active');
    },

    edit(id) {
        const plant = this.getById(id);
        if (!plant) return;

        this.currentEditId = id;
        document.getElementById('plantModalTitle').textContent = '编辑绿植档案';
        document.getElementById('plantName').value = plant.name;
        document.getElementById('plantCode').value = plant.code;
        document.getElementById('plantCategory').value = plant.categoryId;
        document.getElementById('plantArea').value = plant.area;
        document.getElementById('plantCycle').value = plant.cycle;
        document.getElementById('plantSoilStatus').value = plant.soilStatus || '适中';
        document.getElementById('plantHealthStatus').value = plant.healthStatus || '健康';
        document.getElementById('plantLastCareDate').value = plant.lastCareDate || Utils.getCurrentDate();
        document.getElementById('plantModal').classList.add('active');
    },

    closeModal() {
        this.currentEditId = null;
        document.getElementById('plantModal').classList.remove('active');
    },

    confirmDelete(id) {
        if (confirm('确定要删除这个绿植档案吗？')) {
            this.delete(id);
            Utils.showSuccess('绿植档案删除成功');
            this.refresh();
            CategoryManager.renderSelects();
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('plantName').value.trim();
        const code = document.getElementById('plantCode').value.trim();
        const categoryId = document.getElementById('plantCategory').value;
        const area = document.getElementById('plantArea').value;
        const cycle = document.getElementById('plantCycle').value;
        const soilStatus = document.getElementById('plantSoilStatus').value;
        const healthStatus = document.getElementById('plantHealthStatus').value;
        const lastCareDate = document.getElementById('plantLastCareDate').value;

        let error = Utils.validateRequired(name, '绿植名称');
        if (error) { Utils.showError(error); return; }

        error = Utils.validateRequired(code, '品种编号');
        if (error) { Utils.showError(error); return; }

        error = Utils.validateRequired(categoryId, '所属品类');
        if (error) { Utils.showError(error); return; }

        const plant = {
            name, code, categoryId, area, cycle,
            soilStatus, healthStatus, lastCareDate
        };

        if (this.currentEditId) {
            this.update(this.currentEditId, plant);
            Utils.showSuccess('绿植档案更新成功');
        } else {
            this.add(plant);
            Utils.showSuccess('绿植档案添加成功');
        }

        this.closeModal();
        this.refresh();
        CategoryManager.renderSelects();
    },

    refresh() {
        this.renderList();
    }
};

function openPlantModal() {
    const categories = CategoryManager.getAll();
    if (!categories.length) {
        Utils.showWarning('请先添加绿植品类');
        return;
    }
    PlantManager.openModal();
}

function closePlantModal() {
    PlantManager.closeModal();
}
