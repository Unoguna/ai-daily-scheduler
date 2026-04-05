package com.be.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;   // KAKAO, GOOGLE

    @Column(nullable = false, length = 100)
    private String providerId;       // 카카오 회원 고유 id

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 300)
    private String profileImageUrl;

    private User(AuthProvider provider, String providerId, String email, String name, String profileImageUrl) {
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }

    public static User create(
            AuthProvider provider,
            String providerId,
            String email,
            String name,
            String profileImageUrl
    ) {
        return new User(provider, providerId, email, name, profileImageUrl);
    }

    public void updateProfile(String email, String name, String profileImageUrl) {
        this.email = email;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }
}