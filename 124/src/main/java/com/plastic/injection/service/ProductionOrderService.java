package com.plastic.injection.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.OperationLog;
import com.plastic.injection.common.ResultCode;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.dto.OrderMaterialDTO;
import com.plastic.injection.dto.ProductionOrderDTO;
import com.plastic.injection.enums.OrderStatusEnum;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.mapper.OrderMaterialMapper;
import com.plastic.injection.mapper.ProductionOrderMapper;
import com.plastic.injection.po.OrderMaterialPO;
import com.plastic.injection.po.ProductionOrderPO;
import com.plastic.injection.vo.OrderMaterialVO;
import com.plastic.injection.vo.ProductionOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionOrderService {

    private final ProductionOrderMapper productionOrderMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final MaterialStockService materialStockService;
    private final ProductCategoryService productCategoryService;

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "创建工单")
    public String createOrder(ProductionOrderDTO dto) {
        if (!productCategoryService.isCategoryAvailable(dto.getCategoryId())) {
            throw new BusinessException(ResultCode.CATEGORY_DISABLED.getCode(), "产品类目已下架，无法创建工单");
        }

        String operator = UserContext.getUsername();
        String orderNo = "PO" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        ProductionOrderPO order = new ProductionOrderPO();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo(orderNo);
        order.setOrderStatus(OrderStatusEnum.PENDING.getCode());
        order.setActualQuantity(BigDecimal.ZERO);
        order.setDefectiveQuantity(BigDecimal.ZERO);
        order.setMaterialCost(BigDecimal.ZERO);
        order.setMachineCost(BigDecimal.ZERO);
        order.setLaborCost(BigDecimal.ZERO);
        order.setDefectiveCost(BigDecimal.ZERO);
        order.setEnergyCost(BigDecimal.ZERO);
        order.setMaintenanceCost(BigDecimal.ZERO);
        order.setOtherCost(BigDecimal.ZERO);
        order.setTotalCost(BigDecimal.ZERO);
        order.setIsDelayed(0);
        order.setIsLocked(0);
        order.setCreateBy(operator);
        order.setUpdateBy(operator);

        productionOrderMapper.insert(order);

        if (dto.getMaterials() != null && !dto.getMaterials().isEmpty()) {
            List<OrderMaterialPO> materialList = new ArrayList<>();
            for (OrderMaterialDTO materialDTO : dto.getMaterials()) {
                OrderMaterialPO material = new OrderMaterialPO();
                BeanUtils.copyProperties(materialDTO, material);
                material.setOrderId(order.getId());
                material.setWasteQuantity(BigDecimal.ZERO);
                material.setTotalCost(material.getUnitPrice() != null
                        ? material.getPlanQuantity().multiply(material.getUnitPrice())
                        : BigDecimal.ZERO);
                material.setIsLocked(0);
                material.setCreateBy(operator);
                material.setUpdateBy(operator);
                materialList.add(material);
            }
            orderMaterialMapper.batchInsert(materialList);
        }

        return orderNo;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "工单投产")
    public void startProduction(Long orderId) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }
        if (!OrderStatusEnum.PENDING.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单状态不正确，无法投产");
        }

        String operator = UserContext.getUsername();
        List<OrderMaterialPO> materials = orderMaterialMapper.selectByOrderId(orderId);

        for (OrderMaterialPO material : materials) {
            materialStockService.lockStock(material.getMaterialId(), material.getPlanQuantity());
            material.setIsLocked(1);
            material.setUpdateBy(operator);
            orderMaterialMapper.updateById(material);
        }

        order.setOrderStatus(OrderStatusEnum.DRYING.getCode());
        order.setActualStartTime(LocalDateTime.now());
        order.setIsLocked(1);
        order.setLockTime(LocalDateTime.now());
        order.setUpdateBy(operator);
        productionOrderMapper.updateById(order);
    }

    public Page<ProductionOrderVO> pageQuery(Integer pageNum, Integer pageSize, String orderNo,
                                              String productName, Long categoryId, Integer orderStatus,
                                              Long technicianId) {
        Page<ProductionOrderPO> page = new Page<>(pageNum, pageSize);
        Page<ProductionOrderPO> resultPage = productionOrderMapper.selectByConditions(
                page, orderNo, productName, categoryId, orderStatus, technicianId);

        Page<ProductionOrderVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        List<ProductionOrderVO> voList = resultPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    public ProductionOrderVO getDetailById(Long id) {
        ProductionOrderPO order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }

        ProductionOrderVO vo = convertToVO(order);
        List<OrderMaterialPO> materials = orderMaterialMapper.selectByOrderId(id);
        vo.setMaterials(materials.stream()
                .map(this::convertMaterialToVO)
                .collect(Collectors.toList()));

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "工序流转")
    public void nextProcess(Long orderId) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }

        Integer currentStatus = order.getOrderStatus();
        if (currentStatus >= OrderStatusEnum.FINISHED.getCode()) {
            throw new BusinessException(ResultCode.ORDER_ALREADY_FINISHED);
        }

        Integer nextStatus = currentStatus + 1;
        String operator = UserContext.getUsername();

        order.setOrderStatus(nextStatus);
        order.setUpdateBy(operator);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "工单质检完成")
    public void qualityCheckComplete(Long orderId, BigDecimal actualQuantity, BigDecimal defectiveQuantity) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }
        if (!OrderStatusEnum.QUALITY_CHECK.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单不在质检状态");
        }

        String operator = UserContext.getUsername();
        List<OrderMaterialPO> materials = orderMaterialMapper.selectByOrderId(orderId);

        for (OrderMaterialPO material : materials) {
            materialStockService.unlockAndConsumeStock(
                    material.getMaterialId(),
                    material.getPlanQuantity(),
                    material.getActualQuantity() != null ? material.getActualQuantity() : material.getPlanQuantity()
            );

            BigDecimal wasteQty = material.getPlanQuantity().subtract(
                    material.getActualQuantity() != null ? material.getActualQuantity() : material.getPlanQuantity()
            );
            material.setWasteQuantity(wasteQty.compareTo(BigDecimal.ZERO) > 0 ? wasteQty : BigDecimal.ZERO);
            material.setIsLocked(0);
            material.setUpdateBy(operator);
            orderMaterialMapper.updateById(material);
        }

        order.setActualQuantity(actualQuantity);
        order.setDefectiveQuantity(defectiveQuantity);
        order.setOrderStatus(OrderStatusEnum.FINISHED.getCode());
        order.setActualEndTime(LocalDateTime.now());
        order.setIsLocked(0);
        order.setUpdateBy(operator);
        productionOrderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "更新工单原料用量")
    public void updateMaterialUsage(Long orderId, List<OrderMaterialDTO> materials) {
        String operator = UserContext.getUsername();
        for (OrderMaterialDTO dto : materials) {
            OrderMaterialPO po = orderMaterialMapper.selectById(dto.getId());
            if (po != null && po.getOrderId().equals(orderId)) {
                po.setActualQuantity(dto.getActualQuantity());
                po.setTotalCost(dto.getActualQuantity() != null && po.getUnitPrice() != null
                        ? dto.getActualQuantity().multiply(po.getUnitPrice())
                        : BigDecimal.ZERO);
                po.setUpdateBy(operator);
                orderMaterialMapper.updateById(po);
            }
        }
    }

    private ProductionOrderVO convertToVO(ProductionOrderPO po) {
        ProductionOrderVO vo = new ProductionOrderVO();
        BeanUtils.copyProperties(po, vo);

        OrderStatusEnum statusEnum = OrderStatusEnum.getByCode(po.getOrderStatus());
        if (statusEnum != null) {
            vo.setOrderStatusDesc(statusEnum.getDesc());
        }

        return vo;
    }

    private OrderMaterialVO convertMaterialToVO(OrderMaterialPO po) {
        OrderMaterialVO vo = new OrderMaterialVO();
        BeanUtils.copyProperties(po, vo);
        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "取消工单")
    public void cancelOrder(Long orderId) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }
        if (OrderStatusEnum.FINISHED.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.ORDER_ALREADY_FINISHED);
        }

        if (order.getIsLocked() != null && order.getIsLocked() == 1) {
            String operator = UserContext.getUsername();
            List<OrderMaterialPO> materials = orderMaterialMapper.selectByOrderId(orderId);
            for (OrderMaterialPO material : materials) {
                materialStockService.unlockStock(material.getMaterialId(), material.getPlanQuantity(), operator);
            }
        }

        productionOrderMapper.deleteById(orderId);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "生产工单", description = "更新工单信息")
    public void updateOrder(Long orderId, ProductionOrderDTO dto) {
        ProductionOrderPO order = productionOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(ResultCode.ORDER_NOT_FOUND);
        }
        if (!OrderStatusEnum.PENDING.getCode().equals(order.getOrderStatus())) {
            throw new BusinessException(ResultCode.ORDER_STATUS_ERROR.getCode(), "工单已投产，无法修改");
        }

        if (dto.getCategoryId() != null && !dto.getCategoryId().equals(order.getCategoryId())) {
            if (!productCategoryService.isCategoryAvailable(dto.getCategoryId())) {
                throw new BusinessException(ResultCode.CATEGORY_DISABLED);
            }
        }

        String operator = UserContext.getUsername();
        BeanUtils.copyProperties(dto, order);
        order.setUpdateBy(operator);
        productionOrderMapper.updateById(order);
    }
}
