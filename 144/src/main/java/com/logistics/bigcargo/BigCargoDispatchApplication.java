package com.logistics.bigcargo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.logistics.bigcargo.mapper")
public class BigCargoDispatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(BigCargoDispatchApplication.class, args);
    }
}
