package com.amber.polish;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.amber.polish.mapper")
public class AmberPolishApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmberPolishApplication.class, args);
    }
}
