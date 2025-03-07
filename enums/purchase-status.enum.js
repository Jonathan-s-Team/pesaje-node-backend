const PurchaseStatusEnum = Object.freeze({
    DRAFT: "DRAFT",
    IN_PROGRESS: "IN_PROGRESS",
    READY_FOR_CONFIRMATION: "READY_FOR_CONFIRMATION",
    COMPLETED: "COMPLETED",
    CANCELED: "CANCELED"
});

module.exports = PurchaseStatusEnum;
