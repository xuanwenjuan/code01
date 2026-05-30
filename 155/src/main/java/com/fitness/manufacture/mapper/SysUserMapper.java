package com.fitness.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fitness.manufacture.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    List<String> selectRoleCodesByUserId(@Param("userId") Long userId);

    List<String> selectPermissionsByUserId(@Param("userId") Long userId);
}
