package com.amber.customize.util;

import org.springframework.beans.BeanUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class BeanConvertUtil extends BeanUtils {

    public static <S, T> T convert(S source, Supplier<T> targetSupplier) {
        T target = targetSupplier.get();
        if (source != null) {
            copyProperties(source, target);
        }
        return target;
    }

    public static <S, T> List<T> convertList(List<S> sourceList, Supplier<T> targetSupplier) {
        List<T> targetList = new ArrayList<>(sourceList.size());
        for (S source : sourceList) {
            T target = targetSupplier.get();
            copyProperties(source, target);
            targetList.add(target);
        }
        return targetList;
    }

}
