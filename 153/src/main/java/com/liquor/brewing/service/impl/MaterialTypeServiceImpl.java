package com.liquor.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.entity.Material;
import com.liquor.brewing.entity.MaterialType;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.MaterialMapper;
import com.liquor.brewing.mapper.MaterialTypeMapper;
import com.liquor.brewing.service.MaterialTypeService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialTypeServiceImpl extends ServiceImpl<MaterialTypeMapper, MaterialType> implements MaterialTypeService {

    @Resource
    private MaterialMapper materialMapper;

    @Override
    public List<MaterialType> listAll() {
        return list(new LambdaQueryWrapper<MaterialType>().orderByAsc(MaterialType::getSortOrder));
    }

    @Override
    public void add(MaterialType materialType) {
        Long count = count(new LambdaQueryWrapper<MaterialType>()
                .eq(MaterialType::getTypeCode, materialType.getTypeCode()));
        if (count > 0) {
            throw new BusinessException("类型编码已存在");
        }
        save(materialType);
    }

    @Override
    public void update(MaterialType materialType) {
        MaterialType exist = getById(materialType.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!exist.getTypeCode().equals(materialType.getTypeCode())) {
            Long count = count(new LambdaQueryWrapper<MaterialType>()
                    .eq(MaterialType::getTypeCode, materialType.getTypeCode()));
            if (count > 0) {
                throw new BusinessException("类型编码已存在");
            }
        }
        updateById(materialType);
    }

    @Override
    public void delete(Long id) {
        Long count = materialMapper.selectCount(new LambdaQueryWrapper<Material>()
                .eq(Material::getTypeId, id));
        if (count > 0) {
            throw new BusinessException("该类型下存在物料，无法删除");
        }
        removeById(id);
    }
}
