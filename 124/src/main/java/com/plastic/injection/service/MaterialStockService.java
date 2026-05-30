package com.plastic.injection.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.plastic.injection.annotation.OperationLog;
import com.plastic.injection.common.ResultCode;
import com.plastic.injection.context.UserContext;
import com.plastic.injection.dto.DefectiveScrapDTO;
import com.plastic.injection.dto.MaterialInboundDTO;
import com.plastic.injection.dto.MaterialStockDTO;
import com.plastic.injection.enums.StockStatusEnum;
import com.plastic.injection.exception.BusinessException;
import com.plastic.injection.mapper.MaterialStockMapper;
import com.plastic.injection.po.MaterialStockPO;
import com.plastic.injection.vo.MaterialStockVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialStockService {

    private final MaterialStockMapper materialStockMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String HYGROSCOPIC_WARNING_KEY = "hygroscopic:warnings";

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "原料入库")
    public void inbound(MaterialInboundDTO dto) {
        String operator = UserContext.getUsername();

        for (MaterialInboundDTO.MaterialItemDTO item : dto.getItems()) {
            LambdaQueryWrapper<MaterialStockPO> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MaterialStockPO::getBatchNo, item.getBatchNo());
            MaterialStockPO exist = materialStockMapper.selectOne(wrapper);

            if (exist != null) {
                exist.setQuantity(exist.getQuantity().add(item.getQuantity()));
                exist.setUpdateBy(operator);
                exist.setUpdateTime(LocalDateTime.now());
                updateStockStatus(exist);
                materialStockMapper.updateById(exist);
            } else {
                MaterialStockPO po = new MaterialStockPO();
                BeanUtils.copyProperties(item, po);
                po.setLockedQuantity(BigDecimal.ZERO);
                po.setStockStatus(StockStatusEnum.SUFFICIENT.getCode());
                po.setCreateBy(operator);
                po.setUpdateBy(operator);

                if (item.getProductionDate() != null && item.getShelfLife() != null) {
                    po.setExpireDate(item.getProductionDate().plusMonths(item.getShelfLife()));
                }

                materialStockMapper.insert(po);
            }
        }

        checkHygroscopicWarning();
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "新增/更新原料")
    public void saveMaterial(MaterialStockDTO dto) {
        String operator = UserContext.getUsername();
        MaterialStockPO po;

        if (dto.getId() != null) {
            po = materialStockMapper.selectById(dto.getId());
            if (po == null) {
                throw new BusinessException(ResultCode.MATERIAL_NOT_FOUND);
            }
            BeanUtils.copyProperties(dto, po);
        } else {
            po = new MaterialStockPO();
            BeanUtils.copyProperties(dto, po);
            po.setLockedQuantity(BigDecimal.ZERO);
            po.setCreateBy(operator);
        }

        po.setUpdateBy(operator);
        updateStockStatus(po);

        if (dto.getId() == null) {
            materialStockMapper.insert(po);
        } else {
            materialStockMapper.updateById(po);
        }

        checkHygroscopicWarning();
    }

    public Page<MaterialStockVO> pageQuery(Integer pageNum, Integer pageSize, String materialName,
                                            String materialCode, Integer stockStatus, Integer isHygroscopic) {
        Page<MaterialStockPO> page = new Page<>(pageNum, pageSize);
        Page<MaterialStockPO> resultPage = materialStockMapper.selectByConditions(
                page, materialName, materialCode, stockStatus, isHygroscopic);

        Page<MaterialStockVO> voPage = new Page<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal());
        List<MaterialStockVO> voList = resultPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);

        return voPage;
    }

    public MaterialStockVO getById(Long id) {
        MaterialStockPO po = materialStockMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_FOUND);
        }
        return convertToVO(po);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "锁定库存")
    public void lockStock(Long id, BigDecimal quantity) {
        String operator = UserContext.getUsername();
        int result = materialStockMapper.lockStock(id, quantity, operator);
        if (result == 0) {
            throw new BusinessException(ResultCode.MATERIAL_INSUFFICIENT.getCode(), "库存不足，锁定失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "解锁并扣减库存")
    public void unlockAndConsumeStock(Long id, BigDecimal lockQuantity, BigDecimal actualQuantity) {
        String operator = UserContext.getUsername();
        int result = materialStockMapper.unlockAndConsumeStock(id, lockQuantity, actualQuantity, operator);
        if (result == 0) {
            throw new BusinessException(ResultCode.MATERIAL_LOCKED.getCode(), "解锁库存失败");
        }

        MaterialStockPO po = materialStockMapper.selectById(id);
        updateStockStatus(po);
        materialStockMapper.updateById(po);
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "次品报废")
    public void defectiveScrap(DefectiveScrapDTO dto) {
        String operator = UserContext.getUsername();
        MaterialStockPO po = materialStockMapper.selectById(dto.getMaterialId());
        if (po == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_FOUND);
        }

        po.setQuantity(po.getQuantity().subtract(dto.getScrapQuantity()));
        po.setUpdateBy(operator);
        updateStockStatus(po);
        materialStockMapper.updateById(po);
    }

    private void updateStockStatus(MaterialStockPO po) {
        BigDecimal availableQuantity = po.getQuantity().subtract(
                po.getLockedQuantity() != null ? po.getLockedQuantity() : BigDecimal.ZERO);

        if (availableQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            po.setStockStatus(StockStatusEnum.STOP_PURCHASE.getCode());
        } else if (po.getWarningQuantity() != null &&
                availableQuantity.compareTo(po.getWarningQuantity()) <= 0) {
            po.setStockStatus(StockStatusEnum.WARNING.getCode());
        } else {
            po.setStockStatus(StockStatusEnum.SUFFICIENT.getCode());
        }
    }

    private void checkHygroscopicWarning() {
        LambdaQueryWrapper<MaterialStockPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MaterialStockPO::getIsHygroscopic, 1)
                .gt(MaterialStockPO::getQuantity, 0)
                .le(MaterialStockPO::getExpireDate, LocalDate.now().plusMonths(1));

        List<MaterialStockPO> list = materialStockMapper.selectList(wrapper);
        List<String> warnings = new ArrayList<>();

        for (MaterialStockPO material : list) {
            warnings.add(String.format("【受潮预警】原料：%s，批次：%s，即将过期请尽快使用",
                    material.getMaterialName(), material.getBatchNo()));
        }

        if (!warnings.isEmpty()) {
            redisTemplate.opsForValue().set(HYGROSCOPIC_WARNING_KEY, warnings);
        } else {
            redisTemplate.delete(HYGROSCOPIC_WARNING_KEY);
        }
    }

    public List<String> getWarnings() {
        Object warnings = redisTemplate.opsForValue().get(HYGROSCOPIC_WARNING_KEY);
        if (warnings instanceof List) {
            return (List<String>) warnings;
        }
        return new ArrayList<>();
    }

    private MaterialStockVO convertToVO(MaterialStockPO po) {
        MaterialStockVO vo = new MaterialStockVO();
        BeanUtils.copyProperties(po, vo);

        BigDecimal locked = po.getLockedQuantity() != null ? po.getLockedQuantity() : BigDecimal.ZERO;
        vo.setAvailableQuantity(po.getQuantity().subtract(locked));

        StockStatusEnum statusEnum = StockStatusEnum.getByCode(po.getStockStatus());
        if (statusEnum != null) {
            vo.setStockStatusDesc(statusEnum.getDesc());
        }

        return vo;
    }

    @Transactional(rollbackFor = Exception.class)
    @OperationLog(module = "原料库存", description = "删除原料")
    public void deleteById(Long id) {
        MaterialStockPO po = materialStockMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ResultCode.MATERIAL_NOT_FOUND);
        }
        materialStockMapper.deleteById(id);
    }
}
