package com.gearbox.manage.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gearbox.manage.entity.SysUser;
import com.gearbox.manage.mapper.SysUserMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SysUserService extends ServiceImpl<SysUserMapper, SysUser> {

    public List<SysUser> listByRole(String role) {
        return lambdaQuery()
                .eq(SysUser::getRole, role)
                .eq(SysUser::getStatus, 1)
                .list();
    }
}
