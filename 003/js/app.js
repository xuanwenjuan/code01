const App = {
    init() {
        MockData.initIfEmpty();
        this.bindEvents();
        this.renderAll();
        this.checkExpireAlerts();
        this.checkPlantCareAlerts();
    },

    checkExpireAlerts() {
        ReagentManager.checkExpireAlerts();
    },

    checkPlantCareAlerts() {
        PlantManager.checkAndUpdateHealthStatus();
        
        const overduePlants = PlantManager.getOverduePlants();
        const warningPlants = PlantManager.getWarningPlants().filter(p => 
            !overduePlants.some(op => op.id === p.id)
        );

        let message = '';
        
        if (overduePlants.length > 0) {
            const criticalCount = overduePlants.filter(p => Utils.getOverdueDays(p) >= 14).length;
            const overdueCount = overduePlants.filter(p => Utils.getOverdueDays(p) >= 7 && Utils.getOverdueDays(p) < 14).length;
            
            if (criticalCount > 0) {
                message += `🚨 有 ${criticalCount} 个绿植严重超期养护（超14天）！<br>`;
                message += overduePlants.filter(p => Utils.getOverdueDays(p) >= 14).map(p => 
                    `  • ${p.name}（超${Utils.getOverdueDays(p)}天）`
                ).join('<br>') + '<br><br>';
            }
            
            if (overdueCount > 0) {
                message += `⚠️ 有 ${overdueCount} 个绿植已超期养护（超7天）！<br>`;
                message += overduePlants.filter(p => Utils.getOverdueDays(p) >= 7 && Utils.getOverdueDays(p) < 14).map(p => 
                    `  • ${p.name}（超${Utils.getOverdueDays(p)}天）`
                ).join('<br>') + '<br><br>';
            }
        }
        
        if (warningPlants.length > 0) {
            message += `📅 有 ${warningPlants.length} 个绿植即将到养护期！<br>`;
            message += warningPlants.map(p => {
                const cycleDays = Utils.parseCycleDays(p.cycle);
                const daysSince = Utils.getDaysSinceLastCare(p);
                const daysRemaining = cycleDays - daysSince;
                return `  • ${p.name}（还有${daysRemaining}天）`;
            }).join('<br>');
        }

        if (message) {
            setTimeout(() => {
                Utils.showWarning(message);
            }, 800);
        }
    },

    bindEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('categoryForm').addEventListener('submit', (e) => CategoryManager.handleSubmit(e));
        document.getElementById('plantForm').addEventListener('submit', (e) => PlantManager.handleSubmit(e));
        document.getElementById('taskForm').addEventListener('submit', (e) => TaskManager.handleSubmit(e));
        document.getElementById('reagentForm').addEventListener('submit', (e) => ReagentManager.handleSubmit(e));
        document.getElementById('reagentOpForm').addEventListener('submit', (e) => ReagentManager.handleOpSubmit(e));

        document.getElementById('filterCategory').addEventListener('change', () => PlantManager.refresh());
        document.getElementById('filterArea').addEventListener('change', () => PlantManager.refresh());
        document.getElementById('filterCycle').addEventListener('change', () => PlantManager.refresh());
        document.getElementById('filterStatus').addEventListener('change', () => PlantManager.refresh());

        document.getElementById('reagentFilterCategory').addEventListener('change', () => ReagentManager.refresh());
        document.getElementById('reagentFilterStatus').addEventListener('change', () => ReagentManager.refresh());
        document.getElementById('reagentFilterKeyword').addEventListener('input', () => ReagentManager.refresh());

        document.getElementById('reagentLogFilterType').addEventListener('change', () => ReagentLogManager.refresh());

        document.getElementById('opLogFilterModule').addEventListener('change', () => OperationLogManager.refresh());
        document.getElementById('opLogFilterType').addEventListener('change', () => OperationLogManager.refresh());

        document.getElementById('logFilterPlant').addEventListener('change', () => LogManager.refresh());
        document.getElementById('logFilterType').addEventListener('change', () => LogManager.refresh());
        document.getElementById('logFilterStatus').addEventListener('change', () => LogManager.refresh());
        document.getElementById('logFilterDate').addEventListener('change', () => LogManager.refresh());

        const taskPlantSelect = document.getElementById('taskPlant');
        if (taskPlantSelect) {
            taskPlantSelect.addEventListener('change', (e) => {
                TaskManager.updatePlantStatusDisplay(e.target.value);
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    },

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });

        if (tabName === 'reagents') ReagentManager.refresh();
        if (tabName === 'reagentLogs') ReagentLogManager.refresh();
        if (tabName === 'operationLogs') OperationLogManager.refresh();
    },

    renderAll() {
        CategoryManager.refresh();
        PlantManager.refresh();
        LogManager.renderList();
        ReagentManager.refresh();
        ReagentLogManager.refresh();
        OperationLogManager.refresh();
    }
};

function closeAlertModal() {
    document.getElementById('alertModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
