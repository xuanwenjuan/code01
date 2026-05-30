package com.evparts.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.evparts.entity.Material;
import com.evparts.entity.MaterialStock;
import com.evparts.mapper.MaterialMapper;
import com.evparts.mapper.MaterialStockMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
public class StockStatusTask {

    @Autowired
    private MaterialStockMapper materialStockMapper;

    @Autowired
    private MaterialMapper materialMapper;

    @Scheduled(cron = "0 0 3 * * ?")
    public void updateStockStatus() {
        log.info("开始执行库存状态更新任务");

        List<MaterialStock> stockList = materialStockMapper.selectList(
                new LambdaQueryWrapper<MaterialStock>()
                        .eq(MaterialStock::getStockStatus, 1)
                        .or()
                        .eq(MaterialStock::getStockStatus, 2)
        );

        List<Material> materials = materialMapper.selectList(null);
        Map<Long, Material> materialMap = materials.stream()
                .collect(Collectors.toMap(Material::getId, m -> m));

        int warningCount = 0;
        int expiredCount = 0;

        for (MaterialStock stock : stockList) {
            Material material = materialMap.get(stock.getMaterialId());
            if (material == null) {
                continue;
            }

            if (stock.getExpiryDate() != null && stock.getExpiryDate().isBefore(LocalDate.now())) {
                if (stock.getStockStatus() != 3) {
                    stock.setStockStatus(3);
                    materialStockMapper.updateById(stock);
                    expiredCount++;
                    log.info("库存批次{}已过期", stock.getBatchNo());
                }
                continue;
            }

            if (material.getWarningStock() != null && stock.getQuantity().compareTo(material.getWarningStock()) < 0) {
                if (stock.getStockStatus() != 2) {
                    stock.setStockStatus(2);
                    materialStockMapper.updateById(stock);
                    warningCount++;
                    log.info("库存批次{}已触发预警", stock.getBatchNo());
                }
            } else {
                if (stock.getStockStatus() != 1) {
                    stock.setStockStatus(1);
                    materialStockMapper.updateById(stock);
                }
            }
        }

        log.info("库存状态更新任务执行完成，预警{}个，过期{}个", warningCount, expiredCount);
    }

}
