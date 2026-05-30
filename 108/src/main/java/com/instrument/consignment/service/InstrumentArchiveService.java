package com.instrument.consignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.instrument.consignment.dto.InstrumentArchiveDTO;
import com.instrument.consignment.entity.InstrumentArchive;
import com.instrument.consignment.entity.InstrumentCategory;
import com.instrument.consignment.enums.ArchiveStatusEnum;
import com.instrument.consignment.exception.BusinessException;
import com.instrument.consignment.mapper.InstrumentArchiveMapper;
import com.instrument.consignment.mapper.InstrumentCategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstrumentArchiveService {

    private final InstrumentArchiveMapper archiveMapper;
    private final InstrumentCategoryMapper categoryMapper;

    public void addArchive(InstrumentArchiveDTO archiveDTO) {
        // 校验类目是否存在且未下架
        InstrumentCategory category = categoryMapper.selectById(archiveDTO.getCategoryId());
        if (category == null) {
            throw new BusinessException("乐器类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该乐器类目已停收下架，无法录入新乐器");
        }

        InstrumentArchive archive = new InstrumentArchive();
        BeanUtils.copyProperties(archiveDTO, archive);
        archive.setTraceNo(generateTraceNo());
        archive.setStatus(ArchiveStatusEnum.TO_REFURBISH.getCode());
        archive.setNextMaintainTime(LocalDateTime.now().plusDays(archive.getMaintainCycleDays() != null ? archive.getMaintainCycleDays() : 180));
        archiveMapper.insert(archive);
    }

    private String generateTraceNo() {
        return "INS" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public void updateArchive(InstrumentArchiveDTO archiveDTO) {
        InstrumentArchive archive = archiveMapper.selectById(archiveDTO.getId());
        if (archive == null) {
            throw new BusinessException("乐器档案不存在");
        }

        // 如果修改了类目，需要校验新类目状态
        if (archiveDTO.getCategoryId() != null && !archiveDTO.getCategoryId().equals(archive.getCategoryId())) {
            InstrumentCategory newCategory = categoryMapper.selectById(archiveDTO.getCategoryId());
            if (newCategory == null) {
                throw new BusinessException("新乐器类目不存在");
            }
            if (newCategory.getStatus() == 0) {
                throw new BusinessException("该乐器类目已停收下架，无法修改为该类目");
            }
        }

        BeanUtils.copyProperties(archiveDTO, archive);
        archiveMapper.updateById(archive);
    }

    public void deleteArchive(Long id) {
        archiveMapper.deleteById(id);
    }

    public InstrumentArchive getArchiveById(Long id) {
        return archiveMapper.selectById(id);
    }

    public InstrumentArchive getArchiveByTraceNo(String traceNo) {
        return archiveMapper.selectOne(
                new LambdaQueryWrapper<InstrumentArchive>()
                        .eq(InstrumentArchive::getTraceNo, traceNo)
        );
    }

    public Page<InstrumentArchive> getArchivePage(int page, int size, String status, Long categoryId) {
        Page<InstrumentArchive> pageParam = new Page<>(page, size);
        return archiveMapper.selectPage(pageParam,
                new LambdaQueryWrapper<InstrumentArchive>()
                        .eq(status != null, InstrumentArchive::getStatus, status)
                        .eq(categoryId != null, InstrumentArchive::getCategoryId, categoryId)
                        .orderByDesc(InstrumentArchive::getCreateTime)
        );
    }

    public void updateArchiveStatus(Long id, String status) {
        InstrumentArchive archive = archiveMapper.selectById(id);
        if (archive == null) {
            throw new BusinessException("乐器档案不存在");
        }
        archive.setStatus(status);
        archiveMapper.updateById(archive);
    }
}
