package com.fishing.distribution.service;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishing.distribution.common.Constants;
import com.fishing.distribution.dto.PageQuery;
import com.fishing.distribution.dto.SortingLossRecordDTO;
import com.fishing.distribution.dto.SortingOrderDTO;
import com.fishing.distribution.entity.*;
import com.fishing.distribution.exception.BusinessException;
import com.fishing.distribution.mapper.*;
import com.fishing.distribution.vo.SortingOrderDetailVO;
import com.fishing.distribution.vo.SortingOrderVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SortingOrderService {

    private final SortingOrderMapper sortingOrderMapper;
    private final SortingOrderDetailMapper sortingOrderDetailMapper;
    private final SortingLossRecordMapper sortingLossRecordMapper;
    private final SortingTeamMapper sortingTeamMapper;
    private final FishingBoatMapper fishingBoatMapper;
    private final FishCategoryMapper fishCategoryMapper;

    private static final BigDecimal COLD_CHAIN_COST_RATE = new BigDecimal("0.05");
    private static final BigDecimal LABOR_COST_RATE = new BigDecimal("0.08");

    @Transactional(rollbackFor = Exception.class)
    public void createOrder(SortingOrderDTO dto, Long operatorId, String operatorName) {
        FishingBoat boat = fishingBoatMapper.selectById(dto.getBoatId());
        if (boat == null) {
            throw new BusinessException("渔船不存在");
        }

        if (boat.getStatus() != 2) {
            throw new BusinessException("渔船未停靠，无法创建分拣工单");
        }

        for (var detailDTO : dto.getDetails()) {
            FishCategory category = fishCategoryMapper.selectById(detailDTO.getCategoryId());
            if (category == null) {
                throw new BusinessException("渔获类目不存在，类目ID: " + detailDTO.getCategoryId());
            }
            if (category.getStatus() == 0) {
                throw new BusinessException("类目 [" + category.getCategoryName() + "] 已停收，无法入库");
            }
            detailDTO.setCategoryName(category.getCategoryName());
        }

        SortingOrder order = new SortingOrder();
        order.setOrderNo("SO" + IdUtil.getSnowflakeNextIdStr());
        order.setBoatId(boat.getId());
        order.setBoatCode(boat.getBoatCode());
        order.setBoatName(boat.getBoatName());
        order.setArrivalTime(dto.getArrivalTime() != null ? dto.getArrivalTime() : LocalDateTime.now());
        order.setRemark(dto.getRemark());
        order.setStatus(Constants.ORDER_STATUS_PENDING_UNLOAD);
        order.setWarningStatus(0);
        order.setCreateBy(operatorId);

        BigDecimal totalWeight = BigDecimal.ZERO;
        for (var detailDTO : dto.getDetails()) {
            totalWeight = totalWeight.add(detailDTO.getWeight());
        }
        order.setTotalWeight(totalWeight);

        sortingOrderMapper.insert(order);

        for (var detailDTO : dto.getDetails()) {
            SortingOrderDetail detail = new SortingOrderDetail();
            BeanUtils.copyProperties(detailDTO, detail);
            detail.setOrderId(order.getId());
            detail.setOrderNo(order.getOrderNo());
            if (detailDTO.getUnitPrice() != null && detailDTO.getWeight() != null) {
                detail.setTotalAmount(detailDTO.getUnitPrice().multiply(detailDTO.getWeight()));
            }
            sortingOrderDetailMapper.insert(detail);
        }

        log.info("分拣工单创建成功，工单编号: {}, 创建人: {}", order.getOrderNo(), operatorName);
    }

    @Transactional(rollbackFor = Exception.class)
    public void assignTeam(Long orderId, Long teamId, Long operatorId) {
        SortingOrder order = sortingOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() > Constants.ORDER_STATUS_UNLOADING) {
            throw new BusinessException("工单已开始分拣，无法重新分配班组");
        }

        SortingTeam team = sortingTeamMapper.selectById(teamId);
        if (team == null) {
            throw new BusinessException("分拣班组不存在");
        }

        if (team.getStatus() != 1) {
            throw new BusinessException("分拣班组当前不可用");
        }

        BigDecimal availableCapacity = team.getMaxCapacity().subtract(team.getCurrentLoad());
        if (availableCapacity.compareTo(order.getTotalWeight()) < 0) {
            throw new BusinessException("班组作业承载量不足，剩余可用: " + availableCapacity + "kg");
        }

        team.setCurrentLoad(team.getCurrentLoad().add(order.getTotalWeight()));
        sortingTeamMapper.updateById(team);

        order.setTeamId(teamId);
        order.setStatus(Constants.ORDER_STATUS_UNLOADING);
        order.setStartTime(LocalDateTime.now());
        sortingOrderMapper.updateById(order);

        log.info("分拣工单分配班组成功，工单编号: {}, 班组: {}, 操作人: {}", order.getOrderNo(), team.getTeamName(), operatorId);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatus(Long orderId, Integer targetStatus, Long operatorId, String operatorName) {
        SortingOrder order = sortingOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() == Constants.ORDER_STATUS_CANCELLED) {
            throw new BusinessException("工单已取消，无法修改状态");
        }
        if (order.getStatus() == Constants.ORDER_STATUS_COMPLETED) {
            throw new BusinessException("工单已完成，无法修改状态");
        }

        validateStatusTransition(order.getStatus(), targetStatus);

        if (targetStatus == Constants.ORDER_STATUS_COMPLETED) {
            order.setEndTime(LocalDateTime.now());
            calculateTotalCost(order);
            if (order.getTeamId() != null) {
                releaseTeamCapacity(order.getTeamId(), order.getTotalWeight());
            }
        }

        order.setStatus(targetStatus);
        sortingOrderMapper.updateById(order);

        log.info("分拣工单状态变更，工单编号: {}, 原状态: {}, 新状态: {}, 操作人: {}", 
                order.getOrderNo(), getStatusDescription(order.getStatus()), 
                getStatusDescription(targetStatus), operatorName);
    }

    private void calculateTotalCost(SortingOrder order) {
        BigDecimal coldChainCost = order.getTotalWeight().multiply(COLD_CHAIN_COST_RATE).setScale(2, RoundingMode.HALF_UP);
        order.setColdChainCost(coldChainCost);

        BigDecimal laborCost = order.getTotalWeight().multiply(LABOR_COST_RATE).setScale(2, RoundingMode.HALF_UP);
        order.setLaborCost(laborCost);

        order.setTotalCost(coldChainCost.add(laborCost));
    }

    private void releaseTeamCapacity(Long teamId, BigDecimal weight) {
        SortingTeam team = sortingTeamMapper.selectById(teamId);
        if (team != null) {
            team.setCurrentLoad(team.getCurrentLoad().subtract(weight));
            if (team.getCurrentLoad().compareTo(BigDecimal.ZERO) < 0) {
                team.setCurrentLoad(BigDecimal.ZERO);
            }
            sortingTeamMapper.updateById(team);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void recordLoss(SortingLossRecordDTO dto, Long operatorId, String operatorName) {
        SortingOrder order = sortingOrderMapper.selectById(dto.getOrderId());
        if (order == null) {
            throw new BusinessException("工单不存在");
        }

        if (order.getStatus() >= Constants.ORDER_STATUS_COMPLETED) {
            throw new BusinessException("工单已完成，无法登记损耗");
        }

        FishCategory category = fishCategoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("渔获类目不存在");
        }
        dto.setCategoryName(category.getCategoryName());

        SortingLossRecord record = new SortingLossRecord();
        BeanUtils.copyProperties(dto, record);
        record.setOrderNo(order.getOrderNo());
        record.setRecordBy(operatorId);
        record.setRecordByName(operatorName);

        if (dto.getLossAmount() == null) {
            LambdaQueryWrapper<SortingOrderDetail> detailQuery = new LambdaQueryWrapper<>();
            detailQuery.eq(SortingOrderDetail::getOrderId, order.getId())
                    .eq(SortingOrderDetail::getCategoryId, dto.getCategoryId())
                    .last("LIMIT 1");
            SortingOrderDetail detail = sortingOrderDetailMapper.selectOne(detailQuery);
            if (detail != null && detail.getUnitPrice() != null) {
                record.setLossAmount(dto.getLossWeight().multiply(detail.getUnitPrice()).setScale(2, RoundingMode.HALF_UP));
            }
        }

        sortingLossRecordMapper.insert(record);
        aggregateLoss(order.getId(), dto.getCategoryId());

        log.info("分拣损耗登记成功，工单编号: {}, 类目: {}, 损耗重量: {}, 操作人: {}", 
                order.getOrderNo(), category.getCategoryName(), dto.getLossWeight(), operatorName);
    }

    private void aggregateLoss(Long orderId, Long categoryId) {
        LambdaQueryWrapper<SortingLossRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SortingLossRecord::getOrderId, orderId)
                .eq(categoryId != null, SortingLossRecord::getCategoryId, categoryId);
        List<SortingLossRecord> lossRecords = sortingLossRecordMapper.selectList(queryWrapper);

        BigDecimal totalLossWeight = lossRecords.stream()
                .map(SortingLossRecord::getLossWeight)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (SortingLossRecord lossRecord : lossRecords) {
            LambdaQueryWrapper<SortingOrderDetail> detailQuery = new LambdaQueryWrapper<>();
            detailQuery.eq(SortingOrderDetail::getOrderId, orderId)
                    .eq(SortingOrderDetail::getCategoryId, lossRecord.getCategoryId());
            SortingOrderDetail detail = sortingOrderDetailMapper.selectOne(detailQuery);
            if (detail != null) {
                detail.setLossWeight(totalLossWeight);
                sortingOrderDetailMapper.updateById(detail);
            }
        }

        SortingOrder order = sortingOrderMapper.selectById(orderId);
        if (order != null) {
            order.setLossWeight(totalLossWeight);
            sortingOrderMapper.updateById(order);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId, Long operatorId, String operatorName) {
        SortingOrder order = sortingOrderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("工单不存在");
        }
        if (order.getStatus() == Constants.ORDER_STATUS_COMPLETED) {
            throw new BusinessException("已完成的工单无法取消");
        }

        if (order.getTeamId() != null && order.getTotalWeight() != null) {
            releaseTeamCapacity(order.getTeamId(), order.getTotalWeight());
        }

        order.setStatus(Constants.ORDER_STATUS_CANCELLED);
        sortingOrderMapper.updateById(order);
        log.info("分拣工单已取消，工单编号: {}, 操作人: {}", order.getOrderNo(), operatorName);
    }

    public SortingOrderVO getOrderById(Long orderId) {
        SortingOrder order = sortingOrderMapper.selectById(orderId);
        if (order == null) {
            return null;
        }
        SortingOrderVO vo = convertToVO(order);
        List<SortingOrderDetail> details = sortingOrderDetailMapper.selectByOrderId(orderId);
        vo.setDetails(details.stream().map(this::convertDetailToVO).collect(Collectors.toList()));
        return vo;
    }

    public IPage<SortingOrderVO> getOrderPage(PageQuery pageQuery, Long boatId, Integer status, Long teamId) {
        Page<SortingOrder> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());
        LambdaQueryWrapper<SortingOrder> queryWrapper = new LambdaQueryWrapper<>();

        if (boatId != null) {
            queryWrapper.eq(SortingOrder::getBoatId, boatId);
        }
        if (status != null) {
            queryWrapper.eq(SortingOrder::getStatus, status);
        }
        if (teamId != null) {
            queryWrapper.eq(SortingOrder::getTeamId, teamId);
        }

        queryWrapper.orderByDesc(SortingOrder::getCreateTime);
        IPage<SortingOrder> orderPage = sortingOrderMapper.selectPage(page, queryWrapper);

        Page<SortingOrderVO> voPage = new Page<>(orderPage.getCurrent(), orderPage.getSize(), orderPage.getTotal());
        List<SortingOrderVO> voList = orderPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);
        return voPage;
    }

    public List<SortingOrder> getTimeoutOrders(Integer hours) {
        LocalDateTime warningTime = LocalDateTime.now().minusHours(hours);
        return sortingOrderMapper.selectTimeoutOrders(warningTime);
    }

    @Transactional(rollbackFor = Exception.class)
    public void processTimeoutOrders() {
        List<SortingOrder> timeoutOrders = sortingOrderMapper.selectTimeoutOrders(LocalDateTime.now().minusHours(4));
        for (SortingOrder order : timeoutOrders) {
            if (order.getWarningStatus() == 0) {
                order.setWarningStatus(1);
                order.setWarningTime(LocalDateTime.now());
                sortingOrderMapper.updateById(order);
                log.warn("分拣工单超时预警，工单编号: {}, 渔船: {}", order.getOrderNo(), order.getBoatName());
            }
        }
    }

    private void validateStatusTransition(Integer currentStatus, Integer targetStatus) {
        boolean isValid = switch (currentStatus) {
            case Constants.ORDER_STATUS_PENDING_UNLOAD -> targetStatus == Constants.ORDER_STATUS_UNLOADING 
                    || targetStatus == Constants.ORDER_STATUS_CANCELLED;
            case Constants.ORDER_STATUS_UNLOADING -> targetStatus == Constants.ORDER_STATUS_SORTING 
                    || targetStatus == Constants.ORDER_STATUS_CANCELLED;
            case Constants.ORDER_STATUS_SORTING -> targetStatus == Constants.ORDER_STATUS_PACKING 
                    || targetStatus == Constants.ORDER_STATUS_CANCELLED;
            case Constants.ORDER_STATUS_PACKING -> targetStatus == Constants.ORDER_STATUS_COMPLETED 
                    || targetStatus == Constants.ORDER_STATUS_CANCELLED;
            default -> false;
        };

        if (!isValid) {
            throw new BusinessException("状态流转不合法，无法从 " + getStatusDescription(currentStatus) + 
                    " 流转到 " + getStatusDescription(targetStatus));
        }
    }

    private String getStatusDescription(Integer status) {
        if (status == null) {
            return "未知";
        }
        return switch (status) {
            case Constants.ORDER_STATUS_PENDING_UNLOAD -> "待卸货";
            case Constants.ORDER_STATUS_UNLOADING -> "卸货中";
            case Constants.ORDER_STATUS_SORTING -> "分拣中";
            case Constants.ORDER_STATUS_PACKING -> "打包中";
            case Constants.ORDER_STATUS_COMPLETED -> "入库完成";
            case Constants.ORDER_STATUS_CANCELLED -> "已取消";
            default -> "未知状态";
        };
    }

    private SortingOrderVO convertToVO(SortingOrder order) {
        if (order == null) {
            return null;
        }
        SortingOrderVO vo = new SortingOrderVO();
        BeanUtils.copyProperties(order, vo);
        vo.setStatusDesc(getStatusDescription(order.getStatus()));
        vo.setWarningStatusDesc(order.getWarningStatus() == 1 ? "已超时" : "正常");
        return vo;
    }

    private SortingOrderDetailVO convertDetailToVO(SortingOrderDetail detail) {
        if (detail == null) {
            return null;
        }
        SortingOrderDetailVO vo = new SortingOrderDetailVO();
        BeanUtils.copyProperties(detail, vo);
        return vo;
    }
}
