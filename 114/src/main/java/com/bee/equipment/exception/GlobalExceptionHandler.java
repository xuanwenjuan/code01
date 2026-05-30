package com.bee.equipment.exception;

import com.bee.equipment.common.Result;
import com.bee.equipment.common.ResultCodeEnum;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.UUID;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.warn("业务异常 - RequestId: {}, Code: {}, Message: {}, URI: {}",
                requestId, e.getCode(), e.getMessage(), request.getRequestURI());
        return Result.error(e.getCode(), e.getMessage()).requestId(requestId);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("参数校验失败");
        log.warn("参数校验异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleBindException(BindException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("参数绑定失败");
        log.warn("参数绑定异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleConstraintViolationException(ConstraintViolationException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = e.getConstraintViolations().stream()
                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("约束校验失败");
        log.warn("约束校验异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMissingServletRequestParameterException(MissingServletRequestParameterException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = "缺少必需参数: " + e.getParameterName();
        log.warn("缺少参数异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = "参数类型错误: " + e.getName();
        log.warn("参数类型异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Result<Void> handleNoHandlerFoundException(NoHandlerFoundException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = "接口不存在: " + e.getRequestURL();
        log.warn("接口不存在 - RequestId: {}, Message: {}, Method: {}",
                requestId, message, e.getHttpMethod());
        return Result.error(ResultCodeEnum.NOT_FOUND.getCode(), message).requestId(requestId);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public Result<Void> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = "不支持的请求方法: " + e.getMethod();
        log.warn("请求方法不支持 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(405, message).requestId(requestId);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public Result<Void> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        String message = "不支持的媒体类型: " + e.getContentType();
        log.warn("媒体类型不支持 - RequestId: {}, Message: {}, URI: {}",
                requestId, message, request.getRequestURI());
        return Result.error(415, message).requestId(requestId);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public Result<Void> handleDuplicateKeyException(DuplicateKeyException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.error("数据库唯一约束冲突 - RequestId: {}, URI: {}, Error: {}",
                requestId, request.getRequestURI(), e.getMessage());
        return Result.error("数据已存在，请不要重复提交").requestId(requestId);
    }

    @ExceptionHandler(DataAccessException.class)
    public Result<Void> handleDataAccessException(DataAccessException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.error("数据库访问异常 - RequestId: {}, URI: {}", requestId, request.getRequestURI(), e);
        return Result.error("数据库操作异常，请稍后重试").requestId(requestId);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public Result<Void> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.warn("文件上传大小超限 - RequestId: {}, URI: {}", requestId, request.getRequestURI());
        return Result.error("文件大小超过限制").requestId(requestId);
    }

    @ExceptionHandler({CompletionException.class, ExecutionException.class})
    public Result<Void> handleAsyncException(Exception e, HttpServletRequest request) {
        String requestId = generateRequestId();
        Throwable cause = e.getCause() != null ? e.getCause() : e;
        log.error("异步执行异常 - RequestId: {}, URI: {}", requestId, request.getRequestURI(), cause);

        if (cause instanceof BusinessException) {
            return handleBusinessException((BusinessException) cause, request);
        }

        return Result.error("服务处理异常，请稍后重试").requestId(requestId);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Result<Void> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.warn("非法参数异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, e.getMessage(), request.getRequestURI());
        return Result.error(ResultCodeEnum.PARAM_ERROR.getCode(), e.getMessage()).requestId(requestId);
    }

    @ExceptionHandler(IllegalStateException.class)
    public Result<Void> handleIllegalStateException(IllegalStateException e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.warn("非法状态异常 - RequestId: {}, Message: {}, URI: {}",
                requestId, e.getMessage(), request.getRequestURI());
        return Result.error(e.getMessage()).requestId(requestId);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e, HttpServletRequest request) {
        String requestId = generateRequestId();
        log.error("系统异常 - RequestId: {}, URI: {}, Method: {}",
                requestId, request.getRequestURI(), request.getMethod(), e);
        return Result.error("系统异常，请联系管理员").requestId(requestId);
    }
}
