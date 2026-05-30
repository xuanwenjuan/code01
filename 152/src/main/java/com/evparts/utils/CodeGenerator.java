package com.evparts.utils;

import cn.hutool.core.date.DateUtil;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class CodeGenerator {

    private static final AtomicInteger BATCH_SEQUENCE = new AtomicInteger(1);
    private static final AtomicInteger ORDER_SEQUENCE = new AtomicInteger(1);
    private static final AtomicInteger COST_SEQUENCE = new AtomicInteger(1);

    private static String lastBatchDate = "";
    private static String lastOrderDate = "";
    private static String lastCostDate = "";

    public synchronized String generateBatchNo(String prefix) {
        String today = DateUtil.format(new Date(), "yyyyMMdd");
        if (!today.equals(lastBatchDate)) {
            lastBatchDate = today;
            BATCH_SEQUENCE.set(1);
        }
        int seq = BATCH_SEQUENCE.getAndIncrement();
        return prefix + today + String.format("%04d", seq);
    }

    public synchronized String generateWorkOrderNo() {
        String today = DateUtil.format(new Date(), "yyyyMMdd");
        if (!today.equals(lastOrderDate)) {
            lastOrderDate = today;
            ORDER_SEQUENCE.set(1);
        }
        int seq = ORDER_SEQUENCE.getAndIncrement();
        return "WO" + today + String.format("%05d", seq);
    }

    public synchronized String generateCostNo() {
        String today = DateUtil.format(new Date(), "yyyyMMdd");
        if (!today.equals(lastCostDate)) {
            lastCostDate = today;
            COST_SEQUENCE.set(1);
        }
        int seq = COST_SEQUENCE.getAndIncrement();
        return "COST" + today + String.format("%04d", seq);
    }

}
