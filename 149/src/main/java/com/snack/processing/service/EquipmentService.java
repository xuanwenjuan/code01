package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.equipment.EquipmentAddDTO;
import com.snack.processing.dto.equipment.EquipmentQueryDTO;
import com.snack.processing.entity.Equipment;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.EquipmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EquipmentService extends ServiceImpl<EquipmentMapper, Equipment> {

    private final EquipmentMapper equipmentMapper;

    @OperationLog(module = "设备管理", operation = "新增设备", description = "新增加工设备")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> addEquipment(EquipmentAddDTO dto) {
        Equipment exists = equipmentMapper.selectOne(new LambdaQueryWrapper<Equipment>()
                .eq(Equipment::getCode, dto.getCode()));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "设备编码已存在");
        }

        Equipment equipment = new Equipment();
        equipment.setCode(dto.getCode());
        equipment.setName(dto.getName());
        equipment.setModel(dto.getModel());
        equipment.setSpecification(dto.getSpecification());
        equipment.setManufacturer(dto.getManufacturer());
        equipment.setPurchaseDate(dto.getPurchaseDate());
        equipment.setWorkshop(dto.getWorkshop());
        equipment.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        equipment.setLastMaintenanceDate(dto.getLastMaintenanceDate());
        equipment.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        equipment.setRemark(dto.getRemark());

        equipmentMapper.insert(equipment);
        return Result.success();
    }

    @OperationLog(module = "设备管理", operation = "更新设备", description = "更新设备信息")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateEquipment(Long id, EquipmentAddDTO dto) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        Equipment exists = equipmentMapper.selectOne(new LambdaQueryWrapper<Equipment>()
                .eq(Equipment::getCode, dto.getCode())
                .ne(Equipment::getId, id));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "设备编码已存在");
        }

        equipment.setCode(dto.getCode());
        equipment.setName(dto.getName());
        equipment.setModel(dto.getModel());
        equipment.setSpecification(dto.getSpecification());
        equipment.setManufacturer(dto.getManufacturer());
        equipment.setPurchaseDate(dto.getPurchaseDate());
        equipment.setWorkshop(dto.getWorkshop());
        equipment.setStatus(dto.getStatus() != null ? dto.getStatus() : equipment.getStatus());
        equipment.setLastMaintenanceDate(dto.getLastMaintenanceDate());
        equipment.setNextMaintenanceDate(dto.getNextMaintenanceDate());
        equipment.setRemark(dto.getRemark());

        equipmentMapper.updateById(equipment);
        return Result.success();
    }

    @OperationLog(module = "设备管理", operation = "删除设备", description = "删除设备")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteEquipment(Long id) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        equipmentMapper.deleteById(id);
        return Result.success();
    }

    public Result<Equipment> getEquipmentById(Long id) {
        Equipment equipment = equipmentMapper.selectById(id);
        if (equipment == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(equipment);
    }

    public Result<IPage<Equipment>> getEquipmentPage(EquipmentQueryDTO dto) {
        LambdaQueryWrapper<Equipment> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getCode() != null, Equipment::getCode, dto.getCode())
                .like(dto.getName() != null, Equipment::getName, dto.getName())
                .eq(dto.getWorkshop() != null, Equipment::getWorkshop, dto.getWorkshop())
                .eq(dto.getStatus() != null, Equipment::getStatus, dto.getStatus())
                .orderByDesc(Equipment::getCreateTime);

        IPage<Equipment> page = equipmentMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<List<Equipment>> getEquipmentByWorkshop(String workshop) {
        List<Equipment> list = equipmentMapper.selectList(new LambdaQueryWrapper<Equipment>()
                .eq(Equipment::getWorkshop, workshop)
                .eq(Equipment::getStatus, 1)
                .orderByAsc(Equipment::getName));
        return Result.success(list);
    }
}
