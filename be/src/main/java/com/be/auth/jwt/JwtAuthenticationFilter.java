package com.be.auth.jwt;

import com.be.global.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);

            if (jwtTokenProvider.validateToken(token)
                    && "access".equals(jwtTokenProvider.getTokenType(token))) {

                Long userId = jwtTokenProvider.getUserId(token);
                String username = jwtTokenProvider.getClaims(token).get("username", String.class);

                UserPrincipal principal = new UserPrincipal(userId, username);
                SecurityContextHolder.getContext().setAuthentication(principal);
            }
        }

        filterChain.doFilter(request, response);
    }
}