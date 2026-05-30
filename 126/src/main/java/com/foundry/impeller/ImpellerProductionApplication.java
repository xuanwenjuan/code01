package com.foundry.impeller;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.foundry.impeller.mapper")
public class ImpellerProductionApplication {
    public static void main(String[] args) {
        SpringApplication.run(ImpellerProductionApplication.class, args);
    }
}
