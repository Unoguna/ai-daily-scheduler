package com.be.user.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.user.domain.User;
import com.be.user.dto.*;
import com.be.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UpdateUserNameResponse updateMyName(Long userId, UpdateUserNameRequest request) {
        User user = getUser(userId);

        user.updateName(request.name());

        return UpdateUserNameResponse.of(user.getId(), user.getName());
    }

    public UpdateProfileImageResponse updateMyProfileImage(Long userId, UpdateProfileImageRequest request) {
        User user = getUser(userId);

        user.updateProfileImage(request.profileImageUrl());

        return UpdateProfileImageResponse.of(user.getId(), user.getProfileImageUrl());
    }

    public UserMeResponse getMyInfo(Long userId) {
        User user = getUser(userId);

        return UserMeResponse.from(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}