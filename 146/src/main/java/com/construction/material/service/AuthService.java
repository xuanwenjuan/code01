package com.construction.material.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.construction.material.dto.LoginDTO;
import com.construction.material.dto.SysUserDTO;
import com.construction.material.entity.SysUser;
import com.construction.material.exception.BusinessException;
import com.construction.material.mapper.SysUserMapper;
import com.construction.material.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public Map<String, Object> login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
                        .eq(SysUser::getDeleted, 0)
        );

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("账号已被禁用，请联系管理员");
        }

        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("role", user.getRole());
        result.put("roleName", user.getRoleName());

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void register(SysUserDTO userDTO) {
        SysUser existUser = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, userDTO.getUsername())
                        .eq(SysUser::getDeleted, 0)
        );

        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        SysUser user = new SysUser();
        user.setUsername(userDTO.getUsername());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setRealName(userDTO.getRealName());
        user.setPhone(userDTO.getPhone());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole());
        user.setRoleName(getRoleName(userDTO.getRole()));
        user.setStatus(1);
        user.setRemark(userDTO.getRemark());

        sysUserMapper.insert(user);
    }

    private String getRoleName(String role) {
        return switch (role) {
            case "PURCHASER" -> "采购专员";
            case "WAREHOUSE_KEEPER" -> "工地仓管";
            case "SUPERVISOR" -> "工程监理";
            case "FINANCE" -> "财务核算";
            case "ADMIN" -> "系统管理员";
            default -> "未知角色";
        };
    }
}
