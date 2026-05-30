package com.firecontrol.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.firecontrol.common.ResultCode;
import com.firecontrol.dto.LoginDTO;
import com.firecontrol.entity.SysRole;
import com.firecontrol.entity.SysUser;
import com.firecontrol.exception.BusinessException;
import com.firecontrol.mapper.SysRoleMapper;
import com.firecontrol.mapper.SysUserMapper;
import com.firecontrol.service.AuthService;
import com.firecontrol.utils.JwtUtil;
import com.firecontrol.vo.LoginVO;
import jakarta.annotation.Resource;
import cn.hutool.crypto.digest.BCrypt;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    @Resource
    private SysUserMapper sysUserMapper;

    @Resource
    private SysRoleMapper sysRoleMapper;

    @Resource
    private JwtUtil jwtUtil;

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(
                new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getUsername, loginDTO.getUsername())
        );

        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.LOGIN_ERROR);
        }

        SysRole role = sysRoleMapper.selectById(user.getRoleId());

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), role.getRoleCode());

        stringRedisTemplate.opsForValue().set("login:token:" + user.getId(), token, 24, TimeUnit.HOURS);

        return new LoginVO(
                token,
                user.getId(),
                user.getUsername(),
                user.getRealName(),
                role.getRoleCode(),
                role.getRoleName()
        );
    }

    @Override
    public void logout() {
        Long userId = com.firecontrol.utils.UserContextUtil.getUserId();
        if (userId != null) {
            stringRedisTemplate.delete("login:token:" + userId);
        }
    }
}
