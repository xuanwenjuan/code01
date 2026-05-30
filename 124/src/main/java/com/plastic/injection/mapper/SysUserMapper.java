package com.plastic.injection.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.plastic.injection.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
}
