package com.be.global.time;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

public final class KoreanDate {
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private KoreanDate() {}

    public static LocalDate today() { return today(Clock.systemUTC()); }

    public static LocalDate today(Clock clock) {
        return LocalDate.now(clock.withZone(SEOUL));
    }
}
