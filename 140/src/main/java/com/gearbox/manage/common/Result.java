package com.gearbox.manage.common;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private long total;

    private Result() {
        this.timestamp = LocalDateTime.now();
    }

    public static <T> Result<T> success() {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        return result;
    }

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success(T data, long total) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        result.setTotal(total);
        return result;
    }

    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    public static <T> Result<T> unauthorized() {
        Result<T> result = new Result<>();
        result.setCode(401);
        result.setMessage("未授权，请先登录");
        return result;
    }

    public static <T> Result<T> forbidden() {
        Result<T> result = new Result<>();
        result.setCode(403);
        result.setMessage("权限不足，无法访问");
        return result;
    }

    public static <T> Result<T> notFound() {
        Result<T> result = new Result<>();
        result.setCode(404);
        result.setMessage("资源不存在");
        return result;
    }

    public static <T> Result<T> badRequest(String message) {
        Result<T> result = new Result<>();
        result.setCode(400);
        result.setMessage(message);
        return result;
    }

    public boolean isSuccess() {
        return code != null && code == 200;
    }
}
