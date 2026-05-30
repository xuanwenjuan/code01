package com.radiator.management.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.radiator.management.entity.Warehouse;
import com.radiator.management.entity.WarehouseLocation;
import com.radiator.management.exception.BusinessException;
import com.radiator.management.mapper.WarehouseLocationMapper;
import com.radiator.management.mapper.WarehouseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseMapper warehouseMapper;
    private final WarehouseLocationMapper locationMapper;

    @Transactional(rollbackFor = Exception.class)
    public void createWarehouse(Warehouse warehouse) {
        LambdaQueryWrapper<Warehouse> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Warehouse::getWarehouseCode, warehouse.getWarehouseCode());
        if (warehouseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("仓库编码已存在");
        }
        warehouseMapper.insert(warehouse);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateWarehouse(Warehouse warehouse) {
        warehouseMapper.updateById(warehouse);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteWarehouse(Long id) {
        LambdaQueryWrapper<WarehouseLocation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WarehouseLocation::getWarehouseId, id);
        if (locationMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("仓库下存在库位，无法删除");
        }
        warehouseMapper.deleteById(id);
    }

    public Page<Warehouse> listWarehouses(int page, int size, String keyword) {
        LambdaQueryWrapper<Warehouse> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Warehouse::getWarehouseName, keyword)
                    .or().like(Warehouse::getWarehouseCode, keyword));
        }
        wrapper.orderByDesc(Warehouse::getCreateTime);
        return warehouseMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public Warehouse getWarehouseById(Long id) {
        return warehouseMapper.selectById(id);
    }

    public List<Warehouse> getActiveWarehouses() {
        return warehouseMapper.selectList(
                new LambdaQueryWrapper<Warehouse>().eq(Warehouse::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void createLocation(WarehouseLocation location) {
        LambdaQueryWrapper<WarehouseLocation> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WarehouseLocation::getLocationCode, location.getLocationCode());
        if (locationMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("库位编码已存在");
        }
        locationMapper.insert(location);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateLocation(WarehouseLocation location) {
        locationMapper.updateById(location);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteLocation(Long id) {
        locationMapper.deleteById(id);
    }

    public Page<WarehouseLocation> listLocations(int page, int size, Long warehouseId) {
        LambdaQueryWrapper<WarehouseLocation> wrapper = new LambdaQueryWrapper<>();
        if (warehouseId != null) {
            wrapper.eq(WarehouseLocation::getWarehouseId, warehouseId);
        }
        wrapper.orderByDesc(WarehouseLocation::getCreateTime);
        return locationMapper.selectPage(new Page<>(page, size), wrapper);
    }

    public List<WarehouseLocation> getLocationsByWarehouse(Long warehouseId) {
        return locationMapper.selectList(
                new LambdaQueryWrapper<WarehouseLocation>()
                        .eq(WarehouseLocation::getWarehouseId, warehouseId)
                        .eq(WarehouseLocation::getStatus, 1)
        );
    }
}
