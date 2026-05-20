package com.be.schedule.dto;

import com.be.schedule.domain.EnergyPattern;
import com.be.schedule.domain.SchedulingProfile;

import java.time.LocalTime;

public record SchedulingProfileResponse(
        Long schedulingProfileId,
        LocalTime preferredStartTime,
        LocalTime preferredEndTime,
        LocalTime wakeUpTime,
        LocalTime sleepTime,
        EnergyPattern energyPattern,
        Integer preferredSessionMinutes,
        Integer breakMinutes
) {
    public static SchedulingProfileResponse from(SchedulingProfile profile) {
        return new SchedulingProfileResponse(
                profile.getId(),
                profile.getPreferredStartTime(),
                profile.getPreferredEndTime(),
                profile.getWakeUpTime(),
                profile.getSleepTime(),
                profile.getEnergyPattern(),
                profile.getPreferredSessionMinutes(),
                profile.getBreakMinutes()
        );
    }
}
