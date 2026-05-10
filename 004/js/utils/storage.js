const StorageManager = (function() {
    const STORAGE_KEYS = {
        CRAFTS: 'heritage_crafts',
        COLLECTIONS: 'heritage_collections',
        BORROWS: 'heritage_borrows',
        LOGS: 'heritage_logs',
        COUNTERS: 'heritage_counters'
    };

    function getStorage() {
        return window.localStorage;
    }

    function get(key) {
        const storage = getStorage();
        const data = storage.getItem(key);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('Storage parse error:', e);
            return null;
        }
    }

    function set(key, data) {
        const storage = getStorage();
        storage.setItem(key, JSON.stringify(data));
    }

    function remove(key) {
        const storage = getStorage();
        storage.removeItem(key);
    }

    function getCounter(type) {
        const counters = get(STORAGE_KEYS.COUNTERS) || {};
        return counters[type] || 1;
    }

    function incrementCounter(type) {
        const counters = get(STORAGE_KEYS.COUNTERS) || {};
        const current = counters[type] || 1;
        counters[type] = current + 1;
        set(STORAGE_KEYS.COUNTERS, counters);
        return current;
    }

    function getCrafts() {
        return get(STORAGE_KEYS.CRAFTS) || [];
    }

    function setCrafts(data) {
        set(STORAGE_KEYS.CRAFTS, data);
    }

    function getCollections() {
        return get(STORAGE_KEYS.COLLECTIONS) || [];
    }

    function setCollections(data) {
        set(STORAGE_KEYS.COLLECTIONS, data);
    }

    function getBorrows() {
        return get(STORAGE_KEYS.BORROWS) || [];
    }

    function setBorrows(data) {
        set(STORAGE_KEYS.BORROWS, data);
    }

    function getLogs() {
        return get(STORAGE_KEYS.LOGS) || [];
    }

    function setLogs(data) {
        set(STORAGE_KEYS.LOGS, data);
    }

    function initializeDefaultData() {
        const crafts = getCrafts();
        if (crafts.length === 0) {
            const defaultCrafts = [
                { id: 1, name: '编织类', description: '传统编织工艺，如竹编、草编、藤编等' },
                { id: 2, name: '木雕类', description: '传统木雕工艺，如东阳木雕、黄杨木雕等' },
                { id: 3, name: '陶艺类', description: '传统陶艺工艺，如景德镇陶瓷、宜兴紫砂等' },
                { id: 4, name: '剪纸类', description: '传统剪纸工艺，如陕西剪纸、广东剪纸等' }
            ];
            setCrafts(defaultCrafts);
            set(STORAGE_KEYS.COUNTERS, { craft: 5, collection: 1, borrow: 1, log: 1 });
        }
    }

    return {
        STORAGE_KEYS,
        get,
        set,
        remove,
        getCounter,
        incrementCounter,
        getCrafts,
        setCrafts,
        getCollections,
        setCollections,
        getBorrows,
        setBorrows,
        getLogs,
        setLogs,
        initializeDefaultData
    };
})();
