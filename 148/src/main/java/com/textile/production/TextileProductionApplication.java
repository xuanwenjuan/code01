package com.textile.production;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.textile.production.mapper")
@EnableScheduling
@EnableAsync
public class TextileProductionApplication {

    public static void main(String[] args) {
        SpringApplication.run(TextileProductionApplication.class, args);
    }
}
