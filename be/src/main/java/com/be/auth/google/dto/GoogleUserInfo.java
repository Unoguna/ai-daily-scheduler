package com.be.auth.google.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleUserInfo(
        String id,
        String email,

        @JsonProperty("verified_email")
        Boolean verifiedEmail,

        String name,

        @JsonProperty("picture")
        String profileImageUrl
) {
}