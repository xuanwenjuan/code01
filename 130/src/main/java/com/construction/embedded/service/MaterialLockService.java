package com.construction.embedded.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.construction.embedded.dto.OrderMaterialLockDTO;
import com.construction.embedded.entity.Material;
import com.construction.embedded.entity.MaterialLockRecord;
import com.construction.embedded.entity.ProductionOrder;
import com.construction.embedded.exception.BusinessException;
import com.construction.embedded.mapper.MaterialLockRecordMapper;
import com.construction.embedded.mapper.ProductionOrderMapper;
import com.construction.embedded.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class MaterialLockService {

    @Autowired
    private MaterialLockRecordMapper materialLockRecordMapper;

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ProductionLogService productionLogService;

    @Transactional(rollbackFor = Exception.class)
    public void lockOrderMaterials(OrderMaterialLockDTO dto) {
        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        
        if (!"PENDING".equals(order.getStatus()) && !"SUSPENDED".equals(order.getStatus())) {
            throw new BusinessException("只有待投产或暂停状态的工单才能锁定原料");
        }

        for (OrderMaterialLockDTO.MaterialLockItem item : dto.getMaterialItems()) {
            Material material = materialService.getById(item.getMaterialId());
            if (material == null) {
                throw new BusinessException("原料不存在：" + item.getMaterialId());
            }

            materialService.lockStock(item.getMaterialId(), item.getLockedQuantity());

            MaterialLockRecord record = new MaterialLockRecord();
            record.setOrderId(dto.getOrderId());
            record.setMaterialId(item.getMaterialId());
            record.setMaterialName(material.getMaterialName());
            record.setSpecification(material.getSpecification());
            record.setLockedQuantity(item.getLockedQuantity());
            record.setLockType("ORDER_LOCK");
            record.setStatus("LOCKED");
            record.setOperatorId(UserContext.getUserId());
            record.setOperatorName(UserContext.getUsername());
            record.setRemark(dto.getRemark());
            materialLockRecordMapper.insert(record);
        }

        String beforeStatus = order.getStatus();
        order.setStatus("MATERIAL_LOCKED");
        productionOrderMapper.updateById(order);

        productionLogService.saveLog(dto.getOrderId(), "MATERIAL_LOCK", 
            "工单原料锁定完成，锁定原料种类：" + dto.getMaterialItems().size(), 
            beforeStatus, "MATERIAL_LOCKED");
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockOrderMaterials(Long orderId, String remark) {
        LambdaQueryWrapper<MaterialLockRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLockRecord::getOrderId, orderId)
               .eq(MaterialLockRecord::getStatus, "LOCKED");
        
        var lockRecords = materialLockRecordMapper.selectList(wrapper);
        
        for (MaterialLockRecord record : lockRecords) {
            materialService.unlockStock(record.getMaterialId(), record.getLockedQuantity());
            
            record.setStatus("RELEASED");
            record.setReleaseTime(LocalDateTime.now());
            record.setRemark(remark);
            materialLockRecordMapper.updateById(record);
        }

        ProductionOrder order = productionOrderMapper.selectById(orderId);
        if (order != null) {
            String beforeStatus = order.getStatus();
            order.setStatus("PENDING");
            productionOrderMapper.updateById(order);
            
            productionLogService.saveLog(orderId, "MATERIAL_UNLOCK", 
                "工单原料解锁，解锁数量：" + lockRecords.size(), 
                beforeStatus, "PENDING");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void consumeLockedMaterials(Long orderId) {
        LambdaQueryWrapper<MaterialLockRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialLockRecord::getOrderId, orderId)
               .eq(MaterialLockRecord::getStatus, "LOCKED");
        
        var lockRecords = materialLockRecordMapper.selectList(wrapper);
        
        for (MaterialLockRecord record : lockRecords) {
            materialService.consumeStock(record.getMaterialId(), record.getLockedQuantity());
            
            record.setStatus("CONSUMED");
            record.setReleaseTime(LocalDateTime.now());
            materialLockRecordMapper.updateById(record);
        }

        productionLogService.saveLog(orderId, "MATERIAL_CONSUME", 
            "工单原料消耗完成，消耗种类：" + lockRecords.size(), 
            null, null);
    }

    public IPage<MaterialLockRecord> queryPage(Long orderId, String status, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<MaterialLockRecord> wrapper = new LambdaQueryWrapper<>();
        if (orderId != null) {
            wrapper.eq(MaterialLockRecord::getOrderId, orderId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(MaterialLockRecord::getStatus, status);
        }
        wrapper.orderByDesc(MaterialLockRecord::getCreateTime);
        return materialLockRecordMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    public MaterialLockRecord getById(Long id) {
        return materialLockRecordMapper.selectById(id);
    }
}
