package com.heritage.dye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.heritage.dye.annotation.OperationLog;
import com.heritage.dye.annotation.RequireRole;
import com.heritage.dye.common.BusinessException;
import com.heritage.dye.dto.MaterialOriginDTO;
import com.heritage.dye.mapper.MaterialOriginMapper;
import com.heritage.dye.po.MaterialOriginPO;
import com.heritage.dye.vo.MaterialOriginVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialOriginService extends ServiceImpl<MaterialOriginMapper, MaterialOriginPO> {

    private static final String ORIGIN_CACHE_KEY = "dye:origin:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin", "purchaser", "warehouse"})
    @OperationLog(module = "原料产地", operation = "新增产地")
    public void create(MaterialOriginDTO dto) {
        LambdaQueryWrapper<MaterialOriginPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialOriginPO::getOriginCode, dto.getOriginCode());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("产地编码已存在");
        }
        MaterialOriginPO po = new MaterialOriginPO();
        BeanUtils.copyProperties(dto, po);
        po.setLockedStock(BigDecimal.ZERO);
        baseMapper.insert(po);
        clearCache(po.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin", "purchaser", "warehouse"})
    @OperationLog(module = "原料产地", operation = "更新产地")
    public void update(MaterialOriginDTO dto) {
        MaterialOriginPO po = baseMapper.selectById(dto.getId());
        if (po == null) {
            throw new BusinessException("产地不存在");
        }
        LambdaQueryWrapper<MaterialOriginPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialOriginPO::getOriginCode, dto.getOriginCode())
                .ne(MaterialOriginPO::getId, dto.getId());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("产地编码已存在");
        }
        BeanUtils.copyProperties(dto, po);
        baseMapper.updateById(po);
        clearCache(po.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin"})
    @OperationLog(module = "原料产地", operation = "删除产地")
    public void delete(Long id) {
        baseMapper.deleteById(id);
        clearCache(id);
    }

    public MaterialOriginVO getById(Long id) {
        String cacheKey = ORIGIN_CACHE_KEY + id;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (MaterialOriginVO) cached;
        }
        MaterialOriginPO po = baseMapper.selectById(id);
        if (po == null) {
            throw new BusinessException("产地不存在");
        }
        MaterialOriginVO vo = convertToVO(po);
        redisTemplate.opsForValue().set(cacheKey, vo, 1, java.util.concurrent.TimeUnit.HOURS);
        return vo;
    }

    public Page<MaterialOriginVO> page(Integer pageNum, Integer pageSize, String keyword,
                                       Integer status, String harvestSeason) {
        Page<MaterialOriginPO> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<MaterialOriginPO> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(MaterialOriginPO::getStatus, status);
        }
        if (harvestSeason != null && !harvestSeason.isEmpty()) {
            wrapper.like(MaterialOriginPO::getHarvestSeason, harvestSeason);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(MaterialOriginPO::getOriginName, keyword)
                    .or().like(MaterialOriginPO::getOriginCode, keyword)
                    .or().like(MaterialOriginPO::getRegion, keyword));
        }
        wrapper.orderByDesc(MaterialOriginPO::getCreateTime);
        Page<MaterialOriginPO> result = baseMapper.selectPage(page, wrapper);
        Page<MaterialOriginVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        voPage.setRecords(result.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList()));
        return voPage;
    }

    public List<MaterialOriginVO> listWarnings() {
        LambdaQueryWrapper<MaterialOriginPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.le(MaterialOriginPO::getCurrentStock, MaterialOriginPO::getWarningThreshold))
                .eq(MaterialOriginPO::getStatus, 1)
                .orderByAsc(MaterialOriginPO::getCurrentStock);
        List<MaterialOriginPO> list = baseMapper.selectList(wrapper);
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    private MaterialOriginVO convertToVO(MaterialOriginPO po) {
        MaterialOriginVO vo = new MaterialOriginVO();
        BeanUtils.copyProperties(po, vo);
        vo.setWarning(po.getCurrentStock().compareTo(po.getWarningThreshold()) <= 0);
        return vo;
    }

    public List<MaterialOriginVO> listAll() {
        LambdaQueryWrapper<MaterialOriginPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialOriginPO::getStatus, 1)
                .orderByDesc(MaterialOriginPO::getCreateTime);
        List<MaterialOriginPO> list = baseMapper.selectList(wrapper);
        return list.stream().map(this::convertToVO).collect(Collectors.toList());
    }

    private void clearCache(Long id) {
        redisTemplate.delete(ORIGIN_CACHE_KEY + id);
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean lockStock(Long id, BigDecimal quantity) {
        int rows = baseMapper.lockStock(id, quantity);
        return rows > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean unlockStock(Long id, BigDecimal quantity) {
        int rows = baseMapper.unlockStock(id, quantity);
        return rows > 0;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deductLockedStock(Long id, BigDecimal quantity) {
        int rows = baseMapper.deductLockedStock(id, quantity);
        return rows > 0;
    }
}
