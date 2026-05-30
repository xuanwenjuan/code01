package com.paper.production;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.paper.production.mapper")
@EnableScheduling
@EnableAsync
public class PaperProductionApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaperProductionApplication.class, args);
    }
}
