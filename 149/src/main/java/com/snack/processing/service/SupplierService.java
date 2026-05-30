package com.snack.processing.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.snack.processing.annotation.OperationLog;
import com.snack.processing.common.Result;
import com.snack.processing.common.ResultCode;
import com.snack.processing.dto.supplier.SupplierAddDTO;
import com.snack.processing.dto.supplier.SupplierQueryDTO;
import com.snack.processing.entity.Supplier;
import com.snack.processing.exception.BusinessException;
import com.snack.processing.mapper.SupplierMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService extends ServiceImpl<SupplierMapper, Supplier> {

    private final SupplierMapper supplierMapper;

    @OperationLog(module = "供应商管理", operation = "新增供应商", description = "新增加工供应商")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> addSupplier(SupplierAddDTO dto) {
        Supplier exists = supplierMapper.selectOne(new LambdaQueryWrapper<Supplier>()
                .eq(Supplier::getCode, dto.getCode()));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "供应商编码已存在");
        }

        Supplier supplier = new Supplier();
        supplier.setCode(dto.getCode());
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setContactPhone(dto.getContactPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setBusinessScope(dto.getBusinessScope());
        supplier.setQualification(dto.getQualification());
        supplier.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        supplier.setRemark(dto.getRemark());

        supplierMapper.insert(supplier);
        return Result.success();
    }

    @OperationLog(module = "供应商管理", operation = "更新供应商", description = "更新供应商信息")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateSupplier(Long id, SupplierAddDTO dto) {
        Supplier supplier = supplierMapper.selectById(id);
        if (supplier == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        Supplier exists = supplierMapper.selectOne(new LambdaQueryWrapper<Supplier>()
                .eq(Supplier::getCode, dto.getCode())
                .ne(Supplier::getId, id));

        if (exists != null) {
            throw new BusinessException(ResultCode.DATA_EXISTS, "供应商编码已存在");
        }

        supplier.setCode(dto.getCode());
        supplier.setName(dto.getName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setContactPhone(dto.getContactPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setBusinessScope(dto.getBusinessScope());
        supplier.setQualification(dto.getQualification());
        supplier.setStatus(dto.getStatus() != null ? dto.getStatus() : supplier.getStatus());
        supplier.setRemark(dto.getRemark());

        supplierMapper.updateById(supplier);
        return Result.success();
    }

    @OperationLog(module = "供应商管理", operation = "删除供应商", description = "删除供应商")
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteSupplier(Long id) {
        Supplier supplier = supplierMapper.selectById(id);
        if (supplier == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }

        supplierMapper.deleteById(id);
        return Result.success();
    }

    public Result<Supplier> getSupplierById(Long id) {
        Supplier supplier = supplierMapper.selectById(id);
        if (supplier == null) {
            throw new BusinessException(ResultCode.DATA_NOT_FOUND);
        }
        return Result.success(supplier);
    }

    public Result<IPage<Supplier>> getSupplierPage(SupplierQueryDTO dto) {
        LambdaQueryWrapper<Supplier> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(dto.getCode() != null, Supplier::getCode, dto.getCode())
                .like(dto.getName() != null, Supplier::getName, dto.getName())
                .like(dto.getContactPhone() != null, Supplier::getContactPhone, dto.getContactPhone())
                .eq(dto.getStatus() != null, Supplier::getStatus, dto.getStatus())
                .orderByDesc(Supplier::getCreateTime);

        IPage<Supplier> page = supplierMapper.selectPage(dto.buildPage(), wrapper);
        return Result.success(page);
    }

    public Result<List<Supplier>> getAllEnabledSuppliers() {
        List<Supplier> list = supplierMapper.selectList(new LambdaQueryWrapper<Supplier>()
                .eq(Supplier::getStatus, 1)
                .orderByAsc(Supplier::getName));
        return Result.success(list);
    }
}
