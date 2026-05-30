package com.household.management.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.household.management.entity.FinishedProductStock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface FinishedProductStockMapper extends BaseMapper<FinishedProductStock> {

    @Select("SELECT fps.*, p.product_name, p.product_code, p.specification, p.unit " +
            "FROM finished_product_stock fps " +
            "LEFT JOIN product p ON fps.product_id = p.id " +
            "WHERE fps.deleted = 0 " +
            "ORDER BY fps.id DESC")
    List<FinishedProductStock> selectStockListWithProduct();

    @Select("SELECT fps.*, p.product_name, p.product_code, p.specification, p.unit " +
            "FROM finished_product_stock fps " +
            "LEFT JOIN product p ON fps.product_id = p.id " +
            "WHERE fps.deleted = 0 AND fps.product_id = #{productId}")
    FinishedProductStock selectByProductId(@Param("productId") Long productId);

    @Update("UPDATE finished_product_stock SET quantity = quantity + #{quantity}, " +
            "update_time = NOW() WHERE product_id = #{productId} AND deleted = 0")
    int addStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @Update("UPDATE finished_product_stock SET quantity = quantity - #{quantity}, " +
            "update_time = NOW() WHERE product_id = #{productId} AND deleted = 0 AND quantity >= #{quantity}")
    int deductStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}
