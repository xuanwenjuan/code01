package com.liquor.brewing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.entity.SysUser;

public interface SysUserService {

    IPage<SysUser> page(String keyword, Integer roleId, Integer status, PageQuery pageQuery);

    SysUser getById(Long id);

    void add(SysUser user);

    void update(SysUser user);

    void delete(Long id);

    void updateStatus(Long id, Integer status);

    void resetPassword(Long id);
}
