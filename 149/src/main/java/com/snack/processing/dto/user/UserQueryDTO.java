package com.snack.processing.dto.user;

import com.snack.processing.common.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserQueryDTO extends PageQuery {
    private String username;
    private String realName;
    private String phone;
    private Integer role;
    private Integer status;
}
