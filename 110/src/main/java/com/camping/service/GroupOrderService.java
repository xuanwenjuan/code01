package com.camping.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.camping.annotation.RequiresRole;
import com.camping.context.UserContext;
import com.camping.entity.Category;
import com.camping.entity.GroupOrder;
import com.camping.entity.OrderMaterial;
import com.camping.entity.OrderMember;
import com.camping.enums.OrderStatusEnum;
import com.camping.enums.RoleEnum;
import com.camping.exception.BusinessException;
import com.camping.mapper.CategoryMapper;
import com.camping.mapper.GroupOrderMapper;
import com.camping.mapper.OrderMaterialMapper;
import com.camping.mapper.OrderMemberMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupOrderService extends ServiceImpl<GroupOrderMapper, GroupOrder> {

    private final OrderMemberMapper orderMemberMapper;
    private final OrderMaterialMapper orderMaterialMapper;
    private final CategoryMapper categoryMapper;

    private static final Map<Integer, List<Integer>> STATUS_TRANSITION = Map.of(
            OrderStatusEnum.PENDING_GROUP.getCode(), List.of(OrderStatusEnum.CONFIRM_REQUIREMENT.getCode(), OrderStatusEnum.EXPIRED.getCode()),
            OrderStatusEnum.CONFIRM_REQUIREMENT.getCode(), List.of(OrderStatusEnum.PREPARE_MATERIAL.getCode(), OrderStatusEnum.REFUNDING.getCode()),
            OrderStatusEnum.PREPARE_MATERIAL.getCode(), List.of(OrderStatusEnum.SHIPPED.getCode(), OrderStatusEnum.REFUNDING.getCode()),
            OrderStatusEnum.SHIPPED.getCode(), List.of(OrderStatusEnum.COMPLETED.getCode(), OrderStatusEnum.REFUNDING.getCode()),
            OrderStatusEnum.REFUNDING.getCode(), List.of(OrderStatusEnum.COMPLETED.getCode(), OrderStatusEnum.EXPIRED.getCode())
    );

    public Page<GroupOrder> page(Integer pageNum, Integer pageSize, Integer status, Long leaderId) {
        LambdaQueryWrapper<GroupOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(GroupOrder::getStatus, status);
        }
        if (leaderId != null) {
            wrapper.eq(GroupOrder::getLeaderId, leaderId);
        }
        wrapper.orderByDesc(GroupOrder::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public GroupOrder detail(Long id) {
        GroupOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        List<OrderMember> members = orderMemberMapper.selectList(new LambdaQueryWrapper<OrderMember>()
                .eq(OrderMember::getOrderId, id));
        order.setMembers(members);

        List<OrderMaterial> materials = orderMaterialMapper.selectList(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, id));
        order.setMaterials(materials);

        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.LEADER})
    public void createGroup(GroupOrder order) {
        if (order.getCategoryId() != null) {
            Category category = categoryMapper.selectById(order.getCategoryId());
            if (category == null) {
                throw new BusinessException("类目不存在");
            }
            if (category.getStatus() == 0) {
                throw new BusinessException("该类目已下架，不能创建团购");
            }
        }

        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setStatus(OrderStatusEnum.PENDING_GROUP.getCode());
        order.setCurrentCount(0);
        order.setExpireTime(LocalDateTime.now().plusDays(7));
        order.setLeaderId(UserContext.getUserId());
        save(order);
        log.info("创建团购订单成功，订单号：{}", orderNo);
    }

    @Transactional(rollbackFor = Exception.class)
    public void joinGroup(OrderMember member) {
        GroupOrder order = getById(member.getOrderId());
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        validateStatusTransition(order.getStatus(), OrderStatusEnum.PENDING_GROUP.getCode(), "参团");

        if (order.getCurrentCount() >= order.getTargetCount()) {
            throw new BusinessException("团购已满员");
        }
        if (LocalDateTime.now().isAfter(order.getExpireTime())) {
            throw new BusinessException("团购已过期");
        }

        member.setStatus(1);
        member.setAmount(order.getUnitPrice().multiply(new BigDecimal(member.getQuantity())));
        orderMemberMapper.insert(member);

        int newCount = order.getCurrentCount() + member.getQuantity();
        order.setCurrentCount(newCount);
        order.setTotalAmount(order.getUnitPrice().multiply(new BigDecimal(newCount)));
        updateById(order);

        if (newCount >= order.getTargetCount()) {
            order.setStatus(OrderStatusEnum.CONFIRM_REQUIREMENT.getCode());
            updateById(order);
            log.info("团购订单{}已成团，自动进入确认定制需求阶段", order.getOrderNo());
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.LEADER})
    public void confirmRequirement(Long orderId, String requirements) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        validateStatusTransition(order.getStatus(), OrderStatusEnum.CONFIRM_REQUIREMENT.getCode(), "确认定制需求");

        order.setCustomRequirements(requirements);
        order.setStatus(OrderStatusEnum.PREPARE_MATERIAL.getCode());
        updateById(order);
        log.info("订单{}已确认定制需求，进入备货阶段", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    public void allocateMaterials(Long orderId, List<OrderMaterial> materials) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        validateStatusTransition(order.getStatus(), OrderStatusEnum.PREPARE_MATERIAL.getCode(), "分配物料");

        orderMaterialMapper.delete(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));

        for (OrderMaterial material : materials) {
            material.setOrderId(orderId);
            orderMaterialMapper.insert(material);
        }
        log.info("订单{}物料分配完成", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    public void shipOrder(Long orderId, String trackingNo) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        validateStatusTransition(order.getStatus(), OrderStatusEnum.PREPARE_MATERIAL.getCode(), "发货");

        long materialCount = orderMaterialMapper.selectCount(new LambdaQueryWrapper<OrderMaterial>()
                .eq(OrderMaterial::getOrderId, orderId));
        if (materialCount == 0) {
            throw new BusinessException("请先分配物料再发货");
        }

        order.setStatus(OrderStatusEnum.SHIPPED.getCode());
        order.setRemark(trackingNo);
        updateById(order);
        log.info("订单{}已发货，物流单号：{}", order.getOrderNo(), trackingNo);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(Long orderId) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        validateStatusTransition(order.getStatus(), OrderStatusEnum.SHIPPED.getCode(), "完成订单");

        order.setStatus(OrderStatusEnum.COMPLETED.getCode());
        updateById(order);
        log.info("订单{}已完成", order.getOrderNo());
    }

    @Transactional(rollbackFor = Exception.class)
    public void applyRefund(Long orderId, String reason) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (OrderStatusEnum.EXPIRED.getCode().equals(order.getStatus())
                || OrderStatusEnum.COMPLETED.getCode().equals(order.getStatus())) {
            throw new BusinessException("当前状态不支持申请售后");
        }

        order.setStatus(OrderStatusEnum.REFUNDING.getCode());
        order.setRemark(reason);
        updateById(order);
        log.info("订单{}申请售后，原因：{}", order.getOrderNo(), reason);
    }

    @Transactional(rollbackFor = Exception.class)
    @RequiresRole({RoleEnum.ADMIN, RoleEnum.WAREHOUSE})
    public void handleRefund(Long orderId, Boolean agree, String comment) {
        GroupOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!OrderStatusEnum.REFUNDING.getCode().equals(order.getStatus())) {
            throw new BusinessException("当前状态不支持此操作");
        }

        if (agree) {
            order.setStatus(OrderStatusEnum.EXPIRED.getCode());
            order.setRemark("售后已同意：" + comment);
            log.info("订单{}售后已同意", order.getOrderNo());
        } else {
            order.setStatus(OrderStatusEnum.PREPARE_MATERIAL.getCode());
            order.setRemark("售后已驳回：" + comment);
            log.info("订单{}售后已驳回，返回备货阶段", order.getOrderNo());
        }
        updateById(order);
    }

    public void expireOrders() {
        List<GroupOrder> orders = list(new LambdaQueryWrapper<GroupOrder>()
                .eq(GroupOrder::getStatus, OrderStatusEnum.PENDING_GROUP.getCode())
                .lt(GroupOrder::getExpireTime, LocalDateTime.now()));

        for (GroupOrder order : orders) {
            order.setStatus(OrderStatusEnum.EXPIRED.getCode());
            updateById(order);
            log.info("超时订单{}已自动失效", order.getOrderNo());
        }
    }

    public void autoCompleteOrders() {
        List<GroupOrder> orders = list(new LambdaQueryWrapper<GroupOrder>()
                .eq(GroupOrder::getStatus, OrderStatusEnum.SHIPPED.getCode())
                .lt(GroupOrder::getUpdateTime, LocalDateTime.now().minusDays(7)));

        for (GroupOrder order : orders) {
            order.setStatus(OrderStatusEnum.COMPLETED.getCode());
            updateById(order);
            log.info("发货超过7天的订单{}自动完成", order.getOrderNo());
        }
    }

    private void validateStatusTransition(Integer currentStatus, Integer expectedStatus, String operation) {
        if (!expectedStatus.equals(currentStatus)) {
            OrderStatusEnum currentEnum = OrderStatusEnum.values()[currentStatus - 1];
            throw new BusinessException("当前状态为[" + currentEnum.getDesc() + "]，不支持" + operation + "操作");
        }
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "GO" + dateStr + System.currentTimeMillis() % 1000;
    }

    public Map<Integer, Long> getOrderStatusCount() {
        List<GroupOrder> allOrders = list();
        return allOrders.stream()
                .collect(Collectors.groupingBy(GroupOrder::getStatus, Collectors.counting()));
    }
}
