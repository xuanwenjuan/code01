package com.amber.polish.service.impl;

import com.amber.polish.common.ResultCode;
import com.amber.polish.dto.RawStoneDTO;
import com.amber.polish.dto.RawStoneQueryDTO;
import com.amber.polish.entity.Category;
import com.amber.polish.entity.RawStone;
import com.amber.polish.enums.RawStoneStatusEnum;
import com.amber.polish.exception.BusinessException;
import com.amber.polish.mapper.CategoryMapper;
import com.amber.polish.mapper.RawStoneMapper;
import com.amber.polish.service.RawStoneService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RawStoneServiceImpl extends ServiceImpl<RawStoneMapper, RawStone> implements RawStoneService {

    private static final String RAW_STONE_LOCK_KEY = "raw_stone:lock:";

    private final CategoryMapper categoryMapper;
    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public Page<RawStone> getRawStonePage(int pageNum, int pageSize, Long categoryId, String status) {
        Page<RawStone> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<RawStone> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(RawStone::getCategoryId, categoryId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(RawStone::getStatus, status);
        }
        wrapper.orderByDesc(RawStone::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    public Page<RawStone> queryRawStoneByConditions(int pageNum, int pageSize, RawStoneQueryDTO queryDTO) {
        Page<RawStone> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<RawStone> wrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getCategoryId() != null) {
            wrapper.eq(RawStone::getCategoryId, queryDTO.getCategoryId());
        }
        if (StringUtils.hasText(queryDTO.getOrigin())) {
            wrapper.like(RawStone::getOrigin, queryDTO.getOrigin());
        }
        if (StringUtils.hasText(queryDTO.getClarity())) {
            wrapper.like(RawStone::getClarity, queryDTO.getClarity());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            wrapper.eq(RawStone::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getMinWeight() != null) {
            wrapper.ge(RawStone::getWeight, queryDTO.getMinWeight());
        }
        if (queryDTO.getMaxWeight() != null) {
            wrapper.le(RawStone::getWeight, queryDTO.getMaxWeight());
        }
        if (StringUtils.hasText(queryDTO.getTraceCode())) {
            wrapper.like(RawStone::getTraceCode, queryDTO.getTraceCode());
        }

        wrapper.orderByDesc(RawStone::getCreateTime);
        return this.page(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean lockRawStone(Long rawStoneId, Long orderId, Long operatorId) {
        RawStone rawStone = this.getById(rawStoneId);
        if (rawStone == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "原石不存在");
        }
        if (!RawStoneStatusEnum.PENDING.getCode().equals(rawStone.getStatus())) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "原石状态不允许锁定");
        }

        String lockKey = RAW_STONE_LOCK_KEY + rawStoneId;
        Boolean locked = stringRedisTemplate.opsForValue().setIfAbsent(lockKey, orderId.toString(), 30, TimeUnit.MINUTES);
        if (locked == null || !locked) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "原石已被其他订单锁定");
        }

        rawStone.setStatus("LOCKED");
        rawStone.setUpdateTime(LocalDateTime.now());
        rawStone.setUpdateBy(operatorId);
        boolean result = this.updateById(rawStone);

        log.info("原石锁定成功: rawStoneId={}, orderId={}, operatorId={}", rawStoneId, orderId, operatorId);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean unlockRawStone(Long rawStoneId, Long operatorId) {
        String lockKey = RAW_STONE_LOCK_KEY + rawStoneId;
        stringRedisTemplate.delete(lockKey);

        RawStone rawStone = this.getById(rawStoneId);
        if (rawStone != null && "LOCKED".equals(rawStone.getStatus())) {
            rawStone.setStatus(RawStoneStatusEnum.PENDING.getCode());
            rawStone.setUpdateTime(LocalDateTime.now());
            rawStone.setUpdateBy(operatorId);
            boolean result = this.updateById(rawStone);
            log.info("原石解锁成功: rawStoneId={}, operatorId={}", rawStoneId, operatorId);
            return result;
        }
        return true;
    }

    @Override
    public boolean addRawStone(RawStoneDTO dto, Long purchaserId) {
        Category category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "品类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "该品类已下架，无法录入原石");
        }

        RawStone rawStone = new RawStone();
        org.springframework.beans.BeanUtils.copyProperties(dto, rawStone);
        String traceCode = generateTraceCode();
        rawStone.setTraceCode(traceCode);
        rawStone.setStatus(RawStoneStatusEnum.PENDING.getCode());
        rawStone.setPurchaserId(purchaserId);
        return this.save(rawStone);
    }

    @Override
    public boolean addRawStone(RawStone rawStone) {
        Category category = categoryMapper.selectById(rawStone.getCategoryId());
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND.getCode(), "品类不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException(ResultCode.FAIL.getCode(), "该品类已下架，无法录入原石");
        }

        String traceCode = generateTraceCode();
        rawStone.setTraceCode(traceCode);
        if (rawStone.getStatus() == null) {
            rawStone.setStatus(RawStoneStatusEnum.PENDING.getCode());
        }
        return this.save(rawStone);
    }

    private String generateTraceCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = this.count(new LambdaQueryWrapper<RawStone>()
                .apply("DATE(create_time) = {0}", LocalDateTime.now().toLocalDate()));
        return String.format("AMB%s%04d", date, count + 1);
    }

    @Override
    public boolean updateRawStoneStatus(Long id, String status) {
        RawStone rawStone = new RawStone();
        rawStone.setId(id);
        rawStone.setStatus(status);
        return this.updateById(rawStone);
    }

    @Override
    public void inspectOverdueStones() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LambdaQueryWrapper<RawStone> wrapper = new LambdaQueryWrapper<>();
        wrapper.le(RawStone::getCreateTime, thirtyDaysAgo)
                .in(RawStone::getStatus, RawStoneStatusEnum.PENDING.getCode(), RawStoneStatusEnum.POLISHING.getCode())
                .and(w -> w.isNull(RawStone::getInspectionTime)
                        .or()
                        .lt(RawStone::getInspectionTime, thirtyDaysAgo));

        List<RawStone> overdueStones = this.list(wrapper);
        for (RawStone stone : overdueStones) {
            stone.setInspectionTime(LocalDateTime.now());
            this.updateById(stone);
        }
    }
}
