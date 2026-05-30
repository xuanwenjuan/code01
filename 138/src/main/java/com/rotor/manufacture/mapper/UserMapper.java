package com.rotor.manufacture.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.rotor.manufacture.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}