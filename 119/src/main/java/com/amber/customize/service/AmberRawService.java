package com.amber.customize.service;

import com.amber.customize.dto.AmberRawDTO;
import com.amber.customize.dto.AmberRawQueryDTO;
import com.amber.customize.entity.AmberRaw;
import com.amber.customize.enums.RawStatusEnum;
import com.amber.customize.exception.BusinessException;
import com.amber.customize.mapper.AmberRawMapper;
import com.amber.customize.util.BeanConvertUtil;
import com.amber.customize.vo.AmberRawVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AmberRawService extends ServiceImpl<AmberRawMapper, AmberRaw> {

    public Page<AmberRawVO> page(int page, int size, AmberRawQueryDTO queryDTO) {
        LambdaQueryWrapper<AmberRaw> wrapper = new LambdaQueryWrapper<>();
        if (queryDTO != null) {
            if (queryDTO.getOrigin() != null && !queryDTO.getOrigin().isEmpty()) {
                wrapper.like(AmberRaw::getOrigin, queryDTO.getOrigin());
            }
            if (queryDTO.getClarity() != null && !queryDTO.getClarity().isEmpty()) {
                wrapper.like(AmberRaw::getClarity, queryDTO.getClarity());
            }
            if (queryDTO.getStatus() != null) {
                wrapper.eq(AmberRaw::getStatus, queryDTO.getStatus());
            }
        }
        wrapper.orderByDesc(AmberRaw::getCreateTime);
        Page<AmberRaw> rawPage = page(new Page<>(page, size), wrapper);
        Page<AmberRawVO> voPage = new Page<>(rawPage.getCurrent(), rawPage.getSize(), rawPage.getTotal());
        voPage.setRecords(rawPage.getRecords().stream().map(this::convertToVO).toList());
        return voPage;
    }

    public AmberRawVO getDetail(Long id) {
        AmberRaw raw = getById(id);
        if (raw == null) {
            throw new BusinessException("原石不存在");
        }
        return convertToVO(raw);
    }

    public AmberRawVO getByTraceCode(String traceCode) {
        AmberRaw raw = getOne(new LambdaQueryWrapper<AmberRaw>()
                .eq(AmberRaw::getTraceCode, traceCode));
        if (raw == null) {
            throw new BusinessException("原石不存在");
        }
        return convertToVO(raw);
    }

    public List<AmberRawVO> getWeatheringWarning() {
        LocalDate warningDate = LocalDate.now().minusDays(365);
        List<AmberRaw> list = list(new LambdaQueryWrapper<AmberRaw>()
                .le(AmberRaw::getStorageDate, warningDate)
                .orderByAsc(AmberRaw::getStorageDate));
        return list.stream().map(this::convertToVO).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(AmberRawDTO dto) {
        AmberRaw raw = BeanConvertUtil.convert(dto, AmberRaw::new);
        raw.setTraceCode("AMBER-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        if (raw.getStorageDate() == null) {
            raw.setStorageDate(LocalDate.now());
        }
        raw.setLocked(0);
        save(raw);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(AmberRawDTO dto) {
        AmberRaw exist = getById(dto.getId());
        if (exist == null) {
            throw new BusinessException("原石不存在");
        }
        if (exist.getLocked() == 1 && !exist.getLockOrderId().equals(dto.getId())) {
            throw new BusinessException("原石已被锁定，无法修改");
        }
        AmberRaw raw = BeanConvertUtil.convert(dto, AmberRaw::new);
        updateById(raw);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        AmberRaw raw = getById(id);
        if (raw == null) {
            throw new BusinessException("原石不存在");
        }
        if (raw.getLocked() == 1) {
            throw new BusinessException("原石已被锁定，无法删除");
        }
        removeById(id);
    }

    public boolean isRawAvailable(Long rawId) {
        AmberRaw raw = getById(rawId);
        return raw != null && raw.getStatus() == 1 && (raw.getLocked() == null || raw.getLocked() == 0);
    }

    @Transactional(rollbackFor = Exception.class)
    public void lockRaw(Long rawId, Long orderId) {
        AmberRaw raw = getById(rawId);
        if (raw == null) {
            throw new BusinessException("原石不存在");
        }
        if (raw.getLocked() != null && raw.getLocked() == 1) {
            throw new BusinessException("原石已被锁定");
        }
        raw.setLocked(1);
        raw.setLockOrderId(orderId);
        updateById(raw);
    }

    @Transactional(rollbackFor = Exception.class)
    public void unlockRaw(Long rawId) {
        AmberRaw raw = getById(rawId);
        if (raw != null) {
            raw.setLocked(0);
            raw.setLockOrderId(null);
            updateById(raw);
        }
    }

    private AmberRawVO convertToVO(AmberRaw raw) {
        AmberRawVO vo = BeanConvertUtil.convert(raw, AmberRawVO::new);
        vo.setStatusDesc(RawStatusEnum.getDescByCode(raw.getStatus()));
        return vo;
    }

}
