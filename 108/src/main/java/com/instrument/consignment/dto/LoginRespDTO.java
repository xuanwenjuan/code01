package com.instrument.consignment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginRespDTO {

    private Long userId;

    private String username;

    private String realName;

    private String role;

    private String token;
}
