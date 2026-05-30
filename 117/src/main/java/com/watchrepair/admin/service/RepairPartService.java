package com.watchrepair.admin.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.watchrepair.admin.common.PageQuery;
import com.watchrepair.admin.dto.RepairPartDTO;
import com.watchrepair.admin.dto.RepairPartQueryDTO;
import com.watchrepair.admin.entity.RepairPart;
import com.watchrepair.admin.enums.InventoryStatusEnum;
import com.watchrepair.admin.exception.BusinessException;
import com.watchrepair.admin.mapper.RepairPartMapper;
import com.watchrepair.admin.vo.RepairPartVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairPartService {

    private final RepairPartMapper partMapper;
    private final StringRedisTemplate redisTemplate;

    private static final String PART_LOCK_KEY = "watch:part:lock:";
    private static final String PART_LIST_KEY = "watch:part:list:";
    private static final long LOCK_EXPIRE_TIME = 1800;

    private void updatePartStatusDesc(RepairPart part) {
        InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                part.getQuantity(), part.getWarningThreshold());
        part.setStatusDesc(status.getDesc());
    }

    private RepairPartVO convertToVO(RepairPart part) {
        RepairPartVO vo = new RepairPartVO();
        BeanUtils.copyProperties(part, vo);
        return vo;
    }

    public Page<RepairPartVO> getPartPage(PageQuery pageQuery, String keyword, Integer status) {
        Page<RepairPart> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());

        LambdaQueryWrapper<RepairPart> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(RepairPart::getPartName, keyword)
                    .or().like(RepairPart::getPartCode, keyword)
                    .or().like(RepairPart::getCompatibleModels, keyword));
        }
        if (status != null) {
            wrapper.eq(RepairPart::getStatus, status);
        }
        wrapper.orderByDesc(RepairPart::getCreateTime);

        Page<RepairPart> result = partMapper.selectPage(page, wrapper);
        result.getRecords().forEach(this::updatePartStatusDesc);

        Page<RepairPartVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList()));
        return voPage;
    }

    public Page<RepairPartVO> queryParts(PageQuery pageQuery, RepairPartQueryDTO queryDTO) {
        Page<RepairPart> page = new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize());

        LambdaQueryWrapper<RepairPart> wrapper = new LambdaQueryWrapper<>();
        
        if (StringUtils.hasText(queryDTO.getPartCode())) {
            wrapper.like(RepairPart::getPartCode, queryDTO.getPartCode());
        }
        if (StringUtils.hasText(queryDTO.getPartName())) {
            wrapper.like(RepairPart::getPartName, queryDTO.getPartName());
        }
        if (StringUtils.hasText(queryDTO.getPartType())) {
            wrapper.eq(RepairPart::getPartType, queryDTO.getPartType());
        }
        if (StringUtils.hasText(queryDTO.getOrigin())) {
            wrapper.like(RepairPart::getOrigin, queryDTO.getOrigin());
        }
        if (StringUtils.hasText(queryDTO.getCompatibleModels())) {
            wrapper.like(RepairPart::getCompatibleModels, queryDTO.getCompatibleModels());
        }
        if (queryDTO.getStatus() != null) {
            wrapper.eq(RepairPart::getStatus, queryDTO.getStatus());
        }
        if (queryDTO.getMoistureProof() != null) {
            wrapper.eq(RepairPart::getMoistureProof, queryDTO.getMoistureProof());
        }
        if (queryDTO.getMinQuantity() != null) {
            wrapper.ge(RepairPart::getQuantity, queryDTO.getMinQuantity());
        }
        if (queryDTO.getMaxQuantity() != null) {
            wrapper.le(RepairPart::getQuantity, queryDTO.getMaxQuantity());
        }
        
        wrapper.orderByDesc(RepairPart::getCreateTime);

        Page<RepairPart> result = partMapper.selectPage(page, wrapper);
        result.getRecords().forEach(this::updatePartStatusDesc);

        Page<RepairPartVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream().map(this::convertToVO).collect(Collectors.toList()));
        return voPage;
    }

    public List<RepairPart> getWarningParts() {
        List<RepairPart> parts = partMapper.selectList(
                new LambdaQueryWrapper<RepairPart>()
                        .apply("quantity <= warning_threshold")
                        .gt(RepairPart::getQuantity, 0)
        );
        parts.forEach(this::updatePartStatusDesc);
        return parts;
    }

    public List<RepairPart> getMoistureProofParts() {
        List<RepairPart> parts = partMapper.selectList(
                new LambdaQueryWrapper<RepairPart>().eq(RepairPart::getMoistureProof, 1)
        );
        parts.forEach(this::updatePartStatusDesc);
        return parts;
    }

    public RepairPart getPartById(Long id) {
        RepairPart part = partMapper.selectById(id);
        if (part != null) {
            updatePartStatusDesc(part);
        }
        return part;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addPart(RepairPartDTO dto) {
        RepairPart exist = partMapper.selectOne(
                new LambdaQueryWrapper<RepairPart>().eq(RepairPart::getPartCode, dto.getPartCode())
        );
        if (exist != null) {
            throw new BusinessException("配件编码已存在");
        }

        RepairPart part = new RepairPart();
        BeanUtils.copyProperties(dto, part);
        if (part.getMoistureProof() == null) {
            part.setMoistureProof(0);
        }
        if (part.getWarningThreshold() == null) {
            part.setWarningThreshold(5);
        }

        InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                part.getQuantity(), part.getWarningThreshold());
        part.setStatus(status.getCode());

        partMapper.insert(part);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updatePart(RepairPartDTO dto) {
        RepairPart exist = partMapper.selectById(dto.getId());
        if (exist == null) {
            throw new BusinessException("配件不存在");
        }

        RepairPart part = new RepairPart();
        BeanUtils.copyProperties(dto, part);

        if (dto.getQuantity() != null && dto.getWarningThreshold() != null) {
            InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                    dto.getQuantity(), dto.getWarningThreshold());
            part.setStatus(status.getCode());
        }

        partMapper.updateById(part);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStock(Long id, Integer quantity) {
        RepairPart part = partMapper.selectById(id);
        if (part == null) {
            throw new BusinessException("配件不存在");
        }
        if (quantity < 0) {
            throw new BusinessException("库存数量不能为负数");
        }
        part.setQuantity(quantity);

        InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                quantity, part.getWarningThreshold());
        part.setStatus(status.getCode());

        partMapper.updateById(part);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public void discontinuePart(Long id) {
        RepairPart part = partMapper.selectById(id);
        if (part == null) {
            throw new BusinessException("配件不存在");
        }
        part.setStatus(InventoryStatusEnum.OUT_OF_STOCK.getCode());
        partMapper.updateById(part);
        clearCache();
    }

    public void deductStock(Long partId, Integer quantity) {
        RepairPart part = partMapper.selectById(partId);
        if (part == null) {
            throw new BusinessException("配件不存在");
        }
        if (part.getQuantity() < quantity) {
            throw new BusinessException("配件库存不足: " + part.getPartName());
        }

        part.setQuantity(part.getQuantity() - quantity);
        InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                part.getQuantity(), part.getWarningThreshold());
        part.setStatus(status.getCode());

        partMapper.updateById(part);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockStock(Long partId, Integer quantity, Long workOrderId) {
        RepairPart part = partMapper.selectById(partId);
        if (part == null) {
            throw new BusinessException("配件不存在");
        }
        if (part.getQuantity() < quantity) {
            throw new BusinessException("配件库存不足: " + part.getPartName());
        }

        String lockKey = PART_LOCK_KEY + workOrderId + ":" + partId;
        String stockKey = PART_LOCK_KEY + "stock:" + partId;

        Integer currentLocked = (Integer) redisTemplate.opsForValue().get(stockKey);
        if (currentLocked != null && (part.getQuantity() - currentLocked) < quantity) {
            throw new BusinessException("配件库存已被锁定，可用库存不足: " + part.getPartName());
        }

        part.setQuantity(part.getQuantity() - quantity);
        InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                part.getQuantity(), part.getWarningThreshold());
        part.setStatus(status.getCode());
        partMapper.updateById(part);

        redisTemplate.opsForValue().set(lockKey, String.valueOf(quantity));
        redisTemplate.expire(lockKey, java.time.Duration.ofSeconds(LOCK_EXPIRE_TIME));
        
        clearCache();
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockStock(Long partId, Integer quantity, Long workOrderId) {
        String lockKey = PART_LOCK_KEY + workOrderId + ":" + partId;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(lockKey))) {
            RepairPart part = partMapper.selectById(partId);
            if (part != null) {
                part.setQuantity(part.getQuantity() + quantity);
                InventoryStatusEnum status = InventoryStatusEnum.calculateStatus(
                        part.getQuantity(), part.getWarningThreshold());
                part.setStatus(status.getCode());
                partMapper.updateById(part);
            }
            redisTemplate.delete(lockKey);
            clearCache();
        }
    }

    private void clearCache() {
        Set<String> keys = redisTemplate.keys(PART_LIST_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}