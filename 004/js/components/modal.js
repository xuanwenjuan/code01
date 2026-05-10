const Modal = (function() {
    let overlay, container;
    let currentCallback = null;

    function init() {
        overlay = document.getElementById('modal-overlay');
        container = document.getElementById('modal-container');
        
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    close();
                }
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && container && container.classList.contains('active')) {
                close();
            }
        });
    }

    function open(options = {}) {
        if (!overlay || !container) {
            init();
        }

        const {
            title = '提示',
            content = '',
            html = '',
            size = '',
            footerHtml = '',
            onClose = null,
            closable = true
        } = options;

        currentCallback = onClose;

        const sizeClass = size ? `modal-${size}` : '';

        container.innerHTML = `
            <div class="modal ${sizeClass}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    ${closable ? '<button class="modal-close">&times;</button>' : ''}
                </div>
                <div class="modal-body">
                    ${html || content}
                </div>
                ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
            </div>
        `;

        overlay.classList.add('active');
        container.classList.add('active');

        const closeBtn = container.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }
    }

    function close() {
        if (overlay) overlay.classList.remove('active');
        if (container) container.classList.remove('active');
        if (currentCallback) currentCallback();
        currentCallback = null;
    }

    function updateContent(html) {
        if (container) {
            const body = container.querySelector('.modal-body');
            if (body) body.innerHTML = html;
        }
    }

    function form(options = {}) {
        const {
            title = '表单',
            fields = [],
            data = {},
            submitText = '保存',
            cancelText = '取消',
            onSubmit = null,
            size = '',
            helpText = ''
        } = options;

        let fieldsHtml = '';
        
        fields.forEach(field => {
            const value = data[field.name] !== undefined ? data[field.name] : '';
            const required = field.required ? '<span class="required">*</span>' : '';
            
            let fieldHtml = '';
            
            if (field.type === 'textarea') {
                fieldHtml = `<textarea class="form-textarea" name="${field.name}" placeholder="${field.placeholder || ''}" ${field.readonly ? 'readonly' : ''}>${value}</textarea>`;
            } else if (field.type === 'select') {
                let optionsHtml = '';
                field.options.forEach(opt => {
                    const selected = opt.value === value ? 'selected' : '';
                    optionsHtml += `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
                });
                fieldHtml = `<select class="form-select" name="${field.name}" ${field.readonly ? 'disabled' : ''}>${optionsHtml}</select>`;
            } else if (field.type === 'number') {
                const minAttr = field.min !== undefined ? `min="${field.min}"` : '';
                const maxAttr = field.max !== undefined ? `max="${field.max}"` : '';
                fieldHtml = `<input type="number" class="form-input" name="${field.name}" value="${value}" placeholder="${field.placeholder || ''}" ${minAttr} ${maxAttr} ${field.readonly ? 'readonly' : ''}>`;
            } else if (field.type === 'date') {
                fieldHtml = `<input type="date" class="form-input" name="${field.name}" value="${value}" ${field.readonly ? 'readonly' : ''}>`;
            } else {
                fieldHtml = `<input type="text" class="form-input" name="${field.name}" value="${value}" placeholder="${field.placeholder || ''}" ${field.readonly ? 'readonly' : ''}>`;
            }

            fieldsHtml += `
                <div class="form-group" data-field="${field.name}">
                    <label class="form-label">${field.label}${required}</label>
                    ${fieldHtml}
                    <span class="form-error"></span>
                    ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
                </div>
            `;
        });

        const helpHtml = helpText ? `<p class="form-help">${helpText}</p>` : '';

        open({
            title,
            size,
            html: `${helpHtml}${fieldsHtml}`,
            footerHtml: `
                <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                <button class="btn btn-primary modal-submit">${submitText}</button>
            `
        });

        const submitBtn = container.querySelector('.modal-submit');
        const cancelBtn = container.querySelector('.modal-cancel');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', close);
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', function() {
                const formData = {};
                const formGroups = container.querySelectorAll('.form-group');
                
                formGroups.forEach(group => {
                    const input = group.querySelector('input, select, textarea');
                    if (input) {
                        formData[input.name] = input.value;
                    }
                });

                if (onSubmit) {
                    const result = onSubmit(formData);
                    if (result === true) {
                        close();
                    } else if (result && typeof result === 'object') {
                        showFieldErrors(result);
                    }
                } else {
                    close();
                }
            });
        }
    }

    function showFieldErrors(errors) {
        if (!container) return;
        
        container.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorEl = group.querySelector('.form-error');
            if (errorEl) errorEl.textContent = '';
        });

        if (Array.isArray(errors)) {
            errors.forEach(err => {
                const group = container.querySelector(`.form-group[data-field="${err.field}"]`);
                if (group) {
                    group.classList.add('error');
                    const errorEl = group.querySelector('.form-error');
                    if (errorEl) errorEl.textContent = err.message;
                }
            });
        }
    }

    function confirm(options = {}) {
        const {
            title = '确认操作',
            message = '',
            confirmText = '确认',
            cancelText = '取消',
            type = 'warning',
            onConfirm = null,
            onCancel = null
        } = options;

        const iconClass = type === 'danger' ? 'danger' : 'warning';
        const confirmBtnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

        open({
            title,
            size: 'sm',
            html: `
                <div class="confirm-dialog">
                    <div class="confirm-icon ${iconClass}">
                        ${type === 'danger' ? '⚠️' : '❓'}
                    </div>
                    <div class="confirm-message">${message}</div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-secondary modal-cancel">${cancelText}</button>
                <button class="btn ${confirmBtnClass} modal-confirm">${confirmText}</button>
            `
        });

        const confirmBtn = container.querySelector('.modal-confirm');
        const cancelBtn = container.querySelector('.modal-cancel');

        return new Promise((resolve) => {
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() {
                    close();
                    if (onConfirm) onConfirm();
                    resolve(true);
                });
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() {
                    if (onCancel) onCancel();
                    resolve(false);
                });
            }
        });
    }

    function alert(options = {}) {
        const {
            title = '提示',
            message = '',
            buttonText = '知道了',
            type = 'info',
            onClose = null
        } = options;

        open({
            title,
            size: 'sm',
            html: `
                <div class="confirm-dialog">
                    <div class="confirm-message">${message}</div>
                </div>
            `,
            footerHtml: `
                <button class="btn btn-primary modal-close-btn">${buttonText}</button>
            `,
            onClose
        });

        const closeBtn = container.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', close);
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        open,
        close,
        updateContent,
        form,
        confirm,
        alert,
        showFieldErrors
    };
})();
