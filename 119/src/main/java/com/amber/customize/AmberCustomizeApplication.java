package com.amber.customize;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.amber.customize.mapper")
public class AmberCustomizeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AmberCustomizeApplication.class, args);
    }

}