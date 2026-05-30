package com.liquor.brewing.service.impl;

import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.PageQuery;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.entity.SysUser;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.SysUserMapper;
import com.liquor.brewing.service.SysUserService;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;

@Service
public class SysUserServiceImpl implements SysUserService {

    @Resource
    private SysUserMapper sysUserMapper;

    @Override
    public IPage<SysUser> page(String keyword, Integer roleId, Integer status, PageQuery pageQuery) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(SysUser::getUsername, keyword)
                    .or().like(SysUser::getRealName, keyword)
                    .or().like(SysUser::getPhone, keyword));
        }
        if (roleId != null) {
            wrapper.eq(SysUser::getRoleId, roleId);
        }
        if (status != null) {
            wrapper.eq(SysUser::getStatus, status);
        }
        wrapper.orderByDesc(SysUser::getCreateTime);
        return sysUserMapper.selectUserPage(new Page<>(pageQuery.getPageNum(), pageQuery.getPageSize()), wrapper);
    }

    @Override
    public SysUser getById(Long id) {
        return sysUserMapper.selectUserWithRole(id);
    }

    @Override
    public void add(SysUser user) {
        Long count = sysUserMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, user.getUsername()));
        if (count > 0) {
            throw new BusinessException(ResultCode.USER_ALREADY_EXIST);
        }
        user.setPassword(BCrypt.hashpw(Constants.DEFAULT_PASSWORD));
        user.setStatus(Constants.Status.ENABLE);
        sysUserMapper.insert(user);
    }

    @Override
    public void update(SysUser user) {
        SysUser exist = sysUserMapper.selectById(user.getId());
        if (exist == null) {
            throw new BusinessException(ResultCode.DATA_NOT_EXIST);
        }
        if (!exist.getUsername().equals(user.getUsername())) {
            Long count = sysUserMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getUsername, user.getUsername()));
            if (count > 0) {
                throw new BusinessException(ResultCode.USER_ALREADY_EXIST);
            }
        }
        user.setPassword(null);
        sysUserMapper.updateById(user);
    }

    @Override
    public void delete(Long id) {
        sysUserMapper.deleteById(id);
    }

    @Override
    public void updateStatus(Long id, Integer status) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setStatus(status);
        sysUserMapper.updateById(user);
    }

    @Override
    public void resetPassword(Long id) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setPassword(BCrypt.hashpw(Constants.DEFAULT_PASSWORD));
        sysUserMapper.updateById(user);
    }
}
