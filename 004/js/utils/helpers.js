const Helpers = (function() {
    function generateId(prefix = '') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 6);
        return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
    }

    function formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }

    function formatDateTime(date) {
        return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
    }

    function formatTime(date) {
        return formatDate(date, 'HH:mm:ss');
    }

    function getCurrentTime() {
        return formatDateTime(new Date());
    }

    function getCurrentUser() {
        return '管理员';
    }

    function calculateStorageYears(inDate) {
        const inTime = new Date(inDate).getTime();
        const now = Date.now();
        const diff = now - inTime;
        const years = diff / (1000 * 60 * 60 * 24 * 365);
        return Math.floor(years);
    }

    function addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function validateForm(formData, rules) {
        const errors = [];
        
        for (const field in rules) {
            const rule = rules[field];
            const value = formData[field];

            if (rule.required && !value) {
                errors.push({ field, message: rule.message || `${rule.label}不能为空` });
                continue;
            }

            if (!value) continue;

            if (rule.type === 'number' && isNaN(Number(value))) {
                errors.push({ field, message: `${rule.label}必须是数字` });
                continue;
            }

            if (rule.min !== undefined && Number(value) < rule.min) {
                errors.push({ field, message: `${rule.label}不能小于${rule.min}` });
                continue;
            }

            if (rule.max !== undefined && Number(value) > rule.max) {
                errors.push({ field, message: `${rule.label}不能大于${rule.max}` });
                continue;
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({ field, message: rule.patternMessage || `${rule.label}格式不正确` });
                continue;
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    function getStatusBadge(status) {
        const statusMap = {
            '正常': '<span class="status-badge status-normal">正常</span>',
            '借用中': '<span class="status-badge status-borrowed">借用中</span>',
            '已封存': '<span class="status-badge status-sealed">已封存</span>',
            '珍贵': '<span class="status-badge status-precious">珍贵</span>',
            '特级': '<span class="status-badge status-precious">特级</span>'
        };
        return statusMap[status] || '<span class="status-badge">' + status + '</span>';
    }

    function getLevelBadge(level) {
        const levelMap = {
            '普通': '<span class="status-badge status-normal">普通</span>',
            '珍贵': '<span class="status-badge status-precious">珍贵</span>',
            '特级': '<span class="status-badge status-precious">特级</span>'
        };
        return levelMap[level] || '<span class="status-badge">' + level + '</span>';
    }

    function showEmptyState(tableBody, message = '暂无数据') {
        const colspan = tableBody.closest('table').querySelector('thead tr').children.length;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colspan}">
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <div class="empty-state-text">${message}</div>
                    </div>
                </td>
            </tr>
        `;
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    return {
        generateId,
        formatDate,
        formatDateTime,
        formatTime,
        getCurrentTime,
        getCurrentUser,
        calculateStorageYears,
        addDays,
        escapeHtml,
        validateForm,
        getStatusBadge,
        getLevelBadge,
        showEmptyState,
        debounce
    };
})();
