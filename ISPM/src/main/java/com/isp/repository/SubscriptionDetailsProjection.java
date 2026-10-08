package com.isp.repository;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface SubscriptionDetailsProjection {

    Integer getSubscriptionId();

    String getCustomerName();

    String getEmail();

    String getPlanName();

    String getSpeed();

    BigDecimal getMonthlyPrice();

    LocalDate getStartDate();

    String getStatus();
}