package com.incense;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.incense.mapper")
public class IncenseApplication {

    public static void main(String[] args) {
        SpringApplication.run(IncenseApplication.class, args);
    }

}
