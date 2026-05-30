package com.hardware.stamping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.annotation.Log;
import com.hardware.stamping.dto.ConfirmProcessDTO;
import com.hardware.stamping.dto.ProductionOrderQueryDTO;
import com.hardware.stamping.dto.ScrapReportDTO;
import com.hardware.stamping.entity.CostAccounting;
import com.hardware.stamping.entity.MaterialInventory;
import com.hardware.stamping.entity.ProductionOrder;
import com.hardware.stamping.exception.BusinessException;
import com.hardware.stamping.mapper.MaterialInventoryMapper;
import com.hardware.stamping.mapper.ProductionOrderMapper;
import com.hardware.stamping.vo.ProductionOrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ProductionOrderService {

    @Autowired
    private ProductionOrderMapper productionOrderMapper;

    @Autowired
    private MaterialInventoryMapper materialInventoryMapper;

    @Autowired
    private ProductCategoryService productCategoryService;

    @Autowired
    private CostAccountingService costAccountingService;

    @Log("创建生产工单")
    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrder order) {
        productCategoryService.checkCategoryActive(order.getCategoryId());

        if (order.getOrderNo() == null || order.getOrderNo().isEmpty()) {
            order.setOrderNo(generateOrderNo());
        }

        ProductionOrder exist = productionOrderMapper.selectOne(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getOrderNo, order.getOrderNo())
        );
        if (exist != null) {
            throw new BusinessException("工单编号已存在");
        }

        order.setStatus(1);
        order.setQualifiedQuantity(BigDecimal.ZERO);
        order.setScrapQuantity(BigDecimal.ZERO);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        order.setDeleted(0);
        productionOrderMapper.insert(order);
    }

    @Log("确认工艺-锁定原料库存")
    @Transactional(rollbackFor = Exception.class)
    public void confirmProcess(ConfirmProcessDTO dto) {
        ProductionOrder order = getOrderById(dto.getOrderId());
        if (order.getStatus() != 1) {
            throw new BusinessException("只有待投产的工单才能确认工艺，当前状态：" + getStatusText(order.getStatus()));
        }

        MaterialInventory material = materialInventoryMapper.selectById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }
        if (material.getStockStatus() == 0) {
            throw new BusinessException("该原料已无库存");
        }
        if (material.getQuantity().compareTo(dto.getLockQuantity()) < 0) {
            throw new BusinessException("原料库存不足，当前库存：" + material.getQuantity());
        }

        int rows = materialInventoryMapper.lockStock(dto.getMaterialId(), dto.getLockQuantity());
        if (rows == 0) {
            throw new BusinessException("锁定原料库存失败");
        }

        order.setMaterialId(dto.getMaterialId());
        order.setMaterialBatchCode(material.getBatchCode());
        order.setMoldNo(dto.getMoldNo());
        order.setMachineNo(dto.getMachineNo());
        order.setTechnician(dto.getTechnician());
        order.setStatus(2);
        order.setActualStartTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("更新生产工单")
    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(ProductionOrder order) {
        ProductionOrder exist = productionOrderMapper.selectById(order.getId());
        if (exist == null) {
            throw new BusinessException("工单不存在");
        }
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("开始生产")
    @Transactional(rollbackFor = Exception.class)
    public void startProduction(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 1) {
            throw new BusinessException("当前工单状态不允许开始生产，状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(2);
        order.setActualStartTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成开平裁剪")
    @Transactional(rollbackFor = Exception.class)
    public void completeCutting(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 2) {
            throw new BusinessException("请先开始生产，当前状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(3);
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成模具调试")
    @Transactional(rollbackFor = Exception.class)
    public void completeMoldSetup(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 3) {
            throw new BusinessException("请先完成裁剪，当前状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(4);
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成冲压成型")
    @Transactional(rollbackFor = Exception.class)
    public void completeStamping(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 4) {
            throw new BusinessException("请先完成模具调试，当前状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(5);
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成去毛刺")
    @Transactional(rollbackFor = Exception.class)
    public void completeDeburring(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 5) {
            throw new BusinessException("请先完成冲压成型，当前状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(6);
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成质检分选")
    @Transactional(rollbackFor = Exception.class)
    public void completeInspection(Long id, BigDecimal qualifiedQuantity, BigDecimal scrapQuantity) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 6) {
            throw new BusinessException("请先完成去毛刺，当前状态：" + getStatusText(order.getStatus()));
        }
        if (qualifiedQuantity == null || scrapQuantity == null) {
            throw new BusinessException("合格数量和报废数量不能为空");
        }
        if (qualifiedQuantity.add(scrapQuantity).compareTo(order.getQuantity()) != 0) {
            throw new BusinessException("合格数量 + 报废数量 必须等于生产数量");
        }
        order.setStatus(7);
        order.setQualifiedQuantity(qualifiedQuantity);
        order.setScrapQuantity(scrapQuantity);
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("次品报废")
    @Transactional(rollbackFor = Exception.class)
    public void reportScrap(ScrapReportDTO dto) {
        ProductionOrder order = getOrderById(dto.getOrderId());
        if (order.getStatus() < 2 || order.getStatus() >= 7) {
            throw new BusinessException("当前工单状态不允许报次品报废");
        }

        BigDecimal currentScrap = order.getScrapQuantity() == null ? BigDecimal.ZERO : order.getScrapQuantity();
        BigDecimal currentQualified = order.getQualifiedQuantity() == null ? BigDecimal.ZERO : order.getQualifiedQuantity();
        BigDecimal newScrap = currentScrap.add(dto.getScrapQuantity());
        BigDecimal totalProduced = newScrap.add(currentQualified);

        if (totalProduced.compareTo(order.getQuantity()) > 0) {
            throw new BusinessException("次品数量超出生产总数量");
        }

        order.setScrapQuantity(newScrap);
        order.setQualifiedQuantity(order.getQuantity().subtract(newScrap));
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);
    }

    @Log("完成成品入库")
    @Transactional(rollbackFor = Exception.class)
    public void completeWarehousing(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() != 7) {
            throw new BusinessException("请先完成质检，当前状态：" + getStatusText(order.getStatus()));
        }
        order.setStatus(8);
        order.setActualEndTime(LocalDateTime.now());
        if (order.getActualStartTime() != null) {
            Duration duration = Duration.between(order.getActualStartTime(), order.getActualEndTime());
            order.setProductionHours(new BigDecimal(duration.toHours() + "." + duration.toMinutesPart()));
        }
        order.setUpdateTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);

        autoGenerateCostAccounting(order);
    }

    @Log("自动流转到下一工序")
    @Transactional(rollbackFor = Exception.class)
    public void autoFlowNext(Long id) {
        ProductionOrder order = getOrderById(id);
        int currentStatus = order.getStatus();

        if (currentStatus >= 8) {
            throw new BusinessException("工单已完成，无法继续流转");
        }

        switch (currentStatus) {
            case 1:
                startProduction(id);
                break;
            case 2:
                completeCutting(id);
                break;
            case 3:
                completeMoldSetup(id);
                break;
            case 4:
                completeStamping(id);
                break;
            case 5:
                completeDeburring(id);
                break;
            case 6:
                completeInspection(id, order.getQuantity(), BigDecimal.ZERO);
                break;
            case 7:
                completeWarehousing(id);
                break;
            default:
                throw new BusinessException("未知状态，无法自动流转");
        }
    }

    @Log("批量自动流转工单")
    @Transactional(rollbackFor = Exception.class)
    public void batchAutoFlow(List<Long> ids) {
        for (Long id : ids) {
            try {
                autoFlowNext(id);
            } catch (Exception e) {
                throw new BusinessException("工单ID:" + id + "流转失败 - " + e.getMessage());
            }
        }
    }

    @Log("删除生产工单")
    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        ProductionOrder order = getOrderById(id);
        if (order.getStatus() > 1 && order.getStatus() < 8) {
            throw new BusinessException("生产中的工单不允许删除");
        }

        if (order.getMaterialId() != null && order.getStatus() >= 2) {
            materialInventoryMapper.unlockStock(order.getMaterialId(), order.getQuantity());
        }

        productionOrderMapper.deleteById(id);
    }

    public ProductionOrder getOrderById(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        return order;
    }

    public IPage<ProductionOrderVO> queryPage(ProductionOrderQueryDTO queryDTO) {
        Page<ProductionOrderVO> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        IPage<ProductionOrderVO> resultPage = productionOrderMapper.queryPage(page, queryDTO);
        resultPage.getRecords().forEach(this::fillStatusText);
        return resultPage;
    }

    public List<ProductionOrder> listAll() {
        return productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .orderByDesc(ProductionOrder::getCreateTime)
        );
    }

    public List<ProductionOrder> listByStatus(Integer status) {
        return productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, status)
                        .orderByDesc(ProductionOrder::getCreateTime)
        );
    }

    public List<ProductionOrder> getTimeoutOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        return productionOrderMapper.selectList(
                new LambdaQueryWrapper<ProductionOrder>()
                        .eq(ProductionOrder::getStatus, 1)
                        .lt(ProductionOrder::getPlanStartTime, threshold)
                        .orderByDesc(ProductionOrder::getCreateTime)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void checkTimeoutOrders() {
        List<ProductionOrder> timeoutOrders = getTimeoutOrders();
        for (ProductionOrder order : timeoutOrders) {
            order.setStatus(9);
            order.setUpdateTime(LocalDateTime.now());
            productionOrderMapper.updateById(order);
        }
    }

    private void fillStatusText(ProductionOrderVO vo) {
        vo.setStatusText(getStatusText(vo.getStatus()));
    }

    public String getStatusText(Integer status) {
        switch (status) {
            case 1: return "待投产";
            case 2: return "生产中";
            case 3: return "裁剪完成";
            case 4: return "模具调试完成";
            case 5: return "冲压完成";
            case 6: return "去毛刺完成";
            case 7: return "质检完成";
            case 8: return "已入库";
            case 9: return "超时";
            default: return "未知状态";
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = (int) (Math.random() * 10000);
        return "WO" + dateStr + String.format("%04d", random);
    }

    private void autoGenerateCostAccounting(ProductionOrder order) {
        CostAccounting accounting = new CostAccounting();
        accounting.setOrderId(order.getId());
        accounting.setOrderNo(order.getOrderNo());
        accounting.setCategoryId(order.getCategoryId());
        accounting.setCategoryName(order.getCategoryName());
        accounting.setProductionQuantity(order.getQuantity());

        if (order.getMaterialId() != null) {
            MaterialInventory material = materialInventoryMapper.selectById(order.getMaterialId());
            if (material != null && material.getUnitPrice() != null) {
                accounting.setMaterialCost(material.getUnitPrice().multiply(order.getQuantity()));
            }
        }

        if (order.getScrapQuantity() != null) {
            BigDecimal materialLossRate = new BigDecimal("0.05");
            accounting.setMaterialLossCost(
                accounting.getMaterialCost() == null ?
                    BigDecimal.ZERO :
                    accounting.getMaterialCost().multiply(materialLossRate)
            );
        }

        if (order.getProductionHours() != null) {
            accounting.setLaborCost(order.getProductionHours().multiply(new BigDecimal("50")));
        }

        accounting.setMoldWearCost(new BigDecimal("100"));
        accounting.setOutsourcingCost(BigDecimal.ZERO);
        accounting.setOtherCost(BigDecimal.ZERO);

        costAccountingService.addCostAccounting(accounting);
    }
}
