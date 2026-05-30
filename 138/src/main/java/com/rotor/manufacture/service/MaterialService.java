package com.rotor.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.common.ResultCodeEnum;
import com.rotor.manufacture.context.UserContext;
import com.rotor.manufacture.dto.MaterialOperationDTO;
import com.rotor.manufacture.dto.MaterialQueryDTO;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.entity.Material;
import com.rotor.manufacture.entity.OrderMaterial;
import com.rotor.manufacture.entity.ProductionOrder;
import com.rotor.manufacture.exception.BusinessException;
import com.rotor.manufacture.mapper.MaterialMapper;
import com.rotor.manufacture.mapper.OrderMaterialMapper;
import com.rotor.manufacture.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialMapper materialMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final ProductionOrderMapper productionOrderMapper;

    private static final BigDecimal WARNING_THRESHOLD = new BigDecimal("100");

    @Transactional(rollbackFor = Exception.class)
    public void addMaterial(Material material) {
        String batchNo = generateBatchNo(material.getMaterialType());
        material.setBatchNo(batchNo);
        material.setLockedQuantity(BigDecimal.ZERO);
        updateStockStatus(material);
        materialMapper.insert(material);
        log.info("新增原料成功: {}, 批次号: {}", material.getMaterialName(), batchNo);
    }

    private String generateBatchNo(String materialType) {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return materialType + "-" + dateStr + "-" + uuid;
    }

    private void updateStockStatus(Material material) {
        if (material.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            material.setStockStatus(2);
        } else if (material.getQuantity().compareTo(WARNING_THRESHOLD) < 0) {
            material.setStockStatus(1);
        } else {
            material.setStockStatus(0);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMaterial(Material material) {
        Material oldMaterial = materialMapper.selectById(material.getId());
        if (oldMaterial == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }
        updateStockStatus(material);
        materialMapper.updateById(material);
        log.info("更新原料成功: {}", material.getMaterialName());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) {
        Material material = materialMapper.selectById(id);
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }
        if (material.getLockedQuantity() != null && material.getLockedQuantity().compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("原料已被锁定，无法删除");
        }
        materialMapper.deleteById(id);
        log.info("删除原料成功: {}", id);
    }

    public Material getById(Long id) {
        return materialMapper.selectById(id);
    }

    public List<Material> list() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectList(wrapper);
    }

    public Page<Material> pageQuery(PageQueryDTO queryDTO) {
        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialName, queryDTO.getKeyword())
                    .or().like(Material::getMaterialCode, queryDTO.getKeyword()));
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(Material::getStockStatus, queryDTO.getStatus());
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        wrapper.orderByDesc(Material::getCreateTime);
        return materialMapper.selectPage(page, wrapper);
    }

    public Page<Material> queryByConditions(MaterialQueryDTO queryDTO) {
        Page<Material> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(Material::getMaterialName, queryDTO.getKeyword())
                    .or().like(Material::getMaterialCode, queryDTO.getKeyword())
                    .or().like(Material::getSupplier, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getMaterialType())) {
            wrapper.eq(Material::getMaterialType, queryDTO.getMaterialType());
        }
        if (queryDTO.getStockStatus() != null) {
            wrapper.eq(Material::getStockStatus, queryDTO.getStockStatus());
        }
        if (StringUtils.hasText(queryDTO.getSupplier())) {
            wrapper.like(Material::getSupplier, queryDTO.getSupplier());
        }
        if (StringUtils.hasText(queryDTO.getBatchNo())) {
            wrapper.like(Material::getBatchNo, queryDTO.getBatchNo());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(Material::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(Material::getQuantity, queryDTO.getMaxQuantity());
        }
        if (queryDTO.getStartCreateTime() != null) {
            wrapper.ge(Material::getCreateTime, queryDTO.getStartCreateTime());
        }
        if (queryDTO.getEndCreateTime() != null) {
            wrapper.le(Material::getCreateTime, queryDTO.getEndCreateTime());
        }
        if (queryDTO.getStartExpiryDate() != null) {
            wrapper.ge(Material::getExpiryDate, queryDTO.getStartExpiryDate());
        }
        if (queryDTO.getEndExpiryDate() != null) {
            wrapper.le(Material::getExpiryDate, queryDTO.getEndExpiryDate());
        }

        if ("asc".equalsIgnoreCase(queryDTO.getOrderDirection())) {
            wrapper.orderByAsc(getOrderColumn(queryDTO.getOrderBy()));
        } else {
            wrapper.orderByDesc(getOrderColumn(queryDTO.getOrderBy()));
        }

        return materialMapper.selectPage(page, wrapper);
    }

    private String getOrderColumn(String orderBy) {
        return switch (orderBy) {
            case "quantity" -> "quantity";
            case "materialName" -> "material_name";
            case "createTime" -> "create_time";
            case "expiryDate" -> "expiry_date";
            default -> "create_time";
        };
    }

    public List<Material> getWarningMaterials() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getStockStatus, 1)
                .or()
                .eq(Material::getStockStatus, 2);
        return materialMapper.selectList(wrapper);
    }

    public List<Material> getExpiringMagnets() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Material::getMaterialType, "PERMANENT_MAGNET")
                .lt(Material::getExpiryDate, LocalDateTime.now().plusDays(30))
                .gt(Material::getExpiryDate, LocalDateTime.now());
        return materialMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long id, BigDecimal quantity) {
        LambdaUpdateWrapper<Material> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Material::getId, id)
                .setSql("quantity = quantity + " + quantity);
        materialMapper.update(null, wrapper);

        Material material = materialMapper.selectById(id);
        updateStockStatus(material);
        materialMapper.updateById(material);
        log.info("更新库存成功: 原料ID={}, 数量变化={}", id, quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockMaterial(Long materialId, Long orderId, BigDecimal quantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        BigDecimal available = material.getAvailableQuantity();
        if (available.compareTo(quantity) < 0) {
            throw new BusinessException("可用库存不足，可用数量: " + available);
        }

        LambdaUpdateWrapper<Material> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Material::getId, materialId)
                .setSql("locked_quantity = locked_quantity + " + quantity);
        materialMapper.update(null, wrapper);

        log.info("锁定原料成功: 原料ID={}, 工单ID={}, 数量={}", materialId, orderId, quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockMaterial(Long materialId, Long orderId, BigDecimal quantity) {
        Material material = materialMapper.selectById(materialId);
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        LambdaUpdateWrapper<Material> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Material::getId, materialId)
                .setSql("locked_quantity = GREATEST(locked_quantity - " + quantity + ", 0)");
        materialMapper.update(null, wrapper);

        log.info("解锁原料成功: 原料ID={}, 工单ID={}, 数量={}", materialId, orderId, quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void pickMaterial(MaterialOperationDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        BigDecimal available = material.getAvailableQuantity();
        if (available.compareTo(dto.getQuantity()) < 0) {
            throw new BusinessException("可用库存不足，可用数量: " + available);
        }

        LambdaUpdateWrapper<Material> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Material::getId, dto.getMaterialId())
                .setSql("quantity = quantity - " + dto.getQuantity())
                .setSql("locked_quantity = GREATEST(locked_quantity - " + dto.getQuantity() + ", 0)");
        materialMapper.update(null, wrapper);

        material = materialMapper.selectById(dto.getMaterialId());
        updateStockStatus(material);
        materialMapper.updateById(material);

        OrderMaterial orderMaterial = new OrderMaterial();
        orderMaterial.setOrderId(dto.getOrderId());
        orderMaterial.setOrderNo(order.getOrderNo());
        orderMaterial.setMaterialId(dto.getMaterialId());
        orderMaterial.setMaterialName(material.getMaterialName());
        orderMaterial.setMaterialCode(material.getMaterialCode());
        orderMaterial.setMaterialType(material.getMaterialType());
        orderMaterial.setBatchNo(material.getBatchNo());
        orderMaterial.setQuantity(dto.getQuantity());
        orderMaterial.setUnit(material.getUnit());
        orderMaterial.setUnitPrice(material.getUnitPrice());
        orderMaterial.setTotalPrice(dto.getQuantity().multiply(material.getUnitPrice()));
        orderMaterial.setOperationType(1);
        orderMaterial.setOperatorId(UserContext.getUserId());
        orderMaterial.setOperatorName(UserContext.getUsername());
        orderMaterial.setOperationTime(LocalDateTime.now());
        orderMaterial.setRemark(dto.getRemark());
        orderMaterialMapper.insert(orderMaterial);

        log.info("领料成功: 工单ID={}, 原料ID={}, 数量={}", dto.getOrderId(), dto.getMaterialId(), dto.getQuantity());
    }

    @Transactional(rollbackFor = Exception.class)
    public void returnMaterial(MaterialOperationDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        LambdaUpdateWrapper<Material> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Material::getId, dto.getMaterialId())
                .setSql("quantity = quantity + " + dto.getQuantity());
        materialMapper.update(null, wrapper);

        material = materialMapper.selectById(dto.getMaterialId());
        updateStockStatus(material);
        materialMapper.updateById(material);

        OrderMaterial orderMaterial = new OrderMaterial();
        orderMaterial.setOrderId(dto.getOrderId());
        orderMaterial.setOrderNo(order.getOrderNo());
        orderMaterial.setMaterialId(dto.getMaterialId());
        orderMaterial.setMaterialName(material.getMaterialName());
        orderMaterial.setMaterialCode(material.getMaterialCode());
        orderMaterial.setMaterialType(material.getMaterialType());
        orderMaterial.setBatchNo(material.getBatchNo());
        orderMaterial.setQuantity(dto.getQuantity());
        orderMaterial.setUnit(material.getUnit());
        orderMaterial.setUnitPrice(material.getUnitPrice());
        orderMaterial.setTotalPrice(dto.getQuantity().multiply(material.getUnitPrice()));
        orderMaterial.setOperationType(2);
        orderMaterial.setOperatorId(UserContext.getUserId());
        orderMaterial.setOperatorName(UserContext.getUsername());
        orderMaterial.setOperationTime(LocalDateTime.now());
        orderMaterial.setRemark(dto.getRemark());
        orderMaterialMapper.insert(orderMaterial);

        log.info("退料成功: 工单ID={}, 原料ID={}, 数量={}", dto.getOrderId(), dto.getMaterialId(), dto.getQuantity());
    }

    public List<OrderMaterial> getOrderMaterials(Long orderId) {
        LambdaQueryWrapper<OrderMaterial> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderMaterial::getOrderId, orderId)
                .orderByDesc(OrderMaterial::getOperationTime);
        return orderMaterialMapper.selectList(wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void scrapMaterial(MaterialOperationDTO dto) {
        Material material = materialMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        ProductionOrder order = productionOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException(ResultCodeEnum.DATA_NOT_EXISTS);
        }

        OrderMaterial orderMaterial = new OrderMaterial();
        orderMaterial.setOrderId(dto.getOrderId());
        orderMaterial.setOrderNo(order.getOrderNo());
        orderMaterial.setMaterialId(dto.getMaterialId());
        orderMaterial.setMaterialName(material.getMaterialName());
        orderMaterial.setMaterialCode(material.getMaterialCode());
        orderMaterial.setMaterialType(material.getMaterialType());
        orderMaterial.setBatchNo(material.getBatchNo());
        orderMaterial.setQuantity(dto.getQuantity());
        orderMaterial.setUnit(material.getUnit());
        orderMaterial.setUnitPrice(material.getUnitPrice());
        orderMaterial.setTotalPrice(dto.getQuantity().multiply(material.getUnitPrice()));
        orderMaterial.setOperationType(3);
        orderMaterial.setOperatorId(UserContext.getUserId());
        orderMaterial.setOperatorName(UserContext.getUsername());
        orderMaterial.setOperationTime(LocalDateTime.now());
        orderMaterial.setRemark(dto.getRemark());
        orderMaterialMapper.insert(orderMaterial);

        log.info("报废原料成功: 工单ID={}, 原料ID={}, 数量={}", dto.getOrderId(), dto.getMaterialId(), dto.getQuantity());
    }

    public void initMaterials() {
        LambdaQueryWrapper<Material> wrapper = new LambdaQueryWrapper<>();
        if (materialMapper.selectCount(wrapper) > 0) {
            return;
        }

        String[][] materials = {
                {"硅钢片", "SILICON_STEEL", "片", "1000", "50"},
                {"永磁体", "PERMANENT_MAGNET", "块", "500", "200"},
                {"转轴坯料", "SHAFT_BLANK", "根", "200", "150"},
                {"绝缘涂层辅料", "INSULATION_COATING", "kg", "300", "80"}
        };

        for (String[] m : materials) {
            Material material = new Material();
            material.setMaterialName(m[0]);
            material.setMaterialCode(m[1]);
            material.setMaterialType(m[1]);
            material.setUnit(m[2]);
            material.setQuantity(new BigDecimal(m[3]));
            material.setUnitPrice(new BigDecimal(m[4]));
            material.setLockedQuantity(BigDecimal.ZERO);
            material.setStockStatus(0);
            if ("PERMANENT_MAGNET".equals(m[1])) {
                material.setProductionDate(LocalDateTime.now());
                material.setExpiryDate(LocalDateTime.now().plusMonths(6));
                material.setStorageCondition("低温(-20℃~0℃)干燥保存");
            }
            material.setSupplier("默认供应商");
            addMaterial(material);
        }
    }
}