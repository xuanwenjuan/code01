package com.liquor.brewing.util;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class CodeGenerator {

    @Value("${liquor.batch-code-prefix:LQ}")
    private String prefix;

    private static final AtomicInteger BATCH_SEQUENCE = new AtomicInteger(1);
    private static final AtomicInteger WORK_ORDER_SEQUENCE = new AtomicInteger(1);
    private static final AtomicInteger MATERIAL_SEQUENCE = new AtomicInteger(1);
    private static final AtomicInteger CATEGORY_SEQUENCE = new AtomicInteger(1);

    public String generateBatchCode() {
        String dateStr = DateUtil.format(new Date(), "yyyyMMddHHmmss");
        int seq = BATCH_SEQUENCE.getAndIncrement();
        if (seq > 9999) {
            BATCH_SEQUENCE.set(1);
            seq = 1;
        }
        return prefix + dateStr + StrUtil.padPre(String.valueOf(seq), 4, '0');
    }

    public String generateWorkOrderCode() {
        String dateStr = DateUtil.format(new Date(), "yyyyMMdd");
        int seq = WORK_ORDER_SEQUENCE.getAndIncrement();
        if (seq > 9999) {
            WORK_ORDER_SEQUENCE.set(1);
            seq = 1;
        }
        return "WO" + dateStr + StrUtil.padPre(String.valueOf(seq), 4, '0');
    }

    public String generateMaterialCode() {
        String dateStr = DateUtil.format(new Date(), "yyyyMMdd");
        int seq = MATERIAL_SEQUENCE.getAndIncrement();
        if (seq > 9999) {
            MATERIAL_SEQUENCE.set(1);
            seq = 1;
        }
        return "MT" + dateStr + StrUtil.padPre(String.valueOf(seq), 4, '0');
    }

    public String generateCategoryCode() {
        String dateStr = DateUtil.format(new Date(), "yyyyMMdd");
        int seq = CATEGORY_SEQUENCE.getAndIncrement();
        if (seq > 9999) {
            CATEGORY_SEQUENCE.set(1);
            seq = 1;
        }
        return "CT" + dateStr + StrUtil.padPre(String.valueOf(seq), 4, '0');
    }
}
