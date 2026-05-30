package com.fastener.production.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fastener.production.common.enums.MaterialTypeEnum;
import com.fastener.production.entity.material.MaterialBatch;
import com.fastener.production.entity.material.MetalMaterial;
import com.fastener.production.mapper.material.MaterialBatchMapper;
import com.fastener.production.mapper.material.MetalMaterialMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MaterialTask {

    private final MetalMaterialMapper metalMaterialMapper;
    private final MaterialBatchMapper materialBatchMapper;

    @Scheduled(cron = "0 0 3 * * ?")
    public void checkCarbonSteelRustProof() {
        log.info("开始执行：检查碳钢原料防锈周期");

        LambdaQueryWrapper<MetalMaterial> materialWrapper = new LambdaQueryWrapper<>();
        materialWrapper.eq(MetalMaterial::getMaterialType, MaterialTypeEnum.CARBON_STEEL.getCode());
        materialWrapper.gt(MetalMaterial::getRustProofCycle, 0);
        materialWrapper.eq(MetalMaterial::getDeleted, 0);

        List<MetalMaterial> materials = metalMaterialMapper.selectList(materialWrapper);

        int warningCount = 0;
        LocalDate today = LocalDate.now();

        for (MetalMaterial material : materials) {
            LambdaQueryWrapper<MaterialBatch> batchWrapper = new LambdaQueryWrapper<>();
            batchWrapper.eq(MaterialBatch::getMaterialId, material.getId());
            batchWrapper.in(MaterialBatch::getStatus, 1, 2);
            batchWrapper.eq(MaterialBatch::getDeleted, 0);

            List<MaterialBatch> batches = materialBatchMapper.selectList(batchWrapper);

            for (MaterialBatch batch : batches) {
                if (batch.getExpirationDate() != null) {
                    long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, batch.getExpirationDate());
                    if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
                        log.warn("原料批次【{}】将在{}天后过期（防锈期），原料：{}",
                                batch.getBatchCode(), daysUntilExpiry, material.getMaterialName());
                        warningCount++;
                    } else if (daysUntilExpiry < 0) {
                        log.warn("原料批次【{}】已过期（防锈期），原料：{}，过期天数：{}",
                                batch.getBatchCode(), material.getMaterialName(), Math.abs(daysUntilExpiry));
                        batch.setStatus(4);
                        materialBatchMapper.updateById(batch);
                        warningCount++;
                    }
                }
            }
        }

        log.info("执行完成：防锈期预警批次数量={}", warningCount);
    }

    @Scheduled(cron = "0 0 4 * * ?")
    public void checkStockWarning() {
        log.info("开始执行：检查原料库存预警");

        LambdaQueryWrapper<MetalMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MetalMaterial::getDeleted, 0);

        List<MetalMaterial> materials = metalMaterialMapper.selectList(wrapper);

        int warningCount = 0;
        for (MetalMaterial material : materials) {
            if (material.getWarningQuantity() != null && material.getWarningQuantity().compareTo(java.math.BigDecimal.ZERO) > 0) {
                java.math.BigDecimal availableQty = materialBatchMapper.sumAvailableQuantity(material.getId());
                if (availableQty.compareTo(material.getWarningQuantity()) <= 0) {
                    log.warn("原料【{}】库存预警，当前库存：{}，预警阈值：{}",
                            material.getMaterialName(), availableQty, material.getWarningQuantity());
                    warningCount++;
                }
            }
        }

        log.info("执行完成：库存预警原料数量={}", warningCount);
    }
}
