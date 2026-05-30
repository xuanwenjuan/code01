package com.spindle.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.spindle.manage.dto.LoginDTO;
import com.spindle.manage.entity.SysUser;
import com.spindle.manage.exception.BusinessException;
import com.spindle.manage.mapper.SysUserMapper;
import com.spindle.manage.service.SysUserService;
import com.spindle.manage.utils.JwtUtil;
import com.spindle.manage.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements SysUserService {

    private final JwtUtil jwtUtil;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, loginDTO.getUsername());
        SysUser user = this.getOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        List<String> roles = this.baseMapper.selectRoleCodesByUserId(user.getId());
        List<String> permissions = this.baseMapper.selectPermissionCodesByUserId(user.getId());

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setToken(token);
        loginVO.setRoles(roles);
        loginVO.setPermissions(permissions);

        return loginVO;
    }

}
