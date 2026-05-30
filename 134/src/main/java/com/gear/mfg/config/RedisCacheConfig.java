package com.gear.mfg.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .computePrefixWith(name -> "gear:" + name + ":");

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        cacheConfigurations.put("category", defaultConfig.entryTtl(Duration.ofHours(12)));
        cacheConfigurations.put("stock", defaultConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put("order", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("process", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigurations.put("report", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("quality", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put("cost", defaultConfig.entryTtl(Duration.ofHours(6)));
        cacheConfigurations.put("user", defaultConfig.entryTtl(Duration.ofHours(2)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
    }
}
