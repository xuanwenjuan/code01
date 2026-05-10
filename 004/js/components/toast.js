const Toast = (function() {
    let container;
    const autoHideDuration = 3000;

    function init() {
        container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    function show(message, type = 'info', duration = autoHideDuration) {
        if (!container) init();

        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        let hideTimeout;

        if (duration > 0) {
            hideTimeout = setTimeout(() => {
                remove(toast);
            }, duration);
        }

        toast.addEventListener('click', () => {
            if (hideTimeout) clearTimeout(hideTimeout);
            remove(toast);
        });
    }

    function remove(toast) {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    function success(message, duration) {
        show(message, 'success', duration);
    }

    function error(message, duration) {
        show(message, 'error', duration);
    }

    function warning(message, duration) {
        show(message, 'warning', duration);
    }

    function info(message, duration) {
        show(message, 'info', duration);
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        show,
        success,
        error,
        warning,
        info
    };
})();
