const OperationLogManager = {
    getAll() {
        return Storage.get(Storage.KEYS.OPERATION_LOGS);
    },

    getFiltered(filters) {
        let logs = this.getAll();

        if (filters.module) {
            logs = logs.filter(log => log.module === filters.module);
        }
        if (filters.type) {
            logs = logs.filter(log => log.type === filters.type);
        }

        return logs;
    },

    add(module, type, targetName, detail = '') {
        const logs = this.getAll();
        const newLog = {
            id: Storage.generateId(),
            module: module,
            type: type,
            targetName: targetName,
            detail: detail,
            createTime: Utils.getCurrentDateTime()
        };
        logs.unshift(newLog);
        Storage.set(Storage.KEYS.OPERATION_LOGS, logs);
        return newLog;
    },

    getCurrentFilters() {
        return {
            module: document.getElementById('opLogFilterModule').value,
            type: document.getElementById('opLogFilterType').value
        };
    },

    renderList() {
        const filters = this.getCurrentFilters();
        const logs = this.getFiltered(filters);
        const container = document.getElementById('operationLogList');

        if (!logs.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <p>暂无系统操作日志</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-card">
                <div class="log-header">
                    <h4>【${log.module}】${log.type} - ${log.targetName}</h4>
                    <span class="log-time">${log.createTime}</span>
                </div>
                ${log.detail ? `<div class="log-remark">详情：${log.detail}</div>` : ''}
            </div>
        `).join('');
    },

    refresh() {
        this.renderList();
    }
};
