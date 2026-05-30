package com.liquor.brewing;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.liquor.brewing.mapper")
public class LiquorBrewingApplication {

    public static void main(String[] args) {
        SpringApplication.run(LiquorBrewingApplication.class, args);
        System.out.println("================================================");
        System.out.println("  瓶装酒水酿造分装管控后端服务启动成功！");
        System.out.println("  API文档: http://localhost:8080/api/doc.html");
        System.out.println("================================================");
    }
}
