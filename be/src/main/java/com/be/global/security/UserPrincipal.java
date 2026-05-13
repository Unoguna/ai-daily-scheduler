package com.be.global.security;

import lombok.Getter;
import org.jetbrains.annotations.NotNull;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

//Spring Security가 이해할 수 있는 로그인 사용자 객체
@Getter
public class UserPrincipal extends AbstractAuthenticationToken {

    private final Long userId;
    private final String username;

    public UserPrincipal(Long userId, String username) {
        super(List.of(new SimpleGrantedAuthority("ROLE_USER")));
        this.userId = userId;
        this.username = username;
        setAuthenticated(true);
    }

    @NotNull
    @Override
    public String getName() {
        return username;
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public Object getPrincipal() {
        return this;
    }
}