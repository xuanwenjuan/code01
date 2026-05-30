package com.fastener.production.service.system.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fastener.production.common.exception.BusinessException;
import com.fastener.production.common.result.ResultCode;
import com.fastener.production.common.utils.JwtUtils;
import com.fastener.production.common.utils.UserContext;
import com.fastener.production.entity.system.SysRole;
import com.fastener.production.entity.system.SysUser;
import com.fastener.production.entity.system.dto.LoginDTO;
import com.fastener.production.entity.system.vo.LoginVO;
import com.fastener.production.mapper.system.SysRoleMapper;
import com.fastener.production.mapper.system.SysUserMapper;
import com.fastener.production.service.system.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final JwtUtils jwtUtils;
    private final StringRedisTemplate redisTemplate;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public LoginVO login(LoginDTO dto) {
        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, dto.getUsername())
                .eq(SysUser::getDeleted, 0));

        if (user == null) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException(ResultCode.LOGIN_ERROR, "账号已被禁用");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        String roleCode = "user";
        String roleName = "普通用户";
        if (user.getRoleId() != null) {
            SysRole role = sysRoleMapper.selectById(user.getRoleId());
            if (role != null) {
                roleCode = role.getRoleCode();
                roleName = role.getRoleName();
            }
        }

        String token = jwtUtils.generateToken(user.getId(), user.getUsername(), roleCode);

        redisTemplate.opsForValue().set("token:" + user.getId(), token, 24, TimeUnit.HOURS);

        return new LoginVO(token, user.getId(), user.getUsername(), user.getRealName(), roleCode, roleName);
    }

    @Override
    public void logout() {
        Long userId = UserContext.getUserId();
        if (userId != null) {
            redisTemplate.delete("token:" + userId);
        }
    }
}
