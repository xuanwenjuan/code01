package com.gearbox.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.gearbox.manage.dto.MaterialQueryDTO;
import com.gearbox.manage.entity.Material;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MaterialMapper extends BaseMapper<Material> {

    IPage<Material> queryByConditions(Page<Material> page, @Param("dto") MaterialQueryDTO dto);
}
