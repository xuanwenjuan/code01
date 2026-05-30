package com.rotor.manufacture.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rotor.manufacture.common.ResultCodeEnum;
import com.rotor.manufacture.context.UserContext;
import com.rotor.manufacture.dto.PageQueryDTO;
import com.rotor.manufacture.dto.ProcessCompleteDTO;
import com.rotor.manufacture.dto.ProductionOrderCreateDTO;
import com.rotor.manufacture.dto.ProductionOrderQueryDTO;
import com.rotor.manufacture.entity.OrderProcess;
import com.rotor.manufacture.entity.ProductionOrder;
import com.rotor.manufacture.exception.BusinessException;
import com.rotor.manufacture.mapper.OrderProcessMapper;
import com.rotor.manufacture.mapper.ProductionOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
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
public class ProductionOrderService {

    private final ProductionOrderMapper productionOrderMapper;
    private final OrderProcessMapper orderProcessMapper;
    private final MaterialService materialService;

    private static final String[][] PROCESSES = {
            {"1", "硅钢片叠压成型"},
            {"2", "转轴压装"},
            {"3", "绕组嵌线"},
            {"4", "动平衡校正"},
            {"5", "绝缘检测"},
            {"6", "表面喷涂"},
            {"7", "成品入库"}
    };

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(ProductionOrderCreateDTO dto) {
        String orderNo = generateOrderNo();

        ProductionOrder order = new ProductionOrder();
        order.setOrderNo(orderNo);
        order.setProductId(dto.getProductId());
        order.setProductName(dto.getProductName());
        order.setQuantity(dto.getQuantity());
        order.setStatus(0);
        order.setPlanStartTime(dto.getPlanStartTime());
        order.setPlanEndTime(dto.getPlanEndTime());
        order.setGroupLeaderId(UserContext.getUserId());
        order.setGroupLeaderName(UserContext.getUsername());
        order.setRemark(dto.getRemark());
        productionOrderMapper.insert(order);

        for (int i = 0; i < PROCESSES.length; i++) {
            OrderProcess process = new OrderProcess();
            process.setOrderId(order.getId());
            process.setOrderNo(orderNo);
            process.setProcessType(Integer.parseInt(PROCESSES[i][0]));
            process.setProcessName(PROCESSES[i][1]);
            process.setSort(i + 1);
            process.setStatus(0);
            orderProcessMapper.insert(process);
        }

        if (dto.getMaterialRequirements() != null && !dto.getMaterialRequirements().isEmpty()) {
            for (ProductionOrderCreateDTO.MaterialRequirementDTO req : dto.getMaterialRequirements()) {
                materialService.lockMaterial(req.getMaterialId(), order.getId(), req.getQuantity());
            }
        }

        log.info("创建工单成功: {}", orderNo);
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "WO-" + dateStr + "-" + uuid;
    }

    @Transactional(rollbackFor = Exception.class)
    public void prepareMaterial(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order.getStatus() != 0) {
            throw new BusinessException(ResultCodeEnum.ORDER_STATUS_ERROR);
        }
        order.setStatus(1);
        productionOrderMapper.updateById(order);
        log.info("工单备料完成: {}", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void startOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order.getStatus() != 1) {
            throw new BusinessException(ResultCodeEnum.ORDER_STATUS_ERROR);
        }
        order.setStatus(2);
        order.setActualStartTime(LocalDateTime.now());
        productionOrderMapper.updateById(order);

        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, id)
                .orderByAsc(OrderProcess::getSort)
                .last("LIMIT 1");
        OrderProcess firstProcess = orderProcessMapper.selectOne(wrapper);
        firstProcess.setStatus(1);
        firstProcess.setOperatorId(UserContext.getUserId());
        firstProcess.setOperatorName(UserContext.getUsername());
        firstProcess.setStartTime(LocalDateTime.now());
        orderProcessMapper.updateById(firstProcess);

        log.info("工单开始生产: {}", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeProcess(ProcessCompleteDTO dto) {
        OrderProcess process = orderProcessMapper.selectById(dto.getProcessId());
        if (process.getStatus() != 1) {
            throw new BusinessException(ResultCodeEnum.ORDER_STATUS_ERROR);
        }

        process.setStatus(2);
        process.setEndTime(LocalDateTime.now());
        process.setQualifiedQuantity(dto.getQualifiedQuantity());
        process.setDefectiveQuantity(dto.getDefectiveQuantity());
        process.setEnergyConsumption(dto.getEnergyConsumption());
        process.setLaborHours(dto.getLaborHours());
        process.setRemark(dto.getRemark());
        orderProcessMapper.updateById(process);

        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, process.getOrderId())
                .gt(OrderProcess::getSort, process.getSort())
                .orderByAsc(OrderProcess::getSort)
                .last("LIMIT 1");
        OrderProcess nextProcess = orderProcessMapper.selectOne(wrapper);

        if (nextProcess != null) {
            nextProcess.setStatus(1);
            nextProcess.setOperatorId(UserContext.getUserId());
            nextProcess.setOperatorName(UserContext.getUsername());
            nextProcess.setStartTime(LocalDateTime.now());
            orderProcessMapper.updateById(nextProcess);
        } else {
            ProductionOrder order = productionOrderMapper.selectById(process.getOrderId());
            order.setStatus(3);
            order.setActualEndTime(LocalDateTime.now());
            productionOrderMapper.updateById(order);
            log.info("工单全部工序完成: {}", order.getOrderNo());
        }

        log.info("工序完成: 工单ID={}, 工序ID={}", process.getOrderId(), dto.getProcessId());
    }

    public List<ProductionOrder> list() {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return productionOrderMapper.selectList(wrapper);
    }

    public Page<ProductionOrder> pageQuery(PageQueryDTO queryDTO) {
        Page<ProductionOrder> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(ProductionOrder::getOrderNo, queryDTO.getKeyword())
                    .or().like(ProductionOrder::getProductName, queryDTO.getKeyword()));
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(ProductionOrder::getStatus, queryDTO.getStatus());
        }
        wrapper.orderByDesc(ProductionOrder::getCreateTime);
        return productionOrderMapper.selectPage(page, wrapper);
    }

    public Page<ProductionOrder> queryByConditions(ProductionOrderQueryDTO queryDTO) {
        Page<ProductionOrder> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(queryDTO.getKeyword())) {
            wrapper.and(w -> w.like(ProductionOrder::getOrderNo, queryDTO.getKeyword())
                    .or().like(ProductionOrder::getProductName, queryDTO.getKeyword()));
        }
        if (StringUtils.hasText(queryDTO.getOrderNo())) {
            wrapper.like(ProductionOrder::getOrderNo, queryDTO.getOrderNo());
        }
        if (queryDTO.getProductId() != null) {
            wrapper.eq(ProductionOrder::getProductId, queryDTO.getProductId());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(ProductionOrder::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getGroupLeaderId() != null) {
            wrapper.eq(ProductionOrder::getGroupLeaderId, queryDTO.getGroupLeaderId());
        }
        if (queryDTO.getStartPlanTime() != null) {
            wrapper.ge(ProductionOrder::getPlanStartTime, queryDTO.getStartPlanTime());
        }
        if (queryDTO.getEndPlanTime() != null) {
            wrapper.le(ProductionOrder::getPlanEndTime, queryDTO.getEndPlanTime());
        }
        if (queryDTO.getStartActualTime() != null) {
            wrapper.ge(ProductionOrder::getActualStartTime, queryDTO.getStartActualTime());
        }
        if (queryDTO.getEndActualTime() != null) {
            wrapper.le(ProductionOrder::getActualEndTime, queryDTO.getEndActualTime());
        }

        if ("asc".equalsIgnoreCase(queryDTO.getOrderDirection())) {
            wrapper.orderByAsc(getOrderColumn(queryDTO.getOrderBy()));
        } else {
            wrapper.orderByDesc(getOrderColumn(queryDTO.getOrderBy()));
        }

        return productionOrderMapper.selectPage(page, wrapper);
    }

    private String getOrderColumn(String orderBy) {
        return switch (orderBy) {
            case "planStartTime" -> "plan_start_time";
            case "actualStartTime" -> "actual_start_time";
            case "createTime" -> "create_time";
            default -> "create_time";
        };
    }

    public ProductionOrder getById(Long id) {
        return productionOrderMapper.selectById(id);
    }

    public List<OrderProcess> getProcessesByOrderId(Long orderId) {
        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, orderId)
                .orderByAsc(OrderProcess::getSort);
        return orderProcessMapper.selectList(wrapper);
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void checkOverdueOrders() {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.in(ProductionOrder::getStatus, 0, 1)
                .lt(ProductionOrder::getPlanStartTime, LocalDateTime.now().minusDays(1));
        List<ProductionOrder> overdueOrders = productionOrderMapper.selectList(wrapper);

        for (ProductionOrder order : overdueOrders) {
            order.setStatus(4);
            productionOrderMapper.updateById(order);
            log.info("工单已超期暂停: {}", order.getOrderNo());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void pauseOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order.getStatus() == 0 || order.getStatus() == 3) {
            throw new BusinessException(ResultCodeEnum.ORDER_STATUS_ERROR);
        }
        order.setStatus(4);
        productionOrderMapper.updateById(order);
        log.info("工单已暂停: {}", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void resumeOrder(Long id) {
        ProductionOrder order = productionOrderMapper.selectById(id);
        if (order.getStatus() != 4) {
            throw new BusinessException(ResultCodeEnum.ORDER_STATUS_ERROR);
        }

        LambdaQueryWrapper<OrderProcess> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(OrderProcess::getOrderId, id)
                .eq(OrderProcess::getStatus, 1);
        OrderProcess runningProcess = orderProcessMapper.selectOne(wrapper);

        if (runningProcess != null) {
            order.setStatus(2);
        } else {
            order.setStatus(1);
        }
        productionOrderMapper.updateById(order);
        log.info("工单已恢复: {}", order.getOrderNo());
    }

    public void initOrders() {
        LambdaQueryWrapper<ProductionOrder> wrapper = new LambdaQueryWrapper<>();
        if (productionOrderMapper.selectCount(wrapper) > 0) {
            return;
        }

        ProductionOrderCreateDTO dto = new ProductionOrderCreateDTO();
        dto.setProductId(1L);
        dto.setProductName("永磁同步电机转子-标准型");
        dto.setQuantity(100);
        dto.setPlanStartTime(LocalDateTime.now());
        dto.setPlanEndTime(LocalDateTime.now().plusDays(7));
        dto.setRemark("测试工单");
        createOrder(dto);
    }
}