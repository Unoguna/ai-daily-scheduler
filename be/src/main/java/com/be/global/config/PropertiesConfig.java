package com.be.global.config;

import com.be.auth.config.GoogleProperties;
import com.be.auth.config.KakaoProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
        KakaoProperties.class,
        GoogleProperties.class
})
public class PropertiesConfig {
}