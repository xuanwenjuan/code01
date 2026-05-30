package com.spindle.manage.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.spindle.manage.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    List<String> selectPermissionCodesByUserId(@Param("userId") Long userId);

    List<String> selectRoleCodesByUserId(@Param("userId") Long userId);

}
