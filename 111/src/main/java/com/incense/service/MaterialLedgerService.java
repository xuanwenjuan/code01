package com.incense.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.incense.context.UserContext;
import com.incense.dto.MaterialLedgerDTO;
import com.incense.entity.Material;
import com.incense.entity.MaterialLedger;
import com.incense.exception.BusinessException;
import com.incense.mapper.MaterialLedgerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MaterialLedgerService extends ServiceImpl<MaterialLedgerMapper, MaterialLedger> {

    private static final String LEDGER_STATS_KEY = "incense:ledger:stats:";

    private final MaterialService materialService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional(rollbackFor = Exception.class)
    public void addLedger(MaterialLedgerDTO dto) {
        Material material = materialService.getById(dto.getMaterialId());
        if (material == null) {
            throw new BusinessException("原料不存在");
        }

        MaterialLedger ledger = new MaterialLedger();
        BeanUtils.copyProperties(dto, ledger);
        ledger.setMaterialName(material.getMaterialName());
        ledger.setLedgerNo(generateLedgerNo());
        ledger.setOperatorId(UserContext.getUserId());
        ledger.setOperatorName(UserContext.getUsername());
        ledger.setCreateTime(LocalDateTime.now());

        if (dto.getUnitPrice() != null) {
            ledger.setTotalAmount(dto.getUnitPrice().multiply(dto.getQuantity()));
        }

        save(ledger);

        BigDecimal quantity = "OUT".equals(dto.getLedgerType())
                ? dto.getQuantity().negate()
                : dto.getQuantity();
        materialService.updateStock(dto.getMaterialId(), quantity);
        clearLedgerCache();
    }

    public Page<MaterialLedger> getPage(int pageNum, int pageSize, String ledgerType, Long materialId,
                                         LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<MaterialLedger> wrapper = new LambdaQueryWrapper<>();
        if (ledgerType != null && !ledgerType.isEmpty()) {
            wrapper.eq(MaterialLedger::getLedgerType, ledgerType);
        }
        if (materialId != null) {
            wrapper.eq(MaterialLedger::getMaterialId, materialId);
        }
        if (startDate != null) {
            wrapper.ge(MaterialLedger::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(MaterialLedger::getCreateTime, endDate.atTime(23, 59, 59));
        }
        wrapper.orderByDesc(MaterialLedger::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getLedgerStats(Integer year, Integer month) {
        String key = LEDGER_STATS_KEY + (year != null ? year : "all") + ":" + (month != null ? month : "all");
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return (Map<String, Object>) cached;
        }

        LambdaQueryWrapper<MaterialLedger> wrapper = new LambdaQueryWrapper<>();
        if (year != null) {
            wrapper.apply("YEAR(create_time) = {0}", year);
        }
        if (month != null) {
            wrapper.apply("MONTH(create_time) = {0}", month);
        }
        List<MaterialLedger> ledgers = list(wrapper);

        Map<String, Object> stats = new HashMap<>();
        BigDecimal totalInQty = BigDecimal.ZERO;
        BigDecimal totalOutQty = BigDecimal.ZERO;
        BigDecimal totalInAmount = BigDecimal.ZERO;
        BigDecimal totalOutAmount = BigDecimal.ZERO;

        for (MaterialLedger ledger : ledgers) {
            if ("IN".equals(ledger.getLedgerType())) {
                totalInQty = totalInQty.add(ledger.getQuantity());
                if (ledger.getTotalAmount() != null) {
                    totalInAmount = totalInAmount.add(ledger.getTotalAmount());
                }
            } else {
                totalOutQty = totalOutQty.add(ledger.getQuantity());
                if (ledger.getTotalAmount() != null) {
                    totalOutAmount = totalOutAmount.add(ledger.getTotalAmount());
                }
            }
        }

        stats.put("totalInQty", totalInQty);
        stats.put("totalOutQty", totalOutQty);
        stats.put("totalInAmount", totalInAmount);
        stats.put("totalOutAmount", totalOutAmount);
        stats.put("totalCount", ledgers.size());

        redisTemplate.opsForValue().set(key, stats);
        return stats;
    }

    private String generateLedgerNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = count(new LambdaQueryWrapper<MaterialLedger>()
                .likeRight(MaterialLedger::getLedgerNo, "LD" + dateStr));
        return "LD" + dateStr + String.format("%04d", count + 1);
    }

    private void clearLedgerCache() {
        Set<String> keys = redisTemplate.keys(LEDGER_STATS_KEY + "*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
}
