const TaskManager = {
    currentTaskType: null,
    currentPlant: null,

    getStatusUpdates(taskType) {
        const updates = {
            water: { soilStatus: '湿润', healthStatus: '健康' },
            trim: { healthStatus: '健康' },
            pest: { healthStatus: '良好' },
            wither: { healthStatus: '枯萎' }
        };
        return updates[taskType] || {};
    },

    getTaskDetails(taskType, data) {
        const details = {
            water: `浇水量: ${data.waterAmount || 0} mL`,
            trim: `肥料类型: ${data.fertilizerType || '无'}`,
            pest: `病虫害: ${data.pestType || '未知'}, 处理方式: ${data.pestMethod || '未指定'}`,
            wither: `枯萎原因: ${data.witherReason || '未知'}, 处理方式: ${data.witherMethod || '未指定'}, 审批人: ${data.approver || '无'}`
        };
        return details[taskType] || '';
    },

    updatePlantStatusForWither(reason, method) {
        if (method === '彻底淘汰') {
            return null;
        }
        if (method === '抢救') {
            return { healthStatus: '需养护' };
        }
        if (method === '移植') {
            return { healthStatus: '良好' };
        }
        if (method === '修剪') {
            return { healthStatus: '需养护' };
        }
        return { healthStatus: '枯萎' };
    },

    execute(taskType, data) {
        const plant = PlantManager.getById(data.plantId);
        if (!plant) {
            Utils.showError('绿植不存在');
            return false;
        }

        if (taskType === 'wither' && plant.healthStatus === '枯萎') {
            Utils.showError('该绿植已枯萎，请勿重复报备');
            return false;
        }

        let statusUpdates = this.getStatusUpdates(taskType);
        
        if (taskType === 'wither') {
            const customStatus = this.updatePlantStatusForWither(data.witherReason, data.witherMethod);
            if (customStatus === null) {
                if (PlantManager.delete(data.plantId)) {
                    OperationLogManager.add('绿植档案', '删除', plant.name, `因枯萎淘汰，原因：${data.witherReason}`);
                }
            } else {
                statusUpdates = customStatus;
            }
        }

        const taskDetails = this.getTaskDetails(taskType, data);

        const logData = {
            plantId: plant.id,
            plantName: plant.name,
            type: taskType,
            typeName: Utils.getTaskTypeName(taskType),
            operator: data.operator,
            statusBefore: plant.healthStatus,
            statusAfter: (statusUpdates && statusUpdates.healthStatus) || plant.healthStatus,
            taskDate: data.taskDate || Utils.getCurrentDate(),
            remark: data.remark || '',
            details: taskDetails,
            waterAmount: data.waterAmount || null,
            fertilizerType: data.fertilizerType || '',
            pestType: data.pestType || '',
            pestMethod: data.pestMethod || '',
            witherReason: data.witherReason || '',
            witherMethod: data.witherMethod || '',
            approver: data.approver || '',
            createTime: Utils.getCurrentDateTime()
        };

        LogManager.add(logData);

        if (statusUpdates) {
            PlantManager.updateStatus(plant.id, statusUpdates);
        }

        const opLogType = {
            water: '浇水',
            trim: '修剪施肥',
            pest: '病虫害处理',
            wither: '枯萎报备'
        };

        OperationLogManager.add('养护任务', opLogType[taskType] || taskType, plant.name, 
            `养护人：${data.operator}${taskDetails ? '，' + taskDetails : ''}`);

        return true;
    },

    setTaskFieldsVisibility(taskType) {
        document.getElementById('taskWaterGroup').style.display = taskType === 'water' ? 'block' : 'none';
        document.getElementById('taskTrimGroup').style.display = taskType === 'trim' ? 'block' : 'none';
        document.getElementById('taskPestGroup').style.display = taskType === 'pest' ? 'block' : 'none';
        document.getElementById('taskPestGroup2').style.display = taskType === 'pest' ? 'block' : 'none';
        document.getElementById('taskWitherGroup').style.display = taskType === 'wither' ? 'block' : 'none';
        document.getElementById('taskWitherGroup2').style.display = taskType === 'wither' ? 'block' : 'none';
        document.getElementById('taskWitherGroup3').style.display = taskType === 'wither' ? 'block' : 'none';

        const reasonSelect = document.getElementById('taskWitherReason');
        const methodSelect = document.getElementById('taskWitherMethod');
        if (taskType === 'wither') {
            reasonSelect.required = true;
            methodSelect.required = true;
        } else {
            reasonSelect.required = false;
            methodSelect.required = false;
        }
    },

    updatePlantStatusDisplay(plantId) {
        const plant = PlantManager.getById(plantId);
        if (plant) {
            this.currentPlant = plant;
            document.getElementById('taskPlantStatus').value = 
                `${plant.healthStatus} (盆土: ${plant.soilStatus}, 区域: ${plant.area})`;
        }
    },

    renderPlantSelect(excludeWithered = false) {
        const plants = PlantManager.getAll();
        const select = document.getElementById('taskPlant');
        
        if (!plants.length) {
            select.innerHTML = '<option value="">暂无绿植档案</option>';
            return;
        }

        let filteredPlants = plants;
        if (this.currentTaskType === 'wither') {
            filteredPlants = plants.filter(p => p.healthStatus !== '枯萎');
        }

        if (!filteredPlants.length) {
            select.innerHTML = '<option value="">无可操作的绿植</option>';
            return;
        }

        select.innerHTML = filteredPlants.map(plant => 
            `<option value="${plant.id}" data-status="${plant.healthStatus}">
                ${plant.name} (${plant.categoryName} - ${plant.healthStatus})
            </option>`
        ).join('');

        if (filteredPlants.length > 0) {
            this.updatePlantStatusDisplay(filteredPlants[0].id);
        }
    },

    openModal(taskType) {
        const plants = PlantManager.getAll();
        if (!plants.length) {
            Utils.showWarning('请先添加绿植档案');
            return;
        }

        if (taskType === 'wither') {
            const availablePlants = plants.filter(p => p.healthStatus !== '枯萎');
            if (!availablePlants.length) {
                Utils.showWarning('所有绿植已枯萎，无需报备');
                return;
            }
        }

        this.currentTaskType = taskType;
        document.getElementById('taskModalTitle').textContent = Utils.getTaskTypeName(taskType) + ' 登记';
        document.getElementById('taskType').value = taskType;
        
        this.renderPlantSelect(taskType === 'wither');
        this.setTaskFieldsVisibility(taskType);
        
        document.getElementById('taskDate').value = Utils.getCurrentDate();
        document.getElementById('taskForm').reset();
        document.getElementById('taskDate').value = Utils.getCurrentDate();
        document.getElementById('taskType').value = taskType;
        
        this.renderPlantSelect(taskType === 'wither');
        document.getElementById('taskModal').classList.add('active');
    },

    closeModal() {
        this.currentTaskType = null;
        this.currentPlant = null;
        document.getElementById('taskModal').classList.remove('active');
    },

    handleSubmit(e) {
        e.preventDefault();

        const plantId = document.getElementById('taskPlant').value;
        const operator = document.getElementById('taskOperator').value.trim();
        const taskDate = document.getElementById('taskDate').value;
        const waterAmount = document.getElementById('taskWaterAmount').value;
        const fertilizerType = document.getElementById('taskFertilizerType').value;
        const pestType = document.getElementById('taskPestType').value;
        const pestMethod = document.getElementById('taskPestMethod').value;
        const witherReason = document.getElementById('taskWitherReason').value;
        const witherMethod = document.getElementById('taskWitherMethod').value;
        const approver = document.getElementById('taskApprover').value.trim();
        const remark = document.getElementById('taskRemark').value.trim();

        let error = Utils.validateRequired(plantId, '选择绿植');
        if (error) { Utils.showError(error); return; }

        error = Utils.validateRequired(operator, '养护人');
        if (error) { Utils.showError(error); return; }

        const taskType = this.currentTaskType;

        if (taskType === 'wither') {
            error = Utils.validateRequired(witherReason, '枯萎原因');
            if (error) { Utils.showError(error); return; }
            
            error = Utils.validateRequired(witherMethod, '处理方式');
            if (error) { Utils.showError(error); return; }
        }

        const data = {
            plantId,
            operator,
            taskDate,
            waterAmount: waterAmount ? parseFloat(waterAmount) : 0,
            fertilizerType,
            pestType,
            pestMethod,
            witherReason,
            witherMethod,
            approver,
            remark
        };

        if (this.execute(taskType, data)) {
            const typeName = Utils.getTaskTypeName(taskType);
            Utils.showSuccess(`${typeName}登记成功`);
            this.closeModal();
            PlantManager.refresh();
            LogManager.refresh();
            CategoryManager.renderSelects();
        }
    }
};

function openTaskModal(type) {
    TaskManager.openModal(type);
}

function closeTaskModal() {
    TaskManager.closeModal();
}
