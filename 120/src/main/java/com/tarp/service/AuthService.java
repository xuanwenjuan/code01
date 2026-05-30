package com.tarp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tarp.dto.LoginDTO;
import com.tarp.entity.SysRole;
import com.tarp.entity.SysUser;
import com.tarp.entity.SysUserRole;
import com.tarp.exception.BusinessException;
import com.tarp.mapper.SysRoleMapper;
import com.tarp.mapper.SysUserMapper;
import com.tarp.mapper.SysUserRoleMapper;
import com.tarp.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> login(LoginDTO loginDTO) {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        SysUserRole userRole = userRoleMapper.selectOne(
                new LambdaQueryWrapper<SysUserRole>()
                        .eq(SysUserRole::getUserId, user.getId())
        );

        String roleCode = "ROLE_USER";
        if (userRole != null) {
            SysRole role = roleMapper.selectById(userRole.getRoleId());
            if (role != null) {
                roleCode = role.getRoleCode();
            }
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roleCode);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", roleCode);

        return result;
    }
}
