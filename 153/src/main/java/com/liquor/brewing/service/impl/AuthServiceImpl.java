package com.liquor.brewing.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.liquor.brewing.common.Constants;
import com.liquor.brewing.common.ResultCode;
import com.liquor.brewing.dto.LoginDTO;
import com.liquor.brewing.entity.SysRole;
import com.liquor.brewing.entity.SysUser;
import com.liquor.brewing.exception.BusinessException;
import com.liquor.brewing.mapper.SysRoleMapper;
import com.liquor.brewing.mapper.SysUserMapper;
import com.liquor.brewing.service.AuthService;
import com.liquor.brewing.util.JwtUtil;
import com.liquor.brewing.util.RedisUtil;
import com.liquor.brewing.util.UserContext;
import com.liquor.brewing.vo.LoginVO;
import jakarta.annotation.Resource;
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
    private RedisUtil redisUtil;

    @Override
    public LoginVO login(LoginDTO loginDTO) {
        SysUser user = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, loginDTO.getUsername()));

        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_EXIST);
        }

        if (Constants.Status.DISABLE.equals(user.getStatus())) {
            throw new BusinessException(ResultCode.USER_DISABLED);
        }

        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException(ResultCode.USER_PASSWORD_ERROR);
        }

        SysRole role = sysRoleMapper.selectById(user.getRoleId());
        if (role == null) {
            throw new BusinessException("用户角色不存在");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());

        redisUtil.set(Constants.TOKEN_KEY + user.getId(), token, Constants.TOKEN_EXPIRE, TimeUnit.SECONDS);
        redisUtil.set(Constants.USER_KEY + user.getId() + ":role", role.getRoleCode(), Constants.TOKEN_EXPIRE, TimeUnit.SECONDS);

        UserContext.setUserId(user.getId());
        UserContext.setUsername(user.getUsername());
        UserContext.setRoleCode(role.getRoleCode());

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
        Long userId = UserContext.getUserId();
        redisUtil.delete(Constants.TOKEN_KEY + userId);
    }
}
