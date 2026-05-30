package com.zongshi.brush.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zongshi.brush.dto.LoginDTO;
import com.zongshi.brush.entity.SysUser;
import com.zongshi.brush.exception.BusinessException;
import com.zongshi.brush.mapper.SysUserMapper;
import com.zongshi.brush.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginDTO dto) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, dto.getUsername());
        wrapper.eq(SysUser::getIsDeleted, 0);
        SysUser user = sysUserMapper.selectOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        List<String> roles = sysUserMapper.selectRolesByUserId(user.getId());
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), roles);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());
        result.put("roles", roles);

        return result;
    }
}
