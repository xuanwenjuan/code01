package com.naturaldye.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.naturaldye.common.BusinessException;
import com.naturaldye.dto.LoginDTO;
import com.naturaldye.entity.SysUser;
import com.naturaldye.mapper.SysUserMapper;
import com.naturaldye.util.JwtUtil;
import com.naturaldye.vo.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserMapper sysUserMapper;
    private final JwtUtil jwtUtil;

    public LoginVO login(LoginDTO loginDTO) {
        LambdaQueryWrapper<SysUser> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysUser::getUsername, loginDTO.getUsername());
        SysUser user = sysUserMapper.selectOne(queryWrapper);

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        String md5Password = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!md5Password.equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("账号已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().getCode());

        LoginVO loginVO = new LoginVO();
        loginVO.setUserId(user.getId());
        loginVO.setUsername(user.getUsername());
        loginVO.setRealName(user.getRealName());
        loginVO.setToken(token);
        loginVO.setRole(user.getRole().getCode());
        loginVO.setRoleDesc(user.getRole().getDesc());

        return loginVO;
    }

    public void register(SysUser user) {
        LambdaQueryWrapper<SysUser> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysUser::getUsername, user.getUsername());
        SysUser existUser = sysUserMapper.selectOne(queryWrapper);

        if (existUser != null) {
            throw new BusinessException("用户名已存在");
        }

        user.setPassword(DigestUtils.md5DigestAsHex(user.getPassword().getBytes()));
        user.setStatus(1);
        sysUserMapper.insert(user);
    }
}
