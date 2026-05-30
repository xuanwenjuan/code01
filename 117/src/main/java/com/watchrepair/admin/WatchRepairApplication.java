package com.watchrepair.admin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.watchrepair.admin.mapper")
public class WatchRepairApplication {

    public static void main(String[] args) {
        SpringApplication.run(WatchRepairApplication.class, args);
    }

}