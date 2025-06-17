package Drivon.backend.model;

public enum PaymentMethod {
    CREDIT_CARD("credit_card"),
    BANK("bank"),
    E_WALLET("e_wallet"),
    CASH("cash");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}