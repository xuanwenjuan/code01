package com.oiledumbrella;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.oiledumbrella.mapper")
public class UmbrellaApplication {

    public static void main(String[] args) {
        SpringApplication.run(UmbrellaApplication.class, args);
    }

}
