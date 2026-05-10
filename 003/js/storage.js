const Storage = {
    KEYS: {
        CATEGORIES: 'green_plant_categories',
        PLANTS: 'green_plant_plants',
        LOGS: 'green_plant_logs',
        REAGENTS: 'lab_reagents',
        REAGENT_LOGS: 'lab_reagent_logs',
        OPERATION_LOGS: 'operation_logs'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Storage get error:', e);
            return [];
        }
    },

    set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};
