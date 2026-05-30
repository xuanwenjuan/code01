package com.mushroom.traceability.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mushroom.traceability.entity.AreaQuota;
import com.mushroom.traceability.exception.BusinessException;
import com.mushroom.traceability.mapper.AreaQuotaMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AreaQuotaService extends ServiceImpl<AreaQuotaMapper, AreaQuota> {

    public AreaQuota getOrCreateQuota(Long areaId, String areaCode) {
        LocalDate today = LocalDate.now();
        String quotaPeriod = today.getYear() + "-" + today.getMonthValue();

        LambdaQueryWrapper<AreaQuota> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AreaQuota::getAreaId, areaId);
        wrapper.eq(AreaQuota::getQuotaPeriod, quotaPeriod);
        AreaQuota quota = getOne(wrapper);

        if (quota == null) {
            quota = new AreaQuota();
            quota.setAreaId(areaId);
            quota.setAreaCode(areaCode);
            quota.setQuotaPeriod(quotaPeriod);
            quota.setTotalQuota(new BigDecimal("10000"));
            quota.setUsedQuota(BigDecimal.ZERO);
            quota.setLockedQuota(BigDecimal.ZERO);
            quota.setStatus(1);
            quota.setQuotaDate(today.atStartOfDay());
            save(quota);
        }
        return quota;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockQuota(Long areaId, String areaCode, BigDecimal amount) {
        AreaQuota quota = getOrCreateQuota(areaId, areaCode);
        BigDecimal available = quota.getTotalQuota().subtract(quota.getUsedQuota()).subtract(quota.getLockedQuota());
        if (available.compareTo(amount) < 0) {
            throw new BusinessException("产区采收额度不足，剩余可用: " + available + "kg");
        }
        quota.setLockedQuota(quota.getLockedQuota().add(amount));
        return updateById(quota);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean unlockQuota(Long areaId, String areaCode, BigDecimal amount) {
        AreaQuota quota = getOrCreateQuota(areaId, areaCode);
        if (quota.getLockedQuota().compareTo(amount) < 0) {
            throw new BusinessException("锁定额度不足");
        }
        quota.setLockedQuota(quota.getLockedQuota().subtract(amount));
        return updateById(quota);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean consumeQuota(Long areaId, String areaCode, BigDecimal amount) {
        AreaQuota quota = getOrCreateQuota(areaId, areaCode);
        if (quota.getLockedQuota().compareTo(amount) < 0) {
            throw new BusinessException("锁定额度不足");
        }
        quota.setLockedQuota(quota.getLockedQuota().subtract(amount));
        quota.setUsedQuota(quota.getUsedQuota().add(amount));
        return updateById(quota);
    }
}