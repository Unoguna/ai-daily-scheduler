package com.be.user.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.user.domain.User;
import com.be.user.dto.*;
import com.be.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final ProfileImageStorageService profileImageStorageService;

    public UpdateUserNameResponse updateMyName(Long userId, UpdateUserNameRequest request) {
        User user = getUser(userId);

        user.updateName(request.name());

        return UpdateUserNameResponse.of(user.getId(), user.getName());
    }

    public UpdateProfileImageResponse updateMyProfileImage(Long userId, MultipartFile file) {
        User user = getUser(userId);

        String profileImageUrl = profileImageStorageService.store(file);
        user.updateProfileImage(profileImageUrl);

        return UpdateProfileImageResponse.of(user.getId(), user.getProfileImageUrl());
    }

    @Transactional(readOnly = true)
    public UserMeResponse getMyInfo(Long userId) {
        User user = getUser(userId);

        return UserMeResponse.from(user);
    }

    //private이라 프록시가 가로채지 못해서 트랜잭션 대상이 아님
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
