package Drivon.backend.dto;

public class UserImageUploadRequest {
    private Long userId;
    private String imageUrl;
    private String documentType;
    private String description;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
} 