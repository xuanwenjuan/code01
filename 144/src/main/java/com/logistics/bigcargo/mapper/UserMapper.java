package com.logistics.bigcargo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.bigcargo.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
