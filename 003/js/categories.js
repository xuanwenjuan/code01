const CategoryManager = {
    currentEditId: null,

    getAll() {
        return Storage.get(Storage.KEYS.CATEGORIES);
    },

    getById(id) {
        const categories = this.getAll();
        return categories.find(c => c.id === id);
    },

    add(category) {
        const categories = this.getAll();
        const newCategory = {
            id: Storage.generateId(),
            name: category.name,
            type: category.type,
            description: category.description || ''
        };
        categories.push(newCategory);
        Storage.set(Storage.KEYS.CATEGORIES, categories);

        OperationLogManager.add('绿植品类', '新增', category.name, `类型：${category.type}`);
        return newCategory;
    },

    update(id, category) {
        const categories = this.getAll();
        const index = categories.findIndex(c => c.id === id);
        if (index !== -1) {
            categories[index] = {
                ...categories[index],
                name: category.name,
                type: category.type,
                description: category.description || ''
            };
            Storage.set(Storage.KEYS.CATEGORIES, categories);
            this.updatePlantsCategoryName(id, category.name);

            OperationLogManager.add('绿植品类', '修改', category.name, `类型：${category.type}`);
            return categories[index];
        }
        return null;
    },

    updatePlantsCategoryName(categoryId, categoryName) {
        const plants = PlantManager.getAll();
        let updated = false;
        plants.forEach(plant => {
            if (plant.categoryId === categoryId) {
                plant.categoryName = categoryName;
                updated = true;
            }
        });
        if (updated) {
            Storage.set(Storage.KEYS.PLANTS, plants);
        }
    },

    delete(id) {
        const plants = PlantManager.getAll();
        const hasPlants = plants.some(p => p.categoryId === id);
        if (hasPlants) {
            Utils.showWarning('该品类下有绿植档案，无法删除');
            return false;
        }

        const category = this.getById(id);
        const categories = this.getAll();
        const filtered = categories.filter(c => c.id !== id);
        Storage.set(Storage.KEYS.CATEGORIES, filtered);

        if (category) {
            OperationLogManager.add('绿植品类', '删除', category.name, `类型：${category.type}`);
        }
        return true;
    },

    renderList() {
        const categories = this.getAll();
        const container = document.getElementById('categoryList');

        if (!categories.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🌿</div>
                    <p>暂无品类，请点击上方按钮添加</p>
                </div>
            `;
            return;
        }

        container.innerHTML = categories.map(cat => `
            <div class="category-card">
                <h3>${cat.name}</h3>
                <span class="type">${cat.type}</span>
                <p>${cat.description || '暂无描述'}</p>
                <div class="actions">
                    <button class="btn-edit" onclick="CategoryManager.edit('${cat.id}')">编辑</button>
                    <button class="btn-danger" onclick="CategoryManager.confirmDelete('${cat.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },

    renderSelects() {
        const categories = this.getAll();
        const options = categories.map(cat => 
            `<option value="${cat.id}">${cat.name} (${cat.type})</option>`
        ).join('');

        const plantCategorySelect = document.getElementById('plantCategory');
        if (plantCategorySelect) {
            plantCategorySelect.innerHTML = options;
        }

        const filterCategorySelect = document.getElementById('filterCategory');
        if (filterCategorySelect) {
            const currentValue = filterCategorySelect.value;
            filterCategorySelect.innerHTML = '<option value="">全品类</option>' + options;
            filterCategorySelect.value = currentValue;
        }

        const taskPlantSelect = document.getElementById('taskPlant');
        if (taskPlantSelect) {
            const plants = PlantManager.getAll();
            if (plants.length === 0) {
                taskPlantSelect.innerHTML = '<option value="">暂无绿植档案</option>';
            } else {
                taskPlantSelect.innerHTML = plants.map(plant => 
                    `<option value="${plant.id}">${plant.name} (${plant.categoryName})</option>`
                ).join('');
            }
        }
    },

    openModal() {
        this.currentEditId = null;
        document.getElementById('categoryModalTitle').textContent = '添加品类';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryModal').classList.add('active');
    },

    edit(id) {
        const category = this.getById(id);
        if (!category) return;

        this.currentEditId = id;
        document.getElementById('categoryModalTitle').textContent = '编辑品类';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryType').value = category.type;
        document.getElementById('categoryDesc').value = category.description || '';
        document.getElementById('categoryModal').classList.add('active');
    },

    closeModal() {
        this.currentEditId = null;
        document.getElementById('categoryModal').classList.remove('active');
    },

    confirmDelete(id) {
        if (confirm('确定要删除这个品类吗？')) {
            if (this.delete(id)) {
                Utils.showSuccess('品类删除成功');
                this.refresh();
            }
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('categoryName').value.trim();
        const type = document.getElementById('categoryType').value;
        const description = document.getElementById('categoryDesc').value.trim();

        const error = Utils.validateRequired(name, '品类名称');
        if (error) {
            Utils.showError(error);
            return;
        }

        const category = { name, type, description };

        if (this.currentEditId) {
            this.update(this.currentEditId, category);
            Utils.showSuccess('品类更新成功');
        } else {
            this.add(category);
            Utils.showSuccess('品类添加成功');
        }

        this.closeModal();
        this.refresh();
    },

    refresh() {
        this.renderList();
        this.renderSelects();
    }
};

function openCategoryModal() {
    CategoryManager.openModal();
}

function closeCategoryModal() {
    CategoryManager.closeModal();
}
