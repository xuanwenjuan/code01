package com.cosmetics;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.cosmetics.mapper")
public class CosmeticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CosmeticsApplication.class, args);
    }
}
