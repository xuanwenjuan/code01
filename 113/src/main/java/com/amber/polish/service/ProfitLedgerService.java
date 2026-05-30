package com.amber.polish.service;

import com.amber.polish.dto.ProfitLedgerDTO;
import com.amber.polish.entity.ProfitLedger;
import com.amber.polish.vo.ProfitStatisticsVO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;

import java.time.LocalDate;
import java.util.List;

public interface ProfitLedgerService extends IService<ProfitLedger> {

    Page<ProfitLedger> getLedgerPage(int pageNum, int pageSize, Long categoryId, LocalDate startDate, LocalDate endDate);

    boolean createLedger(ProfitLedgerDTO dto);

    boolean createLedger(ProfitLedger profitLedger);

    List<ProfitStatisticsVO> statisticsByCategory(LocalDate startDate, LocalDate endDate);
}
