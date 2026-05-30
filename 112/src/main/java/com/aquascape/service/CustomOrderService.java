package com.aquascape.service;

import com.aquascape.common.OrderStatus;
import com.aquascape.dto.CustomOrderDTO;
import com.aquascape.entity.CustomOrder;
import com.aquascape.entity.FinanceRecord;
import com.aquascape.entity.MaterialStock;
import com.aquascape.entity.OrderMaterial;
import com.aquascape.exception.BusinessException;
import com.aquascape.mapper.CustomOrderMapper;
import com.aquascape.mapper.MaterialStockMapper;
import com.aquascape.mapper.OrderMaterialMapper;
import com.aquascape.vo.CustomOrderVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomOrderService {

    @Autowired
    private CustomOrderMapper orderMapper;

    @Autowired
    private OrderMaterialMapper orderMaterialMapper;

    @Autowired
    private MaterialStockMapper stockMapper;

    @Autowired
    private MaterialStockService stockService;

    @Autowired
    private FinanceService financeService;

    public Page<CustomOrderVO> page(int page, int size, String customerName, Integer orderStatus, Long scaperId) {
        LambdaQueryWrapper<CustomOrder> wrapper = new LambdaQueryWrapper<>();
        if (customerName != null && !customerName.isEmpty()) {
            wrapper.like(CustomOrder::getCustomerName, customerName);
        }
        if (orderStatus != null) {
            wrapper.eq(CustomOrder::getOrderStatus, orderStatus);
        }
        if (scaperId != null) {
            wrapper.eq(CustomOrder::getScaperId, scaperId);
        }
        wrapper.orderByDesc(CustomOrder::getCreateTime);

        Page<CustomOrder> pageResult = orderMapper.selectPage(new Page<>(page, size), wrapper);
        Page<CustomOrderVO> voPage = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());

        List<CustomOrderVO> voList = pageResult.getRecords().stream().map(order -> {
            CustomOrderVO vo = convertToVO(order);
            vo.setOrderStatusName(OrderStatus.getStatusName(order.getOrderStatus()));
            return vo;
        }).toList();

        voPage.setRecords(voList);
        return voPage;
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(CustomOrderDTO dto) {
        CustomOrder order = new CustomOrder();
        BeanUtils.copyProperties(dto, order);
        order.setOrderNo("ORDER-" + IdUtil.getSnowflakeNextIdStr());
        order.setOrderStatus(OrderStatus.PENDING_CONFIRM);
        order.setStockLocked(0);

        BigDecimal materialCost = BigDecimal.ZERO;
        if (dto.getOrderMaterials() != null && !dto.getOrderMaterials().isEmpty()) {
            for (var materialDTO : dto.getOrderMaterials()) {
                if (materialDTO.getUnitPrice() != null && materialDTO.getQuantity() != null) {
                    materialCost = materialCost.add(
                            materialDTO.getUnitPrice().multiply(BigDecimal.valueOf(materialDTO.getQuantity()))
                    );
                }
            }
        }
        order.setMaterialCost(materialCost);
        if (order.getLaborCost() == null) {
            order.setLaborCost(BigDecimal.ZERO);
        }
        if (order.getTotalPrice() == null || order.getTotalPrice().compareTo(BigDecimal.ZERO) == 0) {
            order.setTotalPrice(materialCost.add(order.getLaborCost()));
        }
        order.setLossCost(BigDecimal.ZERO);
        order.setProfit(order.getTotalPrice().subtract(materialCost).subtract(order.getLaborCost()));

        orderMapper.insert(order);

        if (dto.getOrderMaterials() != null && !dto.getOrderMaterials().isEmpty()) {
            for (var materialDTO : dto.getOrderMaterials()) {
                OrderMaterial material = new OrderMaterial();
                BeanUtils.copyProperties(materialDTO, material);
                material.setOrderId(order.getId());

                if (material.getUnitPrice() != null && material.getQuantity() != null) {
                    material.setTotalPrice(material.getUnitPrice().multiply(BigDecimal.valueOf(material.getQuantity())));
                }
                if (material.getLossRate() == null) {
                    material.setLossRate(BigDecimal.valueOf(5));
                }
                if (material.getLossRate() != null && material.getQuantity() != null) {
                    BigDecimal lossQty = BigDecimal.valueOf(material.getQuantity())
                            .multiply(material.getLossRate())
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    material.setLossQuantity(lossQty);
                    if (material.getUnitPrice() != null) {
                        material.setLossAmount(lossQty.multiply(material.getUnitPrice()));
                    }
                }

                orderMaterialMapper.insert(material);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, CustomOrderDTO dto) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() >= OrderStatus.BUILDING) {
            throw new BusinessException("工单已开始搭建，无法修改");
        }

        BeanUtils.copyProperties(dto, order, "id", "orderNo", "orderStatus", "createTime", "stockLocked");
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmScheme(Long id, String designScheme) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING_CONFIRM) {
            throw new BusinessException("只有待确认的工单才能确认方案");
        }
        if (order.getStockLocked() != null && order.getStockLocked() == 1) {
            throw new BusinessException("库存已锁定，无需重复操作");
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
        );

        for (OrderMaterial material : materials) {
            MaterialStock stock = stockMapper.selectById(material.getStockId());
            if (stock == null) {
                throw new BusinessException("素材不存在: " + material.getMaterialName());
            }
            if (stock.getQuantity() < material.getQuantity()) {
                throw new BusinessException("素材库存不足: " + material.getMaterialName());
            }
        }

        for (OrderMaterial material : materials) {
            stockService.lockStock(material.getStockId(), material.getQuantity());
        }

        order.setOrderStatus(OrderStatus.SCHEME_CONFIRMED);
        order.setSchemeConfirmTime(LocalDateTime.now());
        if (designScheme != null && !designScheme.isEmpty()) {
            order.setDesignScheme(designScheme);
        }
        order.setStockLocked(1);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void startBuild(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != OrderStatus.SCHEME_CONFIRMED) {
            throw new BusinessException("只有已确认方案的工单才能开始搭建");
        }

        order.setOrderStatus(OrderStatus.BUILDING);
        order.setBuildStartTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeBuild(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != OrderStatus.BUILDING) {
            throw new BusinessException("只有搭建中的工单才能完成");
        }

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
        );

        BigDecimal totalLossCost = BigDecimal.ZERO;
        BigDecimal totalMaterialCost = BigDecimal.ZERO;

        for (OrderMaterial material : materials) {
            if (material.getLossAmount() != null) {
                totalLossCost = totalLossCost.add(material.getLossAmount());
            }
            if (material.getTotalPrice() != null) {
                totalMaterialCost = totalMaterialCost.add(material.getTotalPrice());
            }

            if (material.getLossQuantity() != null && material.getLossQuantity().compareTo(BigDecimal.ZERO) > 0) {
                FinanceRecord lossRecord = new FinanceRecord();
                lossRecord.setRecordNo("LOSS-" + IdUtil.getSnowflakeNextIdStr());
                lossRecord.setRecordType(3);
                lossRecord.setCategoryId(material.getStockId());
                lossRecord.setCategoryName(material.getMaterialName() + "损耗");
                lossRecord.setAmount(material.getLossAmount() != null ? material.getLossAmount() : BigDecimal.ZERO);
                lossRecord.setRelatedOrderId(id);
                lossRecord.setRecordDate(LocalDate.now());
                lossRecord.setRemark("造景工单搭建损耗");
                financeService.addRecord(lossRecord);
            }
        }

        order.setOrderStatus(OrderStatus.COMPLETED);
        order.setBuildEndTime(LocalDateTime.now());
        order.setMaterialCost(totalMaterialCost);
        order.setLossCost(totalLossCost);
        if (order.getLaborCost() == null) {
            order.setLaborCost(BigDecimal.ZERO);
        }
        order.setProfit(order.getTotalPrice()
                .subtract(totalMaterialCost)
                .subtract(order.getLaborCost())
                .subtract(totalLossCost));
        orderMapper.updateById(order);

        FinanceRecord incomeRecord = new FinanceRecord();
        incomeRecord.setRecordNo("INC-" + IdUtil.getSnowflakeNextIdStr());
        incomeRecord.setRecordType(2);
        incomeRecord.setCategoryName("造景服务收入");
        incomeRecord.setAmount(order.getTotalPrice());
        incomeRecord.setRelatedOrderId(id);
        incomeRecord.setRelatedOrderNo(order.getOrderNo());
        incomeRecord.setRecordDate(LocalDate.now());
        incomeRecord.setRemark("造景工单完工收入");
        financeService.addRecord(incomeRecord);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deliver(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() != OrderStatus.COMPLETED) {
            throw new BusinessException("只有已完成的工单才能交付");
        }

        order.setOrderStatus(OrderStatus.DELIVERED);
        order.setDeliverTime(LocalDateTime.now());
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BusinessException("已交付的工单无法取消");
        }

        if (order.getStockLocked() != null && order.getStockLocked() == 1) {
            List<OrderMaterial> materials = orderMaterialMapper.selectList(
                    new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
            );
            for (OrderMaterial material : materials) {
                stockService.unlockStock(material.getStockId(), material.getQuantity());
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setStockLocked(0);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getOrderStatus() >= OrderStatus.BUILDING) {
            throw new BusinessException("工单已开始搭建，无法删除");
        }

        if (order.getStockLocked() != null && order.getStockLocked() == 1) {
            List<OrderMaterial> materials = orderMaterialMapper.selectList(
                    new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
            );
            for (OrderMaterial material : materials) {
                stockService.unlockStock(material.getStockId(), material.getQuantity());
            }
        }

        orderMaterialMapper.delete(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
        );
        orderMapper.deleteById(id);
    }

    public CustomOrderVO getDetailVO(Long id) {
        CustomOrder order = orderMapper.selectById(id);
        if (order == null) {
            return null;
        }
        CustomOrderVO vo = convertToVO(order);
        vo.setOrderStatusName(OrderStatus.getStatusName(order.getOrderStatus()));

        List<OrderMaterial> materials = orderMaterialMapper.selectList(
                new LambdaQueryWrapper<OrderMaterial>().eq(OrderMaterial::getOrderId, id)
        );
        vo.setOrderMaterials(materials.stream().map(m -> {
            var voM = new com.aquascape.vo.OrderMaterialVO();
            BeanUtils.copyProperties(m, voM);
            return voM;
        }).toList());

        return vo;
    }

    private CustomOrderVO convertToVO(CustomOrder order) {
        CustomOrderVO vo = new CustomOrderVO();
        BeanUtils.copyProperties(order, vo);
        return vo;
    }
}
