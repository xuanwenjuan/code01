package com.instrument.consignment;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.instrument.consignment.mapper")
public class InstrumentConsignmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(InstrumentConsignmentApplication.class, args);
    }

}
