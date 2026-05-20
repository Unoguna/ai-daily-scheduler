package com.be.schedule.service;

import com.be.global.exception.BusinessException;
import com.be.global.exception.ErrorCode;
import com.be.schedule.domain.FixedSchedule;
import com.be.schedule.domain.SchedulingProfile;
import com.be.schedule.dto.FixedScheduleCreateRequest;
import com.be.schedule.dto.FixedScheduleResponse;
import com.be.schedule.dto.FixedScheduleUpdateRequest;
import com.be.schedule.dto.SchedulingProfileCreateRequest;
import com.be.schedule.dto.SchedulingProfileResponse;
import com.be.schedule.repository.FixedScheduleRepository;
import com.be.schedule.repository.SchedulingProfileRepository;
import com.be.user.domain.User;
import com.be.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleCommandService {

    private final UserRepository userRepository;
    private final SchedulingProfileRepository schedulingProfileRepository;
    private final FixedScheduleRepository fixedScheduleRepository;

    public Long createSchedulingProfile(Long userId, SchedulingProfileCreateRequest request) {
        User user = getUser(userId);

        if (schedulingProfileRepository.existsByUserId(userId)) {
            throw new BusinessException(ErrorCode.SCHEDULING_PROFILE_ALREADY_EXISTS);
        }

        SchedulingProfile profile = SchedulingProfile.create(
                user,
                request.preferredStartTime(),
                request.preferredEndTime(),
                request.wakeUpTime(),
                request.sleepTime(),
                request.energyPattern(),
                request.preferredSessionMinutes(),
                request.breakMinutes()
        );

        return schedulingProfileRepository.save(profile).getId();
    }

    @Transactional(readOnly = true)
    public SchedulingProfileResponse getSchedulingProfile(Long userId) {
        getUser(userId);

        return schedulingProfileRepository.findByUserId(userId)
                .map(SchedulingProfileResponse::from)
                .orElse(null);
    }

    public SchedulingProfileResponse updateSchedulingProfile(Long userId, SchedulingProfileCreateRequest request) {
        getUser(userId);

        SchedulingProfile profile = schedulingProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        profile.updateProfile(
                request.preferredStartTime(),
                request.preferredEndTime(),
                request.wakeUpTime(),
                request.sleepTime(),
                request.energyPattern(),
                request.preferredSessionMinutes(),
                request.breakMinutes()
        );

        return SchedulingProfileResponse.from(profile);
    }

    public Long createFixedSchedule(Long userId, FixedScheduleCreateRequest request) {
        User user = getUser(userId);

        FixedSchedule fixedSchedule = FixedSchedule.create(
                user,
                request.dayOfWeek(),
                request.title(),
                request.category(),
                request.startTime(),
                request.endTime(),
                request.mandatory()
        );

        return fixedScheduleRepository.save(fixedSchedule).getId();
    }

    @Transactional(readOnly = true)
    public List<FixedScheduleResponse> getFixedSchedules(Long userId, DayOfWeek dayOfWeek) {
        getUser(userId);

        List<FixedSchedule> fixedSchedules = dayOfWeek == null
                ? fixedScheduleRepository.findByUserId(userId)
                : fixedScheduleRepository.findByUserIdAndDayOfWeek(userId, dayOfWeek);

        return fixedSchedules.stream()
                .map(FixedScheduleResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public FixedScheduleResponse getFixedSchedule(Long userId, Long scheduleId) {
        getUser(userId);

        FixedSchedule fixedSchedule = fixedScheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        return FixedScheduleResponse.from(fixedSchedule);
    }

    public FixedScheduleResponse updateFixedSchedule(Long userId, Long scheduleId, FixedScheduleUpdateRequest request) {
        getUser(userId);

        FixedSchedule fixedSchedule = fixedScheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        fixedSchedule.update(
                request.dayOfWeek(),
                request.title(),
                request.category(),
                request.startTime(),
                request.endTime(),
                request.mandatory()
        );

        return FixedScheduleResponse.from(fixedSchedule);
    }

    public void deleteFixedSchedule(Long userId, Long scheduleId) {
        getUser(userId);

        FixedSchedule fixedSchedule = fixedScheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ENTITY_NOT_FOUND));

        fixedScheduleRepository.delete(fixedSchedule);
    }


    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
