package com.snack.processing.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.snack.processing.entity.MaterialStock;
import com.snack.processing.mapper.MaterialStockMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MaterialStockTask {

    private final MaterialStockMapper stockMapper;

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkExpiringStock() {
        log.info("开始检查临期库存...");

        LocalDate today = LocalDate.now();

        List<MaterialStock> stocks = stockMapper.selectList(new LambdaQueryWrapper<MaterialStock>()
                .gt(MaterialStock::getAvailableQuantity, 0)
                .ne(MaterialStock::getStockStatus, 3)
                .isNotNull(MaterialStock::getExpireDate));

        int expiringCount = 0;
        int expiredCount = 0;

        for (MaterialStock stock : stocks) {
            if (stock.getExpireDate() != null) {
                long daysUntilExpire = ChronoUnit.DAYS.between(today, stock.getExpireDate());

                if (daysUntilExpire < 0) {
                    if (stock.getStockStatus() != 3) {
                        stock.setStockStatus(3);
                        stock.setIsExpiring(1);
                        stockMapper.updateById(stock);
                        expiredCount++;
                        log.warn("库存批次[{}]已过期，材料：{}，数量：{}",
                                stock.getBatchNo(), stock.getMaterialName(), stock.getAvailableQuantity());
                    }
                } else if (daysUntilExpire <= 7) {
                    if (stock.getIsExpiring() == null || stock.getIsExpiring() == 0) {
                        stock.setIsExpiring(1);
                        stockMapper.updateById(stock);
                        expiringCount++;
                        log.info("库存批次[{}]将在{}天后过期，材料：{}，数量：{}",
                                stock.getBatchNo(), daysUntilExpire, stock.getMaterialName(), stock.getAvailableQuantity());
                    }
                } else {
                    if (stock.getIsExpiring() != null && stock.getIsExpiring() == 1) {
                        stock.setIsExpiring(0);
                        stockMapper.updateById(stock);
                    }
                }
            }
        }

        log.info("临期库存检查完成，临期批次：{}，过期批次：{}", expiringCount, expiredCount);
    }
}
