package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.instrument.consignment.dto.ProfitShareCreateDTO;
import com.instrument.consignment.enums.*;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.*;
import com.instrument.consignment.po.*;
import com.instrument.consignment.vo.ProfitShareVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfitShareService {

    private final ProfitShareMapper shareMapper;
    private final InstrumentArchiveMapper archiveMapper;
    private final RefurbishWorkOrderMapper workOrderMapper;
    private final InstrumentCategoryMapper categoryMapper;
    private final MaterialLockMapper materialLockMapper;
    private final OperationLogMapper operationLogMapper;
    private final ObjectMapper objectMapper;

    @Transactional(rollbackFor = Exception.class)
    public Long createProfitShare(ProfitShareCreateDTO dto, Long operatorId, String operatorName) {
        InstrumentArchivePO archive = archiveMapper.selectById(dto.getArchiveId());
        if (archive == null) {
            throw new BusinessException("乐器档案不存在");
        }

        if (!ArchiveStatusEnum.TO_SELL.getCode().equals(archive.getStatus())) {
            throw new BusinessException("只有待寄售状态的乐器才能创建分账");
        }

        RefurbishWorkOrderPO workOrder = workOrderMapper.selectById(dto.getWorkOrderId());
        if (workOrder == null) {
            throw new BusinessException("工单不存在");
        }

        InstrumentCategoryPO category = categoryMapper.selectById(archive.getCategoryId());

        ProfitSharePO share = new ProfitSharePO();
        share.setShareNo("PS" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        share.setArchiveId(dto.getArchiveId());
        share.setTraceNo(archive.getTraceNo());
        share.setWorkOrderId(dto.getWorkOrderId());
        share.setCategoryId(archive.getCategoryId());
        share.setReceiveChannel(dto.getReceiveChannel());
        share.setSalePrice(dto.getSalePrice());

        BigDecimal materialCost = calculateMaterialCost(dto.getWorkOrderId());
        BigDecimal laborCost = calculateLaborCost(workOrder);
        BigDecimal commissionRate = calculateCommissionRate(category, dto.getReceiveChannel());
        BigDecimal platformCommission = dto.getSalePrice().multiply(commissionRate)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal otherCost = dto.getOtherCost() != null ? dto.getOtherCost() : BigDecimal.ZERO;
        BigDecimal totalCost = materialCost.add(laborCost).add(platformCommission).add(otherCost);
        BigDecimal sellerProfit = dto.getSalePrice().subtract(totalCost);

        share.setMaterialCost(materialCost);
        share.setLaborCost(laborCost);
        share.setPlatformCommissionRate(commissionRate);
        share.setPlatformCommission(platformCommission);
        share.setOtherCost(otherCost);
        share.setTotalCost(totalCost);
        share.setSellerProfit(sellerProfit);
        share.setStatus(ShareStatusEnum.PENDING.getCode());
        share.setRemark(dto.getRemark());

        shareMapper.insert(share);

        archive.setStatus(ArchiveStatusEnum.SOLD.getCode());
        archive.setSalePrice(dto.getSalePrice());
        archiveMapper.updateById(archive);

        saveOperationLog(BizTypeEnum.SHARE, share.getId(), OperationTypeEnum.CREATE,
                "创建分账记录", null, share, operatorId, operatorName);

        return share.getId();
    }

    private BigDecimal calculateMaterialCost(Long workOrderId) {
        List<MaterialLockPO> locks = materialLockMapper.selectList(
                new LambdaQueryWrapper<MaterialLockPO>()
                        .eq(MaterialLockPO::getWorkOrderId, workOrderId)
                        .eq(MaterialLockPO::getStatus, 2)
        );
        return locks.stream()
                .map(MaterialLockPO::getLockAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateLaborCost(RefurbishWorkOrderPO workOrder) {
        return workOrder.getActualLaborCost() != null ? workOrder.getActualLaborCost() : BigDecimal.ZERO;
    }

    private BigDecimal calculateCommissionRate(InstrumentCategoryPO category, String channel) {
        BigDecimal baseRate = new BigDecimal("10");

        if (category != null) {
            CategoryTypeEnum type = CategoryTypeEnum.valueOf(category.getCategoryType());
            switch (type) {
                case CLASSIC -> baseRate = new BigDecimal("12");
                case STRING -> baseRate = new BigDecimal("10");
                case WIND -> baseRate = new BigDecimal("11");
                case PERCUSSION -> baseRate = new BigDecimal("9");
            }
        }

        if ("ONLINE".equals(channel)) {
            baseRate = baseRate.add(new BigDecimal("2"));
        } else if ("OFFLINE".equals(channel)) {
            baseRate = baseRate.add(new BigDecimal("1"));
        }

        return baseRate;
    }

    @Transactional(rollbackFor = Exception.class)
    public void settleProfitShare(Long id, Long operatorId, String operatorName) {
        ProfitSharePO share = shareMapper.selectById(id);
        if (share == null) {
            throw new BusinessException("分账记录不存在");
        }

        if (!ShareStatusEnum.PENDING.getCode().equals(share.getStatus())) {
            throw new BusinessException("只有待结算状态的分账记录才能结算");
        }

        String beforeContent = toJsonString(share);

        share.setStatus(ShareStatusEnum.SETTLED.getCode());
        share.setSettleTime(LocalDateTime.now());
        share.setOperatorId(operatorId);
        shareMapper.updateById(share);

        saveOperationLog(BizTypeEnum.SHARE, id, OperationTypeEnum.UPDATE,
                "分账结算", beforeContent, share, operatorId, operatorName);
    }

    public Page<ProfitShareVO> getProfitSharePage(int page, int size, String status, Long categoryId, String receiveChannel) {
        Page<ProfitSharePO> pageParam = new Page<>(page, size);
        Page<ProfitSharePO> poPage = shareMapper.selectPage(pageParam,
                new LambdaQueryWrapper<ProfitSharePO>()
                        .eq(status != null, ProfitSharePO::getStatus, status)
                        .eq(categoryId != null, ProfitSharePO::getCategoryId, categoryId)
                        .eq(receiveChannel != null, ProfitSharePO::getReceiveChannel, receiveChannel)
                        .orderByDesc(ProfitSharePO::getCreateTime)
        );

        Page<ProfitShareVO> voPage = new Page<>(poPage.getCurrent(), poPage.getSize(), poPage.getTotal());
        voPage.setRecords(poPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    public ProfitShareVO getProfitShareDetail(Long id) {
        ProfitSharePO share = shareMapper.selectById(id);
        return convertToVO(share);
    }

    private ProfitShareVO convertToVO(ProfitSharePO po) {
        ProfitShareVO vo = new ProfitShareVO();
        BeanUtils.copyProperties(po, vo);
        vo.setStatusDesc(ShareStatusEnum.getDescByCode(po.getStatus()));
        vo.setReceiveChannelDesc(ReceiveChannelEnum.getDescByCode(po.getReceiveChannel()));
        return vo;
    }

    private void saveOperationLog(BizTypeEnum bizType, Long bizId, OperationTypeEnum operationType,
                                   String operationDesc, Object beforeContent, Object afterContent,
                                   Long operatorId, String operatorName) {
        OperationLogPO log = new OperationLogPO();
        log.setBizType(bizType.getCode());
        log.setBizId(bizId);
        log.setOperationType(operationType.getCode());
        log.setOperationDesc(operationDesc);
        log.setBeforeContent(toJsonString(beforeContent));
        log.setAfterContent(toJsonString(afterContent));
        log.setOperatorId(operatorId);
        log.setOperatorName(operatorName);
        log.setCreateTime(LocalDateTime.now());
        operationLogMapper.insert(log);
    }

    private String toJsonString(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
