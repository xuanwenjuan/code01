package com.fishing.distribution.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fishing.distribution.common.Constants;
import com.fishing.distribution.dto.FishingBoatDTO;
import com.fishing.distribution.dto.FishingBoatQueryDTO;
import com.fishing.distribution.entity.FishingBoat;
import com.fishing.distribution.exception.BusinessException;
import com.fishing.distribution.mapper.FishingBoatMapper;
import com.fishing.distribution.vo.FishingBoatVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FishingBoatService {

    private final FishingBoatMapper fishingBoatMapper;

    @Transactional(rollbackFor = Exception.class)
    public void addBoat(FishingBoatDTO dto) {
        LambdaQueryWrapper<FishingBoat> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FishingBoat::getBoatCode, dto.getBoatCode());
        if (fishingBoatMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("渔船备案编号已存在");
        }

        FishingBoat boat = new FishingBoat();
        BeanUtils.copyProperties(dto, boat);
        fishingBoatMapper.insert(boat);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateBoat(Long id, FishingBoatDTO dto) {
        FishingBoat boat = fishingBoatMapper.selectById(id);
        if (boat == null) {
            throw new BusinessException("渔船不存在");
        }

        LambdaQueryWrapper<FishingBoat> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FishingBoat::getBoatCode, dto.getBoatCode())
                .ne(FishingBoat::getId, id);
        if (fishingBoatMapper.selectCount(queryWrapper) > 0) {
            throw new BusinessException("渔船备案编号已存在");
        }

        BeanUtils.copyProperties(dto, boat);
        fishingBoatMapper.updateById(boat);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteBoat(Long id) {
        fishingBoatMapper.deleteById(id);
    }

    public FishingBoatVO getBoatById(Long id) {
        FishingBoat boat = fishingBoatMapper.selectById(id);
        return convertToVO(boat);
    }

    public IPage<FishingBoatVO> getBoatPage(FishingBoatQueryDTO queryDTO) {
        Page<FishingBoat> page = new Page<>(queryDTO.getPageNum(), queryDTO.getPageSize());
        LambdaQueryWrapper<FishingBoat> queryWrapper = new LambdaQueryWrapper<>();

        if (queryDTO.getBoatName() != null && !queryDTO.getBoatName().isEmpty()) {
            queryWrapper.like(FishingBoat::getBoatName, queryDTO.getBoatName());
        }
        if (queryDTO.getBoatCode() != null && !queryDTO.getBoatCode().isEmpty()) {
            queryWrapper.like(FishingBoat::getBoatCode, queryDTO.getBoatCode());
        }
        if (queryDTO.getFleetName() != null && !queryDTO.getFleetName().isEmpty()) {
            queryWrapper.like(FishingBoat::getFleetName, queryDTO.getFleetName());
        }
        if (queryDTO.getApprovedArea() != null && !queryDTO.getApprovedArea().isEmpty()) {
            queryWrapper.like(FishingBoat::getApprovedArea, queryDTO.getApprovedArea());
        }
        if (queryDTO.getStatus() != null) {
            queryWrapper.eq(FishingBoat::getStatus, queryDTO.getStatus());
        }

        queryWrapper.orderByDesc(FishingBoat::getCreateTime);
        IPage<FishingBoat> boatPage = fishingBoatMapper.selectPage(page, queryWrapper);

        Page<FishingBoatVO> voPage = new Page<>(boatPage.getCurrent(), boatPage.getSize(), boatPage.getTotal());
        List<FishingBoatVO> voList = boatPage.getRecords().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
        voPage.setRecords(voList);
        return voPage;
    }

    public List<FishingBoatVO> getBoatList(Integer status) {
        LambdaQueryWrapper<FishingBoat> queryWrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            queryWrapper.eq(FishingBoat::getStatus, status);
        }
        queryWrapper.orderByDesc(FishingBoat::getCreateTime);
        return fishingBoatMapper.selectList(queryWrapper).stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    public List<FishingBoatVO> getExpiringLicenseBoats(Integer days) {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().plusDays(days);
        return fishingBoatMapper.selectBoatsWithExpiringLicense(startDate, endDate).stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    private FishingBoatVO convertToVO(FishingBoat boat) {
        if (boat == null) {
            return null;
        }
        FishingBoatVO vo = new FishingBoatVO();
        BeanUtils.copyProperties(boat, vo);
        vo.setStatusDesc(getStatusDesc(boat.getStatus()));
        return vo;
    }

    private String getStatusDesc(Integer status) {
        if (status == null) {
            return null;
        }
        return switch (status) {
            case 1 -> Constants.BOAT_STATUS_SAILING;
            case 2 -> Constants.BOAT_STATUS_DOCKED;
            case 3 -> Constants.BOAT_STATUS_REPAIR;
            default -> "未知";
        };
    }
}
