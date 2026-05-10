const LogManager = {
    getAll() {
        return Storage.get(Storage.KEYS.LOGS);
    },

    getFiltered(filters) {
        let logs = this.getAll();

        if (filters.plantId) {
            logs = logs.filter(log => log.plantId === filters.plantId);
        }
        if (filters.type) {
            logs = logs.filter(log => log.type === filters.type);
        }
        if (filters.status) {
            logs = logs.filter(log => 
                log.statusBefore === filters.status || log.statusAfter === filters.status
            );
        }
        if (filters.date) {
            logs = logs.filter(log => {
                if (!log.taskDate) return false;
                return log.taskDate === filters.date;
            });
        }

        return logs;
    },

    getCurrentFilters() {
        return {
            plantId: document.getElementById('logFilterPlant').value,
            type: document.getElementById('logFilterType').value,
            status: document.getElementById('logFilterStatus').value,
            date: document.getElementById('logFilterDate').value
        };
    },

    add(log) {
        const logs = this.getAll();
        const newLog = {
            id: Storage.generateId(),
            ...log
        };
        logs.unshift(newLog);
        Storage.set(Storage.KEYS.LOGS, logs);
        return newLog;
    },

    renderPlantSelect() {
        const plants = PlantManager.getAll();
        const select = document.getElementById('logFilterPlant');
        
        if (!plants.length) {
            select.innerHTML = '<option value="">全部绿植</option>';
            return;
        }

        const currentValue = select.value;
        select.innerHTML = '<option value="">全部绿植</option>' + 
            plants.map(plant => 
                `<option value="${plant.id}">${plant.name}</option>`
            ).join('');
        select.value = currentValue;
    },

    getLogDetailDisplay(log) {
        if (!log.details && !log.waterAmount && !log.fertilizerType) {
            return '';
        }

        let details = '';
        
        if (log.type === 'water' && log.waterAmount) {
            details += `<span>浇水量：${log.waterAmount} mL</span>`;
        }
        if (log.type === 'trim' && log.fertilizerType) {
            details += `<span>肥料类型：${log.fertilizerType}</span>`;
        }
        if (log.type === 'pest') {
            if (log.pestType) {
                details += `<span>病虫害类型：${log.pestType}</span>`;
            }
            if (log.pestMethod) {
                details += `<span>处理方式：${log.pestMethod}</span>`;
            }
        }
        if (log.type === 'wither') {
            if (log.witherReason) {
                details += `<span>枯萎原因：${log.witherReason}</span>`;
            }
            if (log.witherMethod) {
                details += `<span>处理方式：${log.witherMethod}</span>`;
            }
            if (log.approver) {
                details += `<span>审批人：${log.approver}</span>`;
            }
        }

        return details;
    },

    renderList() {
        this.renderPlantSelect();

        const filters = this.getCurrentFilters();
        const logs = this.getFiltered(filters);
        const container = document.getElementById('logList');

        if (!logs.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📝</div>
                    <p>暂无养护履历记录</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => {
            const details = this.getLogDetailDisplay(log);
            return `
                <div class="log-card">
                    <div class="log-header">
                        <h4>${Utils.getTaskTypeIcon(log.type)} ${log.typeName} - ${log.plantName}</h4>
                        <span class="log-time">${log.createTime}</span>
                    </div>
                    <div class="log-info">
                        <span>养护人：${log.operator}</span>
                        <span>养护日期：${log.taskDate || '-'}</span>
                        <span>状态变更：${log.statusBefore} → ${log.statusAfter}</span>
                    </div>
                    ${details ? `<div class="log-info">${details}</div>` : ''}
                    ${log.remark ? `<div class="log-remark">备注：${log.remark}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    refresh() {
        this.renderList();
    }
};
