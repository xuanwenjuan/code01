package com.instrument.consignment.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ReceiveChannelEnum {

    ONLINE("ONLINE", "线上预约"),
    OFFLINE("OFFLINE", "门店上门"),
    REFERRAL("REFERRAL", "转介绍");

    private final String code;
    private final String desc;

    public static String getDescByCode(String code) {
        for (ReceiveChannelEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value.getDesc();
            }
        }
        return code;
    }
}
