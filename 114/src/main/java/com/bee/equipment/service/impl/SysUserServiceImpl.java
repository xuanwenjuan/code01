package com.bee.equipment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.bee.equipment.common.ResultCodeEnum;
import com.bee.equipment.common.RoleEnum;
import com.bee.equipment.dto.LoginDTO;
import com.bee.equipment.dto.RegisterDTO;
import com.bee.equipment.entity.SysUser;
import com.bee.equipment.exception.BusinessException;
import com.bee.equipment.mapper.SysUserMapper;
import com.bee.equipment.service.SysUserService;
import org.springframework.stereotype.Service;

@Service
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    @Override
    public SysUser login(LoginDTO loginDTO) {
        SysUser user = getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, loginDTO.getUsername()));

        if (user == null) {
            throw new BusinessException(ResultCodeEnum.USERNAME_OR_PASSWORD_ERROR);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCodeEnum.USER_DISABLED);
        }

        return user;
    }

    @Override
    public void register(RegisterDTO registerDTO) {
        SysUser existUser = getOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, registerDTO.getUsername()));
        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        boolean validRole = false;
        for (RoleEnum role : RoleEnum.values()) {
            if (role.getCode().equals(registerDTO.getRole())) {
                validRole = true;
                break;
            }
        }
        if (!validRole) {
            throw new BusinessException("无效的角色类型");
        }

        SysUser user = new SysUser();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(registerDTO.getPassword());
        user.setRealName(registerDTO.getRealName());
        user.setPhone(registerDTO.getPhone());
        user.setRole(registerDTO.getRole());
        user.setStatus(1);
        save(user);
    }

    @Override
    public SysUser getUserById(Long userId) {
        return getById(userId);
    }
}
