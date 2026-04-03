package com.be.auth.google.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleUserResponse(
        String id,
        String email,

        @JsonProperty("verified_email")
        Boolean verifiedEmail,

        String name,

        @JsonProperty("picture")
        String profileImageUrl
) {

    public GoogleUserInfo toUserInfo() {
        return new GoogleUserInfo(
                id != null ? String.valueOf(id) : null,
                email,
                name,
                profileImageUrl
        );
    }
}