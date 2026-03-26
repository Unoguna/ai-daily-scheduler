package com.be.auth.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(nullable = false, unique = true)
    private Long userId;

    private RefreshToken(Long userId, String token) {
        this.userId = userId;
        this.token = token;
    }

    public static RefreshToken create(Long userId, String token) {
        return new RefreshToken(userId, token);
    }

    public void updateToken(String token) {
        this.token = token;
    }
}