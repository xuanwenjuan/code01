package com.heritage.dye.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.heritage.dye.annotation.OperationLog;
import com.heritage.dye.annotation.RequireRole;
import com.heritage.dye.common.BusinessException;
import com.heritage.dye.dto.DyeCategoryDTO;
import com.heritage.dye.mapper.DyeCategoryMapper;
import com.heritage.dye.po.DyeCategoryPO;
import com.heritage.dye.vo.DyeCategoryVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DyeCategoryService extends ServiceImpl<DyeCategoryMapper, DyeCategoryPO> {

    private static final String CATEGORY_TREE_CACHE_KEY = "dye:category:tree";
    private static final String HOT_CATEGORY_CACHE_KEY = "dye:category:hot:";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin"})
    @OperationLog(module = "染料类目", operation = "新增类目")
    public void create(DyeCategoryDTO dto) {
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getCategoryCode, dto.getCategoryCode());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }
        if (dto.getParentId() != null && dto.getParentId() > 0) {
            DyeCategoryPO parent = baseMapper.selectById(dto.getParentId());
            if (parent == null || parent.getStatus() == 0) {
                throw new BusinessException("父类目不存在或已下架");
            }
        }
        DyeCategoryPO po = new DyeCategoryPO();
        BeanUtils.copyProperties(dto, po);
        baseMapper.insert(po);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin"})
    @OperationLog(module = "染料类目", operation = "更新类目")
    public void update(DyeCategoryDTO dto) {
        DyeCategoryPO po = baseMapper.selectById(dto.getId());
        if (po == null) {
            throw new BusinessException("类目不存在");
        }
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getCategoryCode, dto.getCategoryCode())
                .ne(DyeCategoryPO::getId, dto.getId());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("类目编码已存在");
        }
        if (dto.getParentId() != null && dto.getParentId() > 0) {
            if (dto.getParentId().equals(dto.getId())) {
                throw new BusinessException("不能将自身设为父类目");
            }
            DyeCategoryPO parent = baseMapper.selectById(dto.getParentId());
            if (parent == null || parent.getStatus() == 0) {
                throw new BusinessException("父类目不存在或已下架");
            }
        }
        BeanUtils.copyProperties(dto, po);
        baseMapper.updateById(po);
        clearCache();
    }

    @Transactional(rollbackFor = Exception.class)
    @RequireRole({"admin"})
    @OperationLog(module = "染料类目", operation = "删除类目")
    public void delete(Long id) {
        DyeCategoryPO po = baseMapper.selectById(id);
        if (po == null) {
            throw new BusinessException("类目不存在");
        }
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getParentId, id);
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("存在子类目，无法删除");
        }
        baseMapper.deleteById(id);
        clearCache();
    }

    public DyeCategoryVO getById(Long id) {
        DyeCategoryPO po = baseMapper.selectById(id);
        if (po == null) {
            throw new BusinessException("类目不存在");
        }
        if (po.getStatus() == 0) {
            throw new BusinessException("类目已下架");
        }
        return convertToVO(po);
    }

    @SuppressWarnings("unchecked")
    public List<DyeCategoryVO> tree() {
        Object cached = redisTemplate.opsForValue().get(CATEGORY_TREE_CACHE_KEY);
        if (cached != null) {
            return (List<DyeCategoryVO>) cached;
        }
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getStatus, 1)
                .orderByAsc(DyeCategoryPO::getSortOrder);
        List<DyeCategoryPO> all = baseMapper.selectList(wrapper);
        List<DyeCategoryVO> allVO = all.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        List<DyeCategoryVO> tree = buildTreeStream(allVO, 0L);
        redisTemplate.opsForValue().set(CATEGORY_TREE_CACHE_KEY, tree, 1, java.util.concurrent.TimeUnit.HOURS);
        return tree;
    }

    private List<DyeCategoryVO> buildTreeStream(List<DyeCategoryVO> all, Long parentId) {
        Map<Long, List<DyeCategoryVO>> parentMap = all.stream()
                .collect(Collectors.groupingBy(DyeCategoryVO::getParentId));
        all.forEach(vo -> vo.setChildren(parentMap.getOrDefault(vo.getId(), new ArrayList<>())));
        return all.stream()
                .filter(vo -> parentId.equals(vo.getParentId()))
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    public List<DyeCategoryVO> listByType(Integer categoryType) {
        String cacheKey = HOT_CATEGORY_CACHE_KEY + categoryType;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (List<DyeCategoryVO>) cached;
        }
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getCategoryType, categoryType)
                .eq(DyeCategoryPO::getStatus, 1)
                .orderByAsc(DyeCategoryPO::getSortOrder)
                .last("LIMIT 10");
        List<DyeCategoryPO> list = baseMapper.selectList(wrapper);
        List<DyeCategoryVO> result = list.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        redisTemplate.opsForValue().set(cacheKey, result, 1, java.util.concurrent.TimeUnit.HOURS);
        return result;
    }

    public List<DyeCategoryVO> listAllByType(Integer categoryType, String keyword) {
        LambdaQueryWrapper<DyeCategoryPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DyeCategoryPO::getStatus, 1);
        if (categoryType != null) {
            wrapper.eq(DyeCategoryPO::getCategoryType, categoryType);
        }
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(DyeCategoryPO::getCategoryName, keyword)
                    .or().like(DyeCategoryPO::getCategoryCode, keyword));
        }
        wrapper.orderByAsc(DyeCategoryPO::getSortOrder);
        List<DyeCategoryPO> list = baseMapper.selectList(wrapper);
        return list.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    private DyeCategoryVO convertToVO(DyeCategoryPO po) {
        DyeCategoryVO vo = new DyeCategoryVO();
        BeanUtils.copyProperties(po, vo);
        return vo;
    }

    private void clearCache() {
        redisTemplate.delete(CATEGORY_TREE_CACHE_KEY);
        redisTemplate.delete(redisTemplate.keys(HOT_CATEGORY_CACHE_KEY + "*"));
    }
}
