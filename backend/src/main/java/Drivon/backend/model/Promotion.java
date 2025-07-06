package Drivon.backend.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "promotions")
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long promo_id;

    private String code;
    private Integer discount_percent;
    private Date valid_until;
    @Column(name = "max_users")
    private Integer maxUsers;

    public Long getPromo_id() {
        return promo_id;
    }

    public void setPromo_id(Long promo_id) {
        this.promo_id = promo_id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getDiscount_percent() {
        return discount_percent;
    }

    public void setDiscount_percent(Integer discount_percent) {
        this.discount_percent = discount_percent;
    }

    public Date getValid_until() {
        return valid_until;
    }

    public void setValid_until(Date valid_until) {
        this.valid_until = valid_until;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }
}