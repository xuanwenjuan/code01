package com.mining.maintenance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mining.maintenance.dto.EquipmentAssetDTO;
import com.mining.maintenance.entity.EquipmentAsset;
import com.mining.maintenance.entity.EquipmentCategory;
import com.mining.maintenance.exception.BusinessException;
import com.mining.maintenance.mapper.EquipmentAssetMapper;
import com.mining.maintenance.service.EquipmentAssetService;
import com.mining.maintenance.service.EquipmentCategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class EquipmentAssetServiceImpl extends ServiceImpl<EquipmentAssetMapper, EquipmentAsset> implements EquipmentAssetService {

    @Autowired
    private EquipmentCategoryService equipmentCategoryService;

    @Override
    public void addEquipment(EquipmentAssetDTO dto) {
        LambdaQueryWrapper<EquipmentAsset> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentAsset::getEquipmentCode, dto.getEquipmentCode());
        if (count(wrapper) > 0) {
            throw new BusinessException("设备编码已存在");
        }

        EquipmentCategory category = equipmentCategoryService.getById(dto.getCategoryId());
        if (category == null) {
            throw new BusinessException("设备类目不存在");
        }
        if (category.getStatus() == 0) {
            throw new BusinessException("该类目已淘汰下线，不允许录入设备");
        }

        EquipmentAsset asset = new EquipmentAsset();
        BeanUtils.copyProperties(dto, asset);
        if (dto.getMaintenanceCycleDays() == null) {
            asset.setMaintenanceCycleDays(90);
        }
        if (dto.getStatus() == null) {
            asset.setStatus("NORMAL");
        }
        asset.setWarningFlag(0);
        save(asset);
    }

    @Override
    public void updateEquipment(EquipmentAssetDTO dto) {
        EquipmentAsset exist = getById(dto.getId());
        if (exist == null) {
            throw new BusinessException("设备不存在");
        }

        LambdaQueryWrapper<EquipmentAsset> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EquipmentAsset::getEquipmentCode, dto.getEquipmentCode())
                .ne(EquipmentAsset::getId, dto.getId());
        if (count(wrapper) > 0) {
            throw new BusinessException("设备编码已存在");
        }

        EquipmentAsset asset = new EquipmentAsset();
        BeanUtils.copyProperties(dto, asset);
        updateById(asset);
    }

    @Override
    public void deleteEquipment(Long id) {
        removeById(id);
    }

    @Override
    public Page<EquipmentAsset> pageQuery(int page, int size, String miningArea, String status, String keyword) {
        Page<EquipmentAsset> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<EquipmentAsset> wrapper = new LambdaQueryWrapper<>();
        if (miningArea != null && !miningArea.isEmpty()) {
            wrapper.eq(EquipmentAsset::getMiningArea, miningArea);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(EquipmentAsset::getStatus, status);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(EquipmentAsset::getEquipmentName, keyword)
                    .or().like(EquipmentAsset::getEquipmentCode, keyword));
        }
        wrapper.orderByDesc(EquipmentAsset::getCreateTime);
        return page(pageParam, wrapper);
    }

    @Override
    public List<EquipmentAsset> getWarningList() {
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7);
        LambdaQueryWrapper<EquipmentAsset> wrapper = new LambdaQueryWrapper<>();
        wrapper.le(EquipmentAsset::getNextMaintenanceDate, warningDate)
                .eq(EquipmentAsset::getWarningFlag, 0)
                .orderByAsc(EquipmentAsset::getNextMaintenanceDate);
        return list(wrapper);
    }

    @Override
    public void updateStatus(Long id, String status) {
        EquipmentAsset asset = getById(id);
        if (asset == null) {
            throw new BusinessException("设备不存在");
        }
        asset.setStatus(status);
        updateById(asset);
    }

    @Override
    public void refreshMaintenanceDate(Long id) {
        EquipmentAsset asset = getById(id);
        if (asset == null) {
            throw new BusinessException("设备不存在");
        }
        LocalDate today = LocalDate.now();
        asset.setLastMaintenanceDate(today);
        int cycleDays = asset.getMaintenanceCycleDays() != null ? asset.getMaintenanceCycleDays() : 90;
        asset.setNextMaintenanceDate(today.plusDays(cycleDays));
        updateById(asset);
    }
}