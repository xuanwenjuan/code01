package com.liquor.brewing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.entity.SysRole;
import com.liquor.brewing.mapper.SysRoleMapper;
import com.liquor.brewing.service.SysRoleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements SysRoleService {

    @Override
    public List<SysRole> listAll() {
        return list(new LambdaQueryWrapper<SysRole>()
                .eq(SysRole::getStatus, Constants.Status.ENABLE)
                .orderByAsc(SysRole::getSortOrder));
    }
}
