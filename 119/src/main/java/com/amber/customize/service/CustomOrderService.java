package com.amber.customize.service;

import com.amber.customize.dto.ConfirmThemeDTO;
import com.amber.customize.dto.CustomOrderCreateDTO;
import com.amber.customize.dto.CustomOrderQueryDTO;
import com.amber.customize.dto.UpdateCostDTO;
import com.amber.customize.entity.AmberRaw;
import com.amber.customize.entity.Category;
import com.amber.customize.entity.CustomOrder;
import com.amber.customize.entity.SysUser;
import com.amber.customize.enums.OrderStatusEnum;
import com.amber.customize.exception.BusinessException;
import com.amber.customize.mapper.CustomOrderMapper;
import com.amber.customize.util.BeanConvertUtil;
import com.amber.customize.util.UserContext;
import com.amber.customize.vo.CustomOrderVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOrderService extends ServiceImpl<CustomOrderMapper, CustomOrder> {

    private final CategoryService categoryService;
    private final AmberRawService amberRawService;
    private final SysUserService sysUserService;

    public Page<CustomOrderVO> page(int page, int size, CustomOrderQueryDTO queryDTO) {
        LambdaQueryWrapper<CustomOrder> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO != null) {
            if (queryDTO.getStatus() != null) {
                wrapper.eq(CustomOrder::getStatus, queryDTO.getStatus());
            }
            if (queryDTO.getCategoryId() != null) {
                wrapper.eq(CustomOrder::getCategoryId, queryDTO.getCategoryId());
            }
            if (queryDTO.getCarverId() != null) {
                wrapper.eq(CustomOrder::getCarverId, queryDTO.getCarverId());
            }
            if (queryDTO.getCustomerName() != null && !queryDTO.getCustomerName().isEmpty()) {
                wrapper.like(CustomOrder::getCustomerName, queryDTO.getCustomerName());
            }
            if (queryDTO.getCustomerPhone() != null && !queryDTO.getCustomerPhone().isEmpty()) {
                wrapper.like(CustomOrder::getCustomerPhone, queryDTO.getCustomerPhone());
            }
        }
        wrapper.orderByDesc(CustomOrder::getCreateTime);
        Page<CustomOrder> orderPage = page(new Page<>(page, size), wrapper);
        Page<CustomOrderVO> voPage = new Page<>(orderPage.getCurrent(), orderPage.getSize(), orderPage.getTotal());
        voPage.setRecords(orderPage.getRecords().stream().map(this::convertToVO).toList());
        return voPage;
    }

    public CustomOrderVO getDetail(Long id) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return convertToVO(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(CustomOrderCreateDTO dto) {
        if (!categoryService.isCategoryEnabled(dto.getCategoryId())) {
            throw new BusinessException("该雕件题材已下架，无法创建工单");
        }
        if (!amberRawService.isRawAvailable(dto.getRawId())) {
            throw new BusinessException("该原石状态不可用");
        }
        CustomOrder order = BeanConvertUtil.convert(dto, CustomOrder::new);
        order.setOrderNo("ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        order.setStatus(OrderStatusEnum.PENDING_CONFIRM.getCode());
        save(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmTheme(Long id, ConfirmThemeDTO dto) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (!OrderStatusEnum.PENDING_CONFIRM.getCode().equals(order.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }
        amberRawService.lockRaw(order.getRawId(), id);
        order.setThemeDescription(dto.getThemeDescription());
        order.setDrawingUrl(dto.getDrawingUrl());
        order.setStatus(OrderStatusEnum.DESIGN_DRAWING.getCode());
        order.setConfirmTime(LocalDateTime.now());
        updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void nextStatus(Long id) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        Integer currentStatus = order.getStatus();
        if (currentStatus >= OrderStatusEnum.COMPLETED.getCode()) {
            throw new BusinessException("工单已完成或已取消");
        }
        Integer nextStatus = currentStatus + 1;
        if (OrderStatusEnum.FINAL_INSPECTION.getCode().equals(nextStatus)) {
            order.setCarverId(UserContext.getUserId());
        }
        if (OrderStatusEnum.COMPLETED.getCode().equals(nextStatus)) {
            order.setCompleteTime(LocalDateTime.now());
            calculateTotalCost(order);
        }
        order.setStatus(nextStatus);
        updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void assignCarver(Long id, Long carverId) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        order.setCarverId(carverId);
        updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCosts(Long id, UpdateCostDTO dto) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        order.setRawCost(dto.getRawCost());
        order.setMaterialCost(dto.getMaterialCost());
        order.setLaborCost(dto.getLaborCost());
        order.setPolishingCost(dto.getPolishingCost());
        order.setOtherCost(dto.getOtherCost());
        order.setCarvingHours(dto.getCarvingHours());
        order.setTotalPrice(dto.getTotalPrice());
        calculateTotalCost(order);
        updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id) {
        CustomOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() >= OrderStatusEnum.FINE_CARVING.getCode()) {
            throw new BusinessException("工单已进入雕琢阶段，无法取消");
        }
        amberRawService.unlockRaw(order.getRawId());
        order.setStatus(OrderStatusEnum.CANCELLED.getCode());
        updateById(order);
    }

    public void expirePendingOrders() {
        LocalDateTime expireTime = LocalDateTime.now().minusDays(7);
        List<CustomOrder> expiredOrders = list(new LambdaQueryWrapper<CustomOrder>()
                .eq(CustomOrder::getStatus, OrderStatusEnum.PENDING_CONFIRM.getCode())
                .le(CustomOrder::getCreateTime, expireTime));
        for (CustomOrder order : expiredOrders) {
            amberRawService.unlockRaw(order.getRawId());
            order.setStatus(OrderStatusEnum.EXPIRED.getCode());
        }
        updateBatchById(expiredOrders);
    }

    private void calculateTotalCost(CustomOrder order) {
        BigDecimal totalCost = BigDecimal.ZERO;
        if (order.getRawCost() != null) {
            totalCost = totalCost.add(order.getRawCost());
        }
        if (order.getMaterialCost() != null) {
            totalCost = totalCost.add(order.getMaterialCost());
        }
        if (order.getLaborCost() != null) {
            totalCost = totalCost.add(order.getLaborCost());
        }
        if (order.getPolishingCost() != null) {
            totalCost = totalCost.add(order.getPolishingCost());
        }
        if (order.getOtherCost() != null) {
            totalCost = totalCost.add(order.getOtherCost());
        }
        order.setTotalCost(totalCost);
        if (order.getTotalPrice() != null) {
            order.setProfit(order.getTotalPrice().subtract(totalCost));
        }
    }

    private CustomOrderVO convertToVO(CustomOrder order) {
        CustomOrderVO vo = BeanConvertUtil.convert(order, CustomOrderVO::new);
        vo.setStatusDesc(OrderStatusEnum.getDescByCode(order.getStatus()));
        if (order.getCategoryId() != null) {
            Category category = categoryService.getById(order.getCategoryId());
            if (category != null) {
                vo.setCategoryName(category.getName());
            }
        }
        if (order.getRawId() != null) {
            AmberRaw raw = amberRawService.getById(order.getRawId());
            if (raw != null) {
                vo.setTraceCode(raw.getTraceCode());
            }
        }
        if (order.getCarverId() != null) {
            SysUser carver = sysUserService.getById(order.getCarverId());
            if (carver != null) {
                vo.setCarverName(carver.getRealName());
            }
        }
        return vo;
    }

}
