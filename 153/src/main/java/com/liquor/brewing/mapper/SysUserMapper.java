package com.liquor.brewing.mapper;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Constants;
import com.liquor.brewing.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {

    @Select("SELECT u.*, r.role_code, r.role_name FROM sys_user u " +
            "LEFT JOIN sys_role r ON u.role_id = r.id " +
            "${ew.customSqlSegment}")
    IPage<SysUser> selectUserPage(IPage<SysUser> page, @Param(Constants.WRAPPER) Wrapper<SysUser> wrapper);

    @Select("SELECT u.*, r.role_code, r.role_name FROM sys_user u " +
            "LEFT JOIN sys_role r ON u.role_id = r.id " +
            "WHERE u.id = #{userId}")
    SysUser selectUserWithRole(Long userId);
}
