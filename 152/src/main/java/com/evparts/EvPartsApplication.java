package com.evparts;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.evparts.mapper")
@EnableScheduling
@EnableAsync
public class EvPartsApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvPartsApplication.class, args);
    }

}
