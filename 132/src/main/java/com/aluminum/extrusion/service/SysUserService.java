package com.aluminum.extrusion.service;

import com.aluminum.extrusion.dto.LoginDTO;
import com.aluminum.extrusion.entity.SysUser;
import com.aluminum.extrusion.exception.BusinessException;
import com.aluminum.extrusion.mapper.SysUserMapper;
import com.aluminum.extrusion.util.JwtUtil;
import com.aluminum.extrusion.vo.LoginVO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
@RequiredArgsConstructor
public class SysUserService extends ServiceImpl<SysUserMapper, SysUser> {

    private final JwtUtil jwtUtil;

    public LoginVO login(LoginDTO loginDTO) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, loginDTO.getUsername());
        SysUser user = getOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        String passwordHash = DigestUtils.md5DigestAsHex(loginDTO.getPassword().getBytes());
        if (!passwordHash.equals(user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException("账号已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginVO(token, user.getUsername(), user.getRealName(), user.getRole());
    }

    public void register(SysUser user) {
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysUser::getUsername, user.getUsername());
        if (count(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }

        user.setPassword(DigestUtils.md5DigestAsHex(user.getPassword().getBytes()));
        user.setStatus(1);
        save(user);
    }
}
