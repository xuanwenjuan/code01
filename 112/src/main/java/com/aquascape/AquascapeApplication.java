package com.aquascape;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.aquascape.mapper")
public class AquascapeApplication {
    public static void main(String[] args) {
        SpringApplication.run(AquascapeApplication.class, args);
    }
}
