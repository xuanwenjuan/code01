package com.heritage.dye.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.heritage.dye.po.UserPO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<UserPO> {
}
