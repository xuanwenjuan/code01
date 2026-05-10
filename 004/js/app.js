const App = (function() {
    function init() {
        StorageManager.initializeDefaultData();
        setupNavigation();
        setupTimeDisplay();
        initModules();
    }

    function setupNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const sections = document.querySelectorAll('.tab-section');

        navTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');

                navTabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                this.classList.add('active');
                const targetSection = document.getElementById(`${targetTab}-section`);
                if (targetSection) {
                    targetSection.classList.add('active');
                }

                refreshModuleData(targetTab);
            });
        });
    }

    function refreshModuleData(tabName) {
        switch (tabName) {
            case 'crafts':
                CraftsModule.render();
                break;
            case 'collections':
                CollectionsModule.updateCraftFilter();
                CollectionsModule.render();
                break;
            case 'borrow':
                BorrowModule.render();
                break;
            case 'logs':
                LogsModule.render();
                break;
        }
    }

    function setupTimeDisplay() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            function updateTime() {
                timeElement.textContent = Helpers.formatDateTime(new Date());
            }
            updateTime();
            setInterval(updateTime, 1000);
        }
    }

    function initModules() {
        if (typeof StorageManager !== 'undefined') {
            StorageManager.initializeDefaultData();
        }

        if (typeof Modal !== 'undefined') {
            Modal.init();
        }

        if (typeof Toast !== 'undefined') {
            Toast.init();
        }

        if (typeof CraftsModule !== 'undefined') {
            CraftsModule.init();
        }

        if (typeof CollectionsModule !== 'undefined') {
            CollectionsModule.init();
        }

        if (typeof BorrowModule !== 'undefined') {
            BorrowModule.init();
        }

        if (typeof LogsModule !== 'undefined') {
            LogsModule.init();
        }
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        init,
        refreshModuleData
    };
})();
