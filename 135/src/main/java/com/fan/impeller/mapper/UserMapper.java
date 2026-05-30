package com.fan.impeller.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fan.impeller.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}