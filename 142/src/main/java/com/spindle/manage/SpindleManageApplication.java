package com.spindle.manage;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.spindle.manage.mapper")
public class SpindleManageApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpindleManageApplication.class, args);
    }

}
