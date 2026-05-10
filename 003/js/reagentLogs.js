const ReagentLogManager = {
    getAll() {
        return Storage.get(Storage.KEYS.REAGENT_LOGS);
    },

    getFiltered(filters) {
        let logs = this.getAll();

        if (filters.type) {
            logs = logs.filter(log => log.type === filters.type);
        }

        return logs;
    },

    add(logData) {
        const logs = this.getAll();
        const newLog = {
            id: Storage.generateId(),
            ...logData,
            createTime: Utils.getCurrentDateTime()
        };
        logs.unshift(newLog);
        Storage.set(Storage.KEYS.REAGENT_LOGS, logs);
        return newLog;
    },

    getCurrentFilters() {
        return {
            type: document.getElementById('reagentLogFilterType').value
        };
    },

    getTypeIcon(type) {
        const icons = {
            '领用': '📤',
            '归还': '📥',
            '报废': '🗑️'
        };
        return icons[type] || '📝';
    },

    renderList() {
        const filters = this.getCurrentFilters();
        const logs = this.getFiltered(filters);
        const container = document.getElementById('reagentLogList');

        if (!logs.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">📋</div>
                    <p>暂无试剂操作日志</p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="log-card">
                <div class="log-header">
                    <h4>${this.getTypeIcon(log.type)} ${log.type} - ${log.reagentName}</h4>
                    <span class="log-time">${log.createTime}</span>
                </div>
                <div class="log-info">
                    <span>操作人：${log.operator}</span>
                    <span>数量：${log.qty}</span>
                    <span>库存变更：${log.beforeQty} → ${log.afterQty}</span>
                </div>
                ${log.purpose ? `<div class="log-remark">用途：${log.purpose}</div>` : ''}
                ${log.remark ? `<div class="log-remark">备注：${log.remark}</div>` : ''}
            </div>
        `).join('');
    },

    refresh() {
        this.renderList();
    }
};
