package com.snacktrace;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.snacktrace.mapper")
public class SnackTraceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnackTraceApplication.class, args);
    }
}
