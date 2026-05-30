package com.sheetmetal.compressor;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.sheetmetal.compressor.mapper")
public class CompressorApplication {
    public static void main(String[] args) {
        SpringApplication.run(CompressorApplication.class, args);
    }
}
