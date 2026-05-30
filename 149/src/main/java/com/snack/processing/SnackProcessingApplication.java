package com.snack.processing;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.snack.processing.mapper")
public class SnackProcessingApplication {
    public static void main(String[] args) {
        SpringApplication.run(SnackProcessingApplication.class, args);
    }
}
