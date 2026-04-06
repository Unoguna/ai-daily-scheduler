package com.be.user.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.user.domain.User;
import com.be.user.dto.UpdateUserNameRequest;
import com.be.user.dto.UpdateUserNameResponse;
import com.be.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UpdateUserNameResponse updateMyName(Long userId, UpdateUserNameRequest request) {
        User user = getUser(userId);

        user.updateName(request.name());

        return UpdateUserNameResponse.of(user.getId(), user.getName());
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}