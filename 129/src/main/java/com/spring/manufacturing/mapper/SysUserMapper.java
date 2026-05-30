package com.spring.manufacturing.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spring.manufacturing.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}