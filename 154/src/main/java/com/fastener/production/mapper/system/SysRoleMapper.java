package com.fastener.production.mapper.system;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fastener.production.entity.system.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("SELECT * FROM sys_role WHERE role_code = #{roleCode} AND deleted = 0 LIMIT 1")
    SysRole selectByCode(@Param("roleCode") String roleCode);
}
