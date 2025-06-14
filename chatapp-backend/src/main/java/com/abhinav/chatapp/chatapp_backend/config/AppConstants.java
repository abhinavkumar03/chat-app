package com.abhinav.chatapp.chatapp_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppConstants {

    private String frontEndBaseUrl;

    public String getFrontEndBaseUrl() {
        return frontEndBaseUrl;
    }

    public void setFrontEndBaseUrl(String frontEndBaseUrl) {
        this.frontEndBaseUrl = frontEndBaseUrl;
    }
}
