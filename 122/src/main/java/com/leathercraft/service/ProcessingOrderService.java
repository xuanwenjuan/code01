package com.leathercraft.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leathercraft.context.UserContext;
import com.leathercraft.dto.*;
import com.leathercraft.entity.OrderMaterial;
import com.leathercraft.entity.ProcessingOrder;
import com.leathercraft.entity.ProductCategory;
import com.leathercraft.entity.SysUser;
import com.leathercraft.enums.OrderStatusEnum;
import com.leathercraft.exception.BusinessException;
import com.leathercraft.mapper.OrderMaterialMapper;
import com.leathercraft.mapper.ProcessingOrderMapper;
import com.leathercraft.mapper.SysUserMapper;
import com.leathercraft.vo.OrderMaterialVO;
import com.leathercraft.vo.ProcessingOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcessingOrderService {

    private final ProcessingOrderMapper processingOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final MaterialInventoryService materialInventoryService;
    private final ProductCategoryService productCategoryService;
    private final ProfitLedgerService profitLedgerService;
    private final SysUserMapper sysUserMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String ORDER_CACHE_PREFIX = "order:";

    private String generateOrderNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomStr = String.format("%04d", new Random().nextInt(10000));
        return "PO-" + dateStr + "-" + randomStr;
    }

    private ProcessingOrderVO convertToVO(ProcessingOrder order) {
        ProcessingOrderVO vo = new ProcessingOrderVO();
        BeanUtils.copyProperties(order, vo);
        vo.setStatusName(OrderStatusEnum.getDescByCode(order.getStatus()));

        if (order.getSoftenStartTime() != null && order.getSoftenEndTime() != null) {
            vo.setSoftenDuration(ChronoUnit.MINUTES.between(order.getSoftenStartTime(), order.getSoftenEndTime()));
        }
        if (order.getTanningStartTime() != null && order.getTanningEndTime() != null) {
            vo.setTanningDuration(ChronoUnit.MINUTES.between(order.getTanningStartTime(), order.getTanningEndTime()));
        }
        if (order.getDryingStartTime() != null && order.getDryingEndTime() != null) {
            vo.setDryingDuration(ChronoUnit.MINUTES.between(order.getDryingStartTime(), order.getDryingEndTime()));
        }
        if (order.getColoringStartTime() != null && order.getColoringEndTime() != null) {
            vo.setColoringDuration(ChronoUnit.MINUTES.between(order.getColoringStartTime(), order.getColoringEndTime()));
        }
        if (order.getCuttingStartTime() != null && order.getCuttingEndTime() != null) {
            vo.setCuttingDuration(ChronoUnit.MINUTES.between(order.getCuttingStartTime(), order.getCuttingEndTime()));
        }
        if (order.getQcStartTime() != null && order.getQcEndTime() != null) {
            vo.setQcDuration(ChronoUnit.MINUTES.between(order.getQcStartTime(), order.getQcEndTime()));
        }
        if (order.getCreateTime() != null && order.getActualFinishTime() != null) {
            vo.setTotalDuration(ChronoUnit.HOURS.between(order.getCreateTime(), order.getActualFinishTime()));
        }

        if (order.getProductCategoryId() != null) {
            ProductCategory category = productCategoryService.getCategoryById(order.getProductCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getCategoryName());
            }
        }

        if (order.getTannerId() != null) {
            SysUser tanner = sysUserMapper.selectById(order.getTannerId());
            if (tanner != null) {
                vo.setTannerName(tanner.getRealName());
            }
        }

        if (order.getCutterId() != null) {
            SysUser cutter = sysUserMapper.selectById(order.getCutterId());
            if (cutter != null) {
                vo.setCutterName(cutter.getRealName());
            }
        }

        return vo;
    }

    private OrderMaterialVO convertToMaterialVO(OrderMaterial material) {
        OrderMaterialVO vo = new OrderMaterialVO();
        BeanUtils.copyProperties(material, vo);
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(ProcessingOrderDTO dto) {
        if (productCategoryService.isCategoryStopped(dto.getProductCategoryId())) {
            throw new BusinessException("该款式已下架，无法创建工单");
        }

        ProcessingOrder order = new ProcessingOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(generateOrderNo());
        order.setStatus(OrderStatusEnum.PENDING.getCode());
        processingOrderMapper.insert(order);
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startSoftening(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.PENDING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确，当前状态：" + OrderStatusEnum.getDescByCode(order.getStatus()));
        }

        Long userId = UserContext.getUserId();
        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.SOFTENING.getCode())
                        .set(ProcessingOrder::getTannerId, userId)
                        .set(ProcessingOrder::getSoftenStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishSoftening(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.SOFTENING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.SOFTENING_FINISHED.getCode())
                        .set(ProcessingOrder::getSoftenEndTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startTanning(Long id, OrderProcessDTO dto) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.SOFTENING_FINISHED.getCode().equals(order.getStatus()) &&
                !OrderStatusEnum.SUSPENDED.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (MaterialUsageDTO material : dto.getMaterials()) {
                materialInventoryService.lockStock(material.getMaterialId(), material.getQuantity(), id);
            }
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.TANNING.getCode())
                        .set(ProcessingOrder::getTanningStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishTanning(Long id, OrderProcessDTO dto) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.TANNING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (MaterialUsageDTO material : dto.getMaterials()) {
                materialInventoryService.deductStock(material.getMaterialId(), material.getQuantity(), id);
                addOrderMaterial(id, material);
            }
        }

        if (dto.getLaborCost() != null) {
            processingOrderMapper.update(
                    new LambdaUpdateWrapper<ProcessingOrder>()
                            .eq(ProcessingOrder::getId, id)
                            .setSql("labor_cost = COALESCE(labor_cost, 0) + " + dto.getLaborCost())
            );
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.TANNING_FINISHED.getCode())
                        .set(ProcessingOrder::getTanningEndTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startDrying(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.TANNING_FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.DRYING.getCode())
                        .set(ProcessingOrder::getDryingStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishDrying(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.DRYING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.DRYING_FINISHED.getCode())
                        .set(ProcessingOrder::getDryingEndTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startColoring(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.DRYING_FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.COLORING.getCode())
                        .set(ProcessingOrder::getColoringStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishColoring(Long id, OrderProcessDTO dto) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.COLORING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (MaterialUsageDTO material : dto.getMaterials()) {
                materialInventoryService.lockStock(material.getMaterialId(), material.getQuantity(), id);
                materialInventoryService.deductStock(material.getMaterialId(), material.getQuantity(), id);
                addOrderMaterial(id, material);
            }
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.COLORING_FINISHED.getCode())
                        .set(ProcessingOrder::getColoringEndTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startCutting(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.COLORING_FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        Long userId = UserContext.getUserId();
        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.CUTTING.getCode())
                        .set(ProcessingOrder::getCutterId, userId)
                        .set(ProcessingOrder::getCuttingStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishCutting(Long id, OrderProcessDTO dto) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.CUTTING.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            for (MaterialUsageDTO material : dto.getMaterials()) {
                materialInventoryService.lockStock(material.getMaterialId(), material.getQuantity(), id);
                materialInventoryService.deductStock(material.getMaterialId(), material.getQuantity(), id);
                addOrderMaterial(id, material);
            }
        }

        if (dto.getLaborCost() != null) {
            processingOrderMapper.update(
                    new LambdaUpdateWrapper<ProcessingOrder>()
                            .eq(ProcessingOrder::getId, id)
                            .setSql("labor_cost = COALESCE(labor_cost, 0) + " + dto.getLaborCost())
            );
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.CUTTING_FINISHED.getCode())
                        .set(ProcessingOrder::getCuttingEndTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void startQc(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.CUTTING_FINISHED.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.QC.getCode())
                        .set(ProcessingOrder::getQcStartTime, LocalDateTime.now())
        );
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void finishQc(OrderCompleteDTO dto) {
        ProcessingOrder order = processingOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.QC.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }

        if (dto.getPassed()) {
            BigDecimal leatherCost = dto.getLeatherCost() != null ? dto.getLeatherCost() :
                    (order.getLeatherCost() != null ? order.getLeatherCost() : BigDecimal.ZERO);
            BigDecimal materialCost = dto.getMaterialCost() != null ? dto.getMaterialCost() :
                    (order.getMaterialCost() != null ? order.getMaterialCost() : BigDecimal.ZERO);
            BigDecimal laborCost = dto.getLaborCost() != null ? dto.getLaborCost() :
                    (order.getLaborCost() != null ? order.getLaborCost() : BigDecimal.ZERO);
            BigDecimal lossCost = dto.getLossCost() != null ? dto.getLossCost() :
                    (order.getLossCost() != null ? order.getLossCost() : BigDecimal.ZERO);

            BigDecimal totalCost = leatherCost.add(materialCost).add(laborCost).add(lossCost);

            processingOrderMapper.update(
                    new LambdaUpdateWrapper<ProcessingOrder>()
                            .eq(ProcessingOrder::getId, dto.getOrderId())
                            .set(ProcessingOrder::getStatus, OrderStatusEnum.FINISHED.getCode())
                            .set(ProcessingOrder::getQcEndTime, LocalDateTime.now())
                            .set(ProcessingOrder::getActualFinishTime, LocalDateTime.now())
                            .set(ProcessingOrder::getActualQuantity, dto.getActualQuantity() != null ? dto.getActualQuantity() : order.getQuantity())
                            .set(ProcessingOrder::getLossQuantity, dto.getLossQuantity())
                            .set(ProcessingOrder::getLeatherCost, leatherCost)
                            .set(ProcessingOrder::getMaterialCost, materialCost)
                            .set(ProcessingOrder::getLaborCost, laborCost)
                            .set(ProcessingOrder::getLossCost, lossCost)
                            .set(ProcessingOrder::getTotalCost, totalCost)
            );

            createProfitLedger(dto.getOrderId());
        } else {
            processingOrderMapper.update(
                    new LambdaUpdateWrapper<ProcessingOrder>()
                            .eq(ProcessingOrder::getId, dto.getOrderId())
                            .set(ProcessingOrder::getStatus, OrderStatusEnum.TANNING.getCode())
                            .set(ProcessingOrder::getQcEndTime, LocalDateTime.now())
            );
        }
        clearOrderCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id) {
        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (OrderStatusEnum.FINISHED.getCode().equals(order.getStatus()) ||
                OrderStatusEnum.CANCELLED.getCode().equals(order.getStatus())) {
            throw new BusinessException("该工单状态不允许取消");
        }

        List<OrderMaterial> materials = getOrderMaterialsEntity(id);
        for (OrderMaterial material : materials) {
            materialInventoryService.unlockStock(material.getMaterialId(), material.getQuantity(), id);
        }

        processingOrderMapper.update(
                new LambdaUpdateWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getId, id)
                        .set(ProcessingOrder::getStatus, OrderStatusEnum.CANCELLED.getCode())
        );
        clearOrderCache();
    }

    private void addOrderMaterial(Long orderId, MaterialUsageDTO dto) {
        OrderMaterial orderMaterial = new OrderMaterial();
        orderMaterial.setOrderId(orderId);
        orderMaterial.setMaterialId(dto.getMaterialId());
        orderMaterial.setQuantity(dto.getQuantity());
        orderMaterialMapper.insert(orderMaterial);
    }

    private void createProfitLedger(Long orderId) {
        ProcessingOrder order = processingOrderMapper.selectById(orderId);
        if (order == null) {
            return;
        }

        ProfitLedgerDTO ledgerDTO = new ProfitLedgerDTO();
        ledgerDTO.setProductCategoryId(order.getProductCategoryId());
        ledgerDTO.setQuantity(order.getActualQuantity() != null ?
                order.getActualQuantity().intValue() : order.getQuantity().intValue());
        ledgerDTO.setLeatherCost(order.getLeatherCost() != null ? order.getLeatherCost() : BigDecimal.ZERO);
        ledgerDTO.setMaterialCost(order.getMaterialCost() != null ? order.getMaterialCost() : BigDecimal.ZERO);
        ledgerDTO.setLaborCost(order.getLaborCost() != null ? order.getLaborCost() : BigDecimal.ZERO);
        ledgerDTO.setStatDate(LocalDate.now());

        profitLedgerService.create(ledgerDTO);
    }

    public List<ProcessingOrderVO> list(ProcessingOrderQueryDTO query) {
        LambdaQueryWrapper<ProcessingOrder> wrapper = new LambdaQueryWrapper<>();

        if (query.getOrderNo() != null && !query.getOrderNo().isEmpty()) {
            wrapper.like(ProcessingOrder::getOrderNo, query.getOrderNo());
        }
        if (query.getStatus() != null && !query.getStatus().isEmpty()) {
            wrapper.eq(ProcessingOrder::getStatus, query.getStatus());
        }
        if (query.getProductCategoryId() != null) {
            wrapper.eq(ProcessingOrder::getProductCategoryId, query.getProductCategoryId());
        }
        if (query.getTannerId() != null) {
            wrapper.eq(ProcessingOrder::getTannerId, query.getTannerId());
        }
        if (query.getCutterId() != null) {
            wrapper.eq(ProcessingOrder::getCutterId, query.getCutterId());
        }
        if (query.getCreateStartTime() != null) {
            wrapper.ge(ProcessingOrder::getCreateTime, query.getCreateStartTime());
        }
        if (query.getCreateEndTime() != null) {
            wrapper.le(ProcessingOrder::getCreateTime, query.getCreateEndTime());
        }

        wrapper.orderByDesc(ProcessingOrder::getCreateTime);
        List<ProcessingOrder> list = processingOrderMapper.selectList(wrapper);
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    public ProcessingOrderVO getById(Long id) {
        String cacheKey = ORDER_CACHE_PREFIX + id;
        try {
            String cacheData = redisTemplate.opsForValue().get(cacheKey);
            if (cacheData != null) {
                return objectMapper.readValue(cacheData, ProcessingOrderVO.class);
            }
        } catch (Exception e) {
        }

        ProcessingOrder order = processingOrderMapper.selectById(id);
        if (order == null) {
            return null;
        }

        ProcessingOrderVO vo = convertToVO(order);
        vo.setMaterials(getOrderMaterials(id));
        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(vo), 30, TimeUnit.MINUTES);
        } catch (Exception e) {
        }

        return vo;
    }

    public List<OrderMaterial> getOrderMaterialsEntity(Long orderId) {
        return orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>()
                        .eq(OrderMaterial::getOrderId, orderId)
                        .orderByDesc(OrderMaterial::getCreateTime)
        );
    }

    public List<OrderMaterialVO> getOrderMaterials(Long orderId) {
        List<OrderMaterial> materials = getOrderMaterialsEntity(orderId);
        return materials.stream().map(this::convertToMaterialVO).collect(Collectors.toList());
    }

    public Map<String, BigDecimal> getMaterialCost(Long orderId) {
        List<OrderMaterialVO> materials = getOrderMaterials(orderId);
        BigDecimal totalMaterialCost = materials.stream()
                .map(m -> {
                    if (m.getUnitPrice() != null && m.getQuantity() != null) {
                        return m.getUnitPrice().multiply(m.getQuantity());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return Map.of(
                "totalMaterialCost", totalMaterialCost,
                "materialCount", new BigDecimal(materials.size())
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void suspendTimeoutOrders() {
        LocalDateTime timeoutThreshold = LocalDateTime.now().minusHours(24);
        List<ProcessingOrder> timeoutOrders = processingOrderMapper.selectList(
                new LambdaQueryWrapper<ProcessingOrder>()
                        .eq(ProcessingOrder::getStatus, OrderStatusEnum.SOFTENING_FINISHED.getCode())
                        .lt(ProcessingOrder::getSoftenEndTime, timeoutThreshold)
        );

        for (ProcessingOrder order : timeoutOrders) {
            processingOrderMapper.update(
                    new LambdaUpdateWrapper<ProcessingOrder>()
                            .eq(ProcessingOrder::getId, order.getId())
                            .set(ProcessingOrder::getStatus, OrderStatusEnum.SUSPENDED.getCode())
            );
            clearOrderCache();
        }
    }

    private void clearOrderCache() {
        redisTemplate.delete(redisTemplate.keys(ORDER_CACHE_PREFIX + "*"));
    }
}
