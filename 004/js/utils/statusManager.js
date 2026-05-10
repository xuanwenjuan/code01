const StatusManager = (function() {
    const STATUS = {
        NORMAL: '正常',
        BORROWED: '借用中',
        SEALED: '已封存',
        NEEDS_CHECK: '待检查',
        AGED: '老旧'
    };

    const LEVEL = {
        NORMAL: '普通',
        PRECIOUS: '珍贵',
        SPECIAL: '特级'
    };

    const AGED_THRESHOLD = 10;

    function getCollectionStatus(collection) {
        if (!collection) return null;

        if (collection.status === STATUS.SEALED) {
            return STATUS.SEALED;
        }

        if (collection.totalQuantity <= 0) {
            return STATUS.SEALED;
        }

        if (collection.availableQuantity <= 0 && collection.totalQuantity > 0) {
            return STATUS.BORROWED;
        }

        return STATUS.NORMAL;
    }

    function canTransition(collection, newStatus) {
        if (!collection) return false;

        const currentStatus = collection.status;

        const transitions = {
            [STATUS.NORMAL]: [STATUS.BORROWED, STATUS.SEALED, STATUS.NORMAL],
            [STATUS.BORROWED]: [STATUS.NORMAL, STATUS.SEALED, STATUS.BORROWED],
            [STATUS.SEALED]: [STATUS.SEALED],
            [STATUS.NEEDS_CHECK]: [STATUS.NORMAL, STATUS.SEALED, STATUS.NEEDS_CHECK],
            [STATUS.AGED]: [STATUS.NORMAL, STATUS.SEALED, STATUS.AGED]
        };

        const allowedTransitions = transitions[currentStatus] || [];
        return allowedTransitions.includes(newStatus);
    }

    function calculateStatusFromQuantities(collection) {
        if (!collection) return STATUS.SEALED;

        if (collection.totalQuantity <= 0) {
            return STATUS.SEALED;
        }

        if (collection.availableQuantity <= 0) {
            return STATUS.BORROWED;
        }

        return STATUS.NORMAL;
    }

    function ensureQuantityConsistency(collection) {
        if (!collection) return null;

        if (!collection.totalQuantity || collection.totalQuantity < 0) {
            collection.totalQuantity = 0;
        }

        if (!collection.availableQuantity || collection.availableQuantity < 0) {
            collection.availableQuantity = 0;
        }

        if (collection.availableQuantity > collection.totalQuantity) {
            collection.availableQuantity = collection.totalQuantity;
        }

        collection.status = calculateStatusFromQuantities(collection);

        return collection;
    }

    function recalculateStatusForCollection(collection, borrowedQuantity = 0) {
        if (!collection) return null;

        collection.availableQuantity = collection.totalQuantity - borrowedQuantity;

        if (collection.availableQuantity < 0) {
            collection.availableQuantity = 0;
        }

        collection.status = calculateStatusFromQuantities(collection);

        return collection;
    }

    function isAgedCollection(collection) {
        if (!collection || !collection.storageDate) return false;

        const storageYears = Helpers.calculateStorageYears(collection.storageDate);
        return storageYears >= AGED_THRESHOLD;
    }

    function getAgedWarning(storageYears) {
        if (storageYears >= AGED_THRESHOLD) {
            return {
                level: 'warning',
                message: `该藏品已入库${storageYears}年，建议进行定期检查和维护`
            };
        }

        if (storageYears >= 5) {
            return {
                level: 'info',
                message: `该藏品已入库${storageYears}年，请注意保存状态`
            };
        }

        return null;
    }

    function validateBorrowOperation(collection, quantity) {
        const errors = [];

        if (!collection) {
            errors.push('藏品不存在');
            return { valid: false, errors };
        }

        if (collection.status === STATUS.SEALED) {
            errors.push('该藏品已封存，无法借用');
        }

        if (quantity <= 0) {
            errors.push('借用数量必须大于0');
        }

        if (quantity > collection.availableQuantity) {
            errors.push(`借用数量不能超过可用数量（${collection.availableQuantity}件）`);
        }

        if ((collection.level === LEVEL.PRECIOUS || collection.level === LEVEL.SPECIAL) && quantity > 1) {
            errors.push(`珍贵/特级藏品建议每次最多借用1件`);
        }

        return {
            valid: errors.length === 0,
            errors,
            requiresPermission: collection.level === LEVEL.PRECIOUS || collection.level === LEVEL.SPECIAL
        };
    }

    function validateReturnOperation(collection, quantity, returnStatus) {
        const errors = [];

        if (!collection) {
            errors.push('藏品不存在');
            return { valid: false, errors };
        }

        if (quantity <= 0) {
            errors.push('归还数量必须大于0');
        }

        if (returnStatus === '严重破损' && quantity > 0) {
            return {
                valid: errors.length === 0,
                errors,
                requiresSeal: true
            };
        }

        return {
            valid: errors.length === 0,
            errors,
            requiresSeal: false
        };
    }

    function validateSealOperation(collection, quantity) {
        const errors = [];

        if (!collection) {
            errors.push('藏品不存在');
            return { valid: false, errors };
        }

        if (quantity <= 0) {
            errors.push('封存数量必须大于0');
        }

        if (quantity > collection.totalQuantity) {
            errors.push(`封存数量不能超过总数量（${collection.totalQuantity}件）`);
        }

        return {
            valid: errors.length === 0,
            errors,
            hasBorrowedItems: collection.totalQuantity > collection.availableQuantity
        };
    }

    function getStatusDescription(status) {
        const descriptions = {
            [STATUS.NORMAL]: '藏品状态正常，可以正常借用',
            [STATUS.BORROWED]: '藏品全部被借用中，暂时无法借用',
            [STATUS.SEALED]: '藏品已封存，无法进行借用或修改操作',
            [STATUS.NEEDS_CHECK]: '藏品需要检查，建议进行状态确认',
            [STATUS.AGED]: '藏品入库时间较长，建议进行定期维护'
        };
        return descriptions[status] || '未知状态';
    }

    function getStatusBadgeWithTooltip(status, storageYears = 0) {
        let badge = Helpers.getStatusBadge(status);
        const isAged = storageYears >= AGED_THRESHOLD;

        if (isAged && status !== STATUS.SEALED) {
            badge += ' <span style="color: #f39c12;" title="老旧藏品，建议定期检查">⚠️</span>';
        }

        return badge;
    }

    return {
        STATUS,
        LEVEL,
        AGED_THRESHOLD,
        getCollectionStatus,
        canTransition,
        calculateStatusFromQuantities,
        ensureQuantityConsistency,
        recalculateStatusForCollection,
        isAgedCollection,
        getAgedWarning,
        validateBorrowOperation,
        validateReturnOperation,
        validateSealOperation,
        getStatusDescription,
        getStatusBadgeWithTooltip
    };
})();
