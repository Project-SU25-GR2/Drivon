package Drivon.backend.model;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long orderCode;
    private Integer amount;
    private String description;
    private String returnUrl;
    private String cancelUrl;

    public void setOrderCode(String orderCode) {
        this.orderCode = Long.parseLong(orderCode);
    }

    public Long getOrderCode() {
        return orderCode;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getCancelUrl() {
        return cancelUrl;
    }

    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }
}