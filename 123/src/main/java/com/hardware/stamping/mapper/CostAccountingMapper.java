package com.hardware.stamping.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hardware.stamping.dto.CostAccountingQueryDTO;
import com.hardware.stamping.entity.CostAccounting;
import com.hardware.stamping.vo.CostAccountingVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CostAccountingMapper extends BaseMapper<CostAccounting> {

    IPage<CostAccountingVO> queryPage(Page<CostAccountingVO> page, @Param("query") CostAccountingQueryDTO query);
}
