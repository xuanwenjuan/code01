const MockData = {
    categories: [
        {
            id: 'cat_001',
            name: '绿萝',
            type: '观叶类',
            description: '多年生常绿藤本植物，喜半阴环境，容易养护'
        },
        {
            id: 'cat_002',
            name: '多肉植物',
            type: '多肉类',
            description: '叶片肥厚多汁，储水能力强，喜阳光充足环境'
        },
        {
            id: 'cat_003',
            name: '月季花',
            type: '开花类',
            description: '蔷薇科常绿灌木，四季开花，花色丰富'
        },
        {
            id: 'cat_004',
            name: '常春藤',
            type: '藤本类',
            description: '五加科常绿藤本植物，可攀援生长，净化空气'
        }
    ],

    plants: [
        {
            id: 'plant_001',
            name: '绿萝一号',
            code: 'PL-2024-001',
            categoryId: 'cat_001',
            categoryName: '绿萝',
            area: '教学楼',
            cycle: '7天',
            soilStatus: '适中',
            healthStatus: '健康',
            lastCareDate: '2024-01-10',
            createTime: '2024-01-01 09:00:00'
        },
        {
            id: 'plant_002',
            name: '多肉组合',
            code: 'PL-2024-002',
            categoryId: 'cat_002',
            categoryName: '多肉植物',
            area: '办公楼',
            cycle: '14天',
            soilStatus: '干燥',
            healthStatus: '良好',
            lastCareDate: '2024-01-08',
            createTime: '2024-01-02 10:30:00'
        },
        {
            id: 'plant_003',
            name: '月季盆栽',
            code: 'PL-2024-003',
            categoryId: 'cat_003',
            categoryName: '月季花',
            area: '图书馆',
            cycle: '3天',
            soilStatus: '湿润',
            healthStatus: '需养护',
            lastCareDate: '2024-01-05',
            createTime: '2024-01-03 14:00:00'
        }
    ],

    logs: [
        {
            id: 'log_001',
            plantId: 'plant_001',
            plantName: '绿萝一号',
            type: 'water',
            typeName: '日常浇水',
            operator: '张老师',
            statusBefore: '适中',
            statusAfter: '湿润',
            taskDate: '2024-01-10',
            waterAmount: 500,
            remark: '土壤偏干，适量浇水',
            createTime: '2024-01-10 10:00:00'
        },
        {
            id: 'log_002',
            plantId: 'plant_002',
            plantName: '多肉组合',
            type: 'trim',
            typeName: '修剪施肥',
            operator: '李同学',
            statusBefore: '良好',
            statusAfter: '健康',
            taskDate: '2024-01-08',
            fertilizerType: '缓释肥',
            remark: '修剪枯叶，施加缓释肥',
            createTime: '2024-01-08 15:30:00'
        },
        {
            id: 'log_003',
            plantId: 'plant_003',
            plantName: '月季盆栽',
            type: 'pest',
            typeName: '病虫害处理',
            operator: '王老师',
            statusBefore: '需养护',
            statusAfter: '良好',
            taskDate: '2024-01-05',
            pestType: '蚜虫',
            pestMethod: '喷药治疗',
            remark: '发现蚜虫，使用吡虫啉喷雾处理',
            createTime: '2024-01-05 09:30:00'
        },
        {
            id: 'log_004',
            plantId: 'plant_001',
            plantName: '绿萝一号',
            type: 'water',
            typeName: '日常浇水',
            operator: '李同学',
            statusBefore: '干燥',
            statusAfter: '湿润',
            taskDate: '2024-01-03',
            waterAmount: 800,
            remark: '植物缺水严重，充足浇水',
            createTime: '2024-01-03 14:00:00'
        }
    ],

    reagents: [
        {
            id: 'reagent_001',
            name: '无水乙醇',
            code: 'RG-2024-001',
            category: '有机溶剂',
            unit: 'mL',
            totalQty: 1000,
            availableQty: 800,
            usedQty: 200,
            location: 'A-101',
            supplier: '国药集团',
            expireDate: '2025-12-31',
            status: '正常',
            remark: '',
            createTime: '2024-01-01 09:00:00'
        },
        {
            id: 'reagent_002',
            name: '浓硫酸',
            code: 'RG-2024-002',
            category: '酸类',
            unit: 'mL',
            totalQty: 500,
            availableQty: 450,
            usedQty: 50,
            location: 'B-202',
            supplier: '西陇科学',
            expireDate: '2026-06-30',
            status: '正常',
            remark: '腐蚀性试剂，需特殊存放',
            createTime: '2024-01-02 10:30:00'
        },
        {
            id: 'reagent_003',
            name: '氯化钠',
            code: 'RG-2024-003',
            category: '无机盐',
            unit: 'g',
            totalQty: 1000,
            availableQty: 1000,
            usedQty: 0,
            location: 'A-102',
            supplier: '国药集团',
            expireDate: '2027-01-01',
            status: '正常',
            remark: '',
            createTime: '2024-01-03 14:00:00'
        },
        {
            id: 'reagent_004',
            name: '盐酸',
            code: 'RG-2026-001',
            category: '酸类',
            unit: 'mL',
            totalQty: 1000,
            availableQty: 100,
            usedQty: 900,
            location: 'C-301',
            supplier: '国药集团',
            expireDate: '2026-05-20',
            status: '正常',
            remark: '',
            createTime: '2024-01-04 11:00:00'
        },
        {
            id: 'reagent_005',
            name: '过期氨水',
            code: 'RG-2023-001',
            category: '碱类',
            unit: 'mL',
            totalQty: 500,
            availableQty: 200,
            usedQty: 300,
            location: 'D-401',
            supplier: '西陇科学',
            expireDate: '2025-01-01',
            status: '正常',
            remark: '已过期，请尽快处理',
            createTime: '2024-01-05 09:30:00'
        }
    ],

    reagentLogs: [
        {
            id: 'rlog_001',
            reagentId: 'reagent_001',
            reagentName: '无水乙醇',
            type: '领用',
            qty: 200,
            operator: '王老师',
            purpose: '实验教学',
            beforeQty: 1000,
            afterQty: 800,
            remark: '',
            createTime: '2024-01-10 10:00:00'
        },
        {
            id: 'rlog_002',
            reagentId: 'reagent_002',
            reagentName: '浓硫酸',
            type: '领用',
            qty: 50,
            operator: '李老师',
            purpose: '有机合成实验',
            beforeQty: 500,
            afterQty: 450,
            remark: '',
            createTime: '2024-01-12 14:30:00'
        }
    ],

    initIfEmpty() {
        const categories = Storage.get(Storage.KEYS.CATEGORIES);
        if (!categories.length) {
            Storage.set(Storage.KEYS.CATEGORIES, this.categories);
        }

        const plants = Storage.get(Storage.KEYS.PLANTS);
        if (!plants.length) {
            Storage.set(Storage.KEYS.PLANTS, this.plants);
        }

        const logs = Storage.get(Storage.KEYS.LOGS);
        if (!logs.length) {
            Storage.set(Storage.KEYS.LOGS, this.logs);
        }

        const reagents = Storage.get(Storage.KEYS.REAGENTS);
        if (!reagents.length) {
            Storage.set(Storage.KEYS.REAGENTS, this.reagents);
        }

        const reagentLogs = Storage.get(Storage.KEYS.REAGENT_LOGS);
        if (!reagentLogs.length) {
            Storage.set(Storage.KEYS.REAGENT_LOGS, this.reagentLogs);
        }
    }
};
