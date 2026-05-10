const Utils = {
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hour = String(d.getHours()).padStart(2, '0');
        const minute = String(d.getMinutes()).padStart(2, '0');
        const second = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },

    getCurrentDate() {
        return this.formatDate(new Date());
    },

    getCurrentDateTime() {
        return this.formatDateTime(new Date());
    },

    parseCycleDays(cycle) {
        const match = cycle.match(/(\d+)/);
        return match ? parseInt(match[1]) : 7;
    },

    calculateDaysBetween(date1, date2) {
        if (!date1 || !date2) return 0;
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = d2.getTime() - d1.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    isOverdue(plant) {
        if (!plant.lastCareDate || !plant.cycle) return false;
        const cycleDays = this.parseCycleDays(plant.cycle);
        const daysSinceLastCare = this.calculateDaysBetween(plant.lastCareDate, this.getCurrentDate());
        return daysSinceLastCare > cycleDays;
    },

    getOverdueDays(plant) {
        if (!plant.lastCareDate || !plant.cycle) return 0;
        const cycleDays = this.parseCycleDays(plant.cycle);
        const daysSinceLastCare = this.calculateDaysBetween(plant.lastCareDate, this.getCurrentDate());
        return Math.max(0, daysSinceLastCare - cycleDays);
    },

    getDaysSinceLastCare(plant) {
        if (!plant.lastCareDate) return 0;
        return this.calculateDaysBetween(plant.lastCareDate, this.getCurrentDate());
    },

    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return this.formatDate(d);
    },

    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            return `${fieldName}不能为空`;
        }
        return null;
    },

    setAlertClass(type) {
        const alertModal = document.getElementById('alertModal');
        alertModal.classList.remove('alert-success', 'alert-error', 'alert-warning', 'alert-info');
        if (type) {
            alertModal.classList.add(`alert-${type}`);
        }
    },

    showAlert(title, message, icon = 'ℹ️', type = null) {
        this.setAlertClass(type);
        document.getElementById('alertIcon').textContent = icon;
        document.getElementById('alertTitle').textContent = title;
        document.getElementById('alertMessage').innerHTML = message;
        document.getElementById('alertModal').classList.add('active');
    },

    showSuccess(message) {
        this.showAlert('操作成功', message, '✅', 'success');
    },

    showError(message) {
        this.showAlert('操作失败', message, '❌', 'error');
    },

    showWarning(message) {
        this.showAlert('温馨提示', message, '⚠️', 'warning');
    },

    showInfo(message) {
        this.showAlert('系统提示', message, 'ℹ️', 'info');
    },

    getTaskTypeName(type) {
        const types = {
            'water': '日常浇水',
            'trim': '修剪施肥',
            'pest': '病虫害处理',
            'wither': '枯萎报备淘汰'
        };
        return types[type] || type;
    },

    getTaskTypeIcon(type) {
        const icons = {
            'water': '💧',
            'trim': '✂️',
            'pest': '🐛',
            'wither': '🍂'
        };
        return icons[type] || '🌱';
    }
};
