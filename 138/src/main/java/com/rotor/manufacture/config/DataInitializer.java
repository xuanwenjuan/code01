package com.rotor.manufacture.config;

import com.rotor.manufacture.service.AuthService;
import com.rotor.manufacture.service.CostAccountingService;
import com.rotor.manufacture.service.MaterialService;
import com.rotor.manufacture.service.ProductCategoryService;
import com.rotor.manufacture.service.ProductionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AuthService authService;
    private final ProductCategoryService productCategoryService;
    private final MaterialService materialService;
    private final ProductionOrderService productionOrderService;

    @Override
    public void run(String... args) {
        try {
            log.info("开始初始化测试数据...");
            authService.initAdmin();
            productCategoryService.initCategories();
            materialService.initMaterials();
            productionOrderService.initOrders();
            log.info("测试数据初始化完成！");
            log.info("默认管理员账号：admin / 123456");
        } catch (Exception e) {
            log.error("数据初始化失败", e);
        }
    }
}