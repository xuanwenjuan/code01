package com.paper.production.exception;

import com.paper.production.common.ResultCode;
import lombok.Getter;

@Getter
public class PermissionDeniedException extends RuntimeException {

    private final Integer code;

    public PermissionDeniedException(String message) {
        super(message);
        this.code = ResultCode.FORBIDDEN.getCode();
    }

    public PermissionDeniedException() {
        super(ResultCode.FORBIDDEN.getMessage());
        this.code = ResultCode.FORBIDDEN.getCode();
    }
}
