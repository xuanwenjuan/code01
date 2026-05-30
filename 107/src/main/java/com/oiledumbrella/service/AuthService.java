package com.oiledumbrella.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.oiledumbrella.dto.LoginDTO;
import com.oiledumbrella.entity.SysUser;
import com.oiledumbrella.exception.BusinessException;
import com.oiledumbrella.mapper.SysUserMapper;
import com.oiledumbrella.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper userMapper;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(LoginDTO loginDTO) {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException("用户已被禁用");
        }

        if (!loginDTO.getPassword().equals(user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("realName", user.getRealName());

        return result;
    }
}
