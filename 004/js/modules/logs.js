const LogsModule = (function() {
    let tableBody;
    let typeFilter;
    let startDate;
    let endDate;
    let resetBtn;

    function init() {
        tableBody = document.getElementById('logs-table-body');
        typeFilter = document.getElementById('log-type-filter');
        startDate = document.getElementById('log-start-date');
        endDate = document.getElementById('log-end-date');
        resetBtn = document.getElementById('reset-log-filter');

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetFilters();
            });
        }

        [typeFilter, startDate, endDate].forEach(elem => {
            if (elem) {
                elem.addEventListener('change', render);
            }
        });

        render();
    }

    function resetFilters() {
        if (typeFilter) typeFilter.value = '';
        if (startDate) startDate.value = '';
        if (endDate) endDate.value = '';
        render();
    }

    function getFilteredLogs() {
        let logs = StorageManager.getLogs();

        if (typeFilter && typeFilter.value) {
            logs = logs.filter(l => l.type === typeFilter.value);
        }

        if (startDate && startDate.value) {
            const startTime = new Date(startDate.value).getTime();
            logs = logs.filter(l => new Date(l.time).getTime() >= startTime);
        }

        if (endDate && endDate.value) {
            const endTime = new Date(endDate.value + ' 23:59:59').getTime();
            logs = logs.filter(l => new Date(l.time).getTime() <= endTime);
        }

        return logs.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    function render() {
        const logs = getFilteredLogs();

        if (!tableBody) return;

        if (logs.length === 0) {
            Helpers.showEmptyState(tableBody, '暂无操作记录');
            return;
        }

        tableBody.innerHTML = '';
        logs.forEach(log => {
            const typeBadge = getTypeBadge(log.type);
            const quantityChangeText = log.quantityChange > 0 
                ? `+${log.quantityChange}` 
                : log.quantityChange < 0 
                    ? `${log.quantityChange}` 
                    : '-';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${Helpers.formatDateTime(log.time)}</td>
                <td>${typeBadge}</td>
                <td>${Helpers.escapeHtml(log.content)}</td>
                <td>${Helpers.escapeHtml(log.operator)}</td>
                <td>${Helpers.escapeHtml(log.collectionName || '-')}</td>
                <td>${quantityChangeText}</td>
                <td>${log.remainingStock !== undefined ? log.remainingStock : '-'}</td>
                <td>${Helpers.escapeHtml(log.statusChange || '-')}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function getTypeBadge(type) {
        const badgeMap = {
            '添加': '<span class="status-badge status-normal">添加</span>',
            '修改': '<span class="status-badge status-precious">修改</span>',
            '删除': '<span class="status-badge status-sealed">删除</span>',
            '借用': '<span class="status-badge status-borrowed">借用</span>',
            '归还': '<span class="status-badge status-normal">归还</span>',
            '封存': '<span class="status-badge status-sealed">封存</span>'
        };
        return badgeMap[type] || '<span class="status-badge">' + type + '</span>';
    }

    function addLog(logData) {
        const logs = StorageManager.getLogs();
        const newId = StorageManager.incrementCounter('log');

        const newLog = {
            id: newId,
            time: new Date().toISOString(),
            type: logData.type || '其他',
            content: logData.content || '',
            operator: logData.operator || Helpers.getCurrentUser(),
            collectionName: logData.collectionName || '-',
            quantityChange: logData.quantityChange || 0,
            remainingStock: logData.remainingStock !== undefined ? logData.remainingStock : '-',
            statusChange: logData.statusChange || '-'
        };

        logs.push(newLog);
        StorageManager.setLogs(logs);
        render();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        render,
        addLog
    };
})();
