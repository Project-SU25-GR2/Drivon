package Drivon.backend.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Div;
import com.itextpdf.layout.element.List;
import com.itextpdf.layout.element.ListItem;
import com.itextpdf.layout.property.TextAlignment;
import com.itextpdf.layout.property.VerticalAlignment;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class PDFService {

    public byte[] generateContractPDF(Map<String, Object> requestData) {
        try {
            // Lấy dữ liệu từ request
            String ownerName = (String) requestData.getOrDefault("ownerName", ".......................");
            String ownerPhone = (String) requestData.getOrDefault("ownerPhone", ".......................");
            String ownerEmail = (String) requestData.getOrDefault("ownerEmail", ".......................");
            String ownerAddress = (String) requestData.getOrDefault("ownerAddress", ".......................");
            String ownerIdCard = (String) requestData.getOrDefault("ownerIdCard", ".......................");
            
            String renterName = (String) requestData.getOrDefault("renterName", ".......................");
            String renterPhone = (String) requestData.getOrDefault("renterPhone", ".......................");
            String renterEmail = (String) requestData.getOrDefault("renterEmail", ".......................");
            String renterAddress = (String) requestData.getOrDefault("renterAddress", ".......................");
            String renterIdCard = (String) requestData.getOrDefault("renterIdCard", ".......................");
            String renterLicense = (String) requestData.getOrDefault("renterLicense", ".......................");
            
            String carBrand = (String) requestData.getOrDefault("carBrand", ".......................");
            String carModel = (String) requestData.getOrDefault("carModel", ".......................");
            String carColor = (String) requestData.getOrDefault("carColor", ".......................");
            String carPlate = (String) requestData.getOrDefault("carPlate", ".......................");
            String carVin = (String) requestData.getOrDefault("carVin", ".......................");
            String carEngine = (String) requestData.getOrDefault("carEngine", ".......................");
            
            String startDate = (String) requestData.getOrDefault("startDate", ".......................");
            String endDate = (String) requestData.getOrDefault("endDate", ".......................");
            String rentalDays = (String) requestData.getOrDefault("rentalDays", ".......................");
            
            String dailyPrice = (String) requestData.getOrDefault("dailyPrice", ".......................");
            String totalPrice = (String) requestData.getOrDefault("totalPrice", ".......................");
            String deposit = (String) requestData.getOrDefault("deposit", ".......................");
            
            // Tạo PDF thực sự với iText
            return createRealPDF(
                ownerName, ownerPhone, ownerEmail, ownerAddress, ownerIdCard,
                renterName, renterPhone, renterEmail, renterAddress, renterIdCard, renterLicense,
                carBrand, carModel, carColor, carPlate, carVin, carEngine,
                startDate, endDate, rentalDays, dailyPrice, totalPrice, deposit
            );
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo PDF hợp đồng: " + e.getMessage());
        }
    }
    
    private byte[] createRealPDF(String ownerName, String ownerPhone, String ownerEmail, 
                                String ownerAddress, String ownerIdCard,
                                String renterName, String renterPhone, String renterEmail, 
                                String renterAddress, String renterIdCard, String renterLicense,
                                String carBrand, String carModel, String carColor, 
                                String carPlate, String carVin, String carEngine,
                                String startDate, String endDate, String rentalDays,
                                String dailyPrice, String totalPrice, String deposit) throws IOException {
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);
        
        // Sử dụng font hỗ trợ tiếng Việt
        PdfFont font = PdfFontFactory.createFont("STSong-Light", "UniGB-UCS2-H", true);
        
        // Header
        Paragraph header1 = new Paragraph("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
            .setFont(font).setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER);
        Paragraph header2 = new Paragraph("Độc lập - Tự do - Hạnh phúc")
            .setFont(font).setFontSize(16).setItalic().setTextAlignment(TextAlignment.CENTER);
        Paragraph header3 = new Paragraph("HỢP ĐỒNG THUÊ XE Ô TÔ")
            .setFont(font).setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER);
        
        String contractNumber = LocalDateTime.now().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
        Paragraph header4 = new Paragraph("(Số: " + contractNumber + "/HĐTX)")
            .setFont(font).setFontSize(14).setTextAlignment(TextAlignment.CENTER);
        
        document.add(header1);
        document.add(header2);
        document.add(header3);
        document.add(header4);
        document.add(new Paragraph("\n"));
        
        // Ngày tháng
        Paragraph datePara = new Paragraph("Hôm nay, ngày ....................... tháng ....................... năm ......................., tại ........................")
            .setFont(font).setFontSize(12);
        document.add(datePara);
        
        Paragraph introPara = new Paragraph("Chúng tôi gồm có:")
            .setFont(font).setFontSize(12);
        document.add(introPara);
        document.add(new Paragraph("\n"));
        
        // Bên A
        Paragraph partyAHeader = new Paragraph("BÊN CHO THUÊ (BÊN A):")
            .setFont(font).setFontSize(14).setBold();
        document.add(partyAHeader);
        
        List partyAList = new List().setFont(font).setFontSize(12);
        partyAList.add(new ListItem("Cá nhân: Ông/Bà " + ownerName));
        partyAList.add(new ListItem("Sinh ngày: ......................."));
        partyAList.add(new ListItem("CMND/CCCD số: " + ownerIdCard + " do ....................... cấp ngày ......................."));
        partyAList.add(new ListItem("Địa chỉ thường trú: " + ownerAddress));
        partyAList.add(new ListItem("Số điện thoại liên hệ: " + ownerPhone));
        partyAList.add(new ListItem("Email: " + ownerEmail));
        partyAList.add(new ListItem("Số tài khoản ngân hàng: ....................... tại Ngân hàng ......................."));
        document.add(partyAList);
        document.add(new Paragraph("\n"));
        
        // Bên B
        Paragraph partyBHeader = new Paragraph("BÊN THUÊ (BÊN B):")
            .setFont(font).setFontSize(14).setBold();
        document.add(partyBHeader);
        
        List partyBList = new List().setFont(font).setFontSize(12);
        partyBList.add(new ListItem("Cá nhân: Ông/Bà " + renterName));
        partyBList.add(new ListItem("Sinh ngày: ......................."));
        partyBList.add(new ListItem("CMND/CCCD số: " + renterIdCard + " do ....................... cấp ngày ......................."));
        partyBList.add(new ListItem("Giấy phép lái xe hạng: " + renterLicense + " số ....................... có giá trị đến ......................."));
        partyBList.add(new ListItem("Địa chỉ thường trú: " + renterAddress));
        partyBList.add(new ListItem("Số điện thoại liên hệ: " + renterPhone));
        partyBList.add(new ListItem("Email: " + renterEmail));
        document.add(partyBList);
        document.add(new Paragraph("\n"));
        
        // Nội dung hợp đồng
        Paragraph agreementPara = new Paragraph("Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng thuê xe ô tô (sau đây gọi tắt là \"Hợp đồng\") với các điều khoản và điều kiện chi tiết như sau:")
            .setFont(font).setFontSize(12);
        document.add(agreementPara);
        document.add(new Paragraph("\n"));
        
        // Điều 1
        Paragraph article1Header = new Paragraph("ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG")
            .setFont(font).setFontSize(14).setBold();
        document.add(article1Header);
        
        Paragraph article1Content = new Paragraph("1.1. Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê 01 (một) xe ô tô (sau đây gọi là \"Xe\") với các đặc điểm sau:")
            .setFont(font).setFontSize(12);
        document.add(article1Content);
        
        List carDetailsList = new List().setFont(font).setFontSize(12);
        carDetailsList.add(new ListItem("Loại xe: " + carBrand + " " + carModel));
        carDetailsList.add(new ListItem("Màu sơn: " + carColor));
        carDetailsList.add(new ListItem("Biển số đăng ký: " + carPlate));
        carDetailsList.add(new ListItem("Số khung: " + carVin));
        carDetailsList.add(new ListItem("Số máy: " + carEngine));
        document.add(carDetailsList);
        
        // Điều 2
        Paragraph article2Header = new Paragraph("ĐIỀU 2: THỜI HẠN THUÊ VÀ MỤC ĐÍCH SỬ DỤNG")
            .setFont(font).setFontSize(14).setBold();
        document.add(article2Header);
        
        List rentalDetailsList = new List().setFont(font).setFontSize(12);
        rentalDetailsList.add(new ListItem("Thời gian thuê là: " + rentalDays + " ngày"));
        rentalDetailsList.add(new ListItem("Bắt đầu từ: " + startDate));
        rentalDetailsList.add(new ListItem("Kết thúc vào: " + endDate));
        document.add(rentalDetailsList);
        
        // Điều 3
        Paragraph article3Header = new Paragraph("ĐIỀU 3: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN")
            .setFont(font).setFontSize(14).setBold();
        document.add(article3Header);
        
        List priceDetailsList = new List().setFont(font).setFontSize(12);
        priceDetailsList.add(new ListItem("Đơn giá thuê là: " + dailyPrice + " VNĐ/ngày"));
        priceDetailsList.add(new ListItem("Tổng giá trị Hợp đồng: " + totalPrice + " VNĐ"));
        priceDetailsList.add(new ListItem("Tiền đặt cọc: " + deposit + " VNĐ"));
        document.add(priceDetailsList);
        
        // Chữ ký
        document.add(new Paragraph("\n\n"));
        Paragraph signaturePara = new Paragraph("BÊN GIAO (BÊN A)                    BÊN NHẬN (BÊN B)")
            .setFont(font).setFontSize(12).setTextAlignment(TextAlignment.CENTER);
        document.add(signaturePara);
        
        Paragraph signatureNote = new Paragraph("(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)")
            .setFont(font).setFontSize(12).setTextAlignment(TextAlignment.CENTER);
        document.add(signatureNote);
        
        // Phụ lục
        document.add(new Paragraph("\n\n"));
        Paragraph appendixHeader = new Paragraph("PHỤ LỤC 01: BIÊN BẢN BÀN GIAO XE")
            .setFont(font).setFontSize(16).setBold().setTextAlignment(TextAlignment.CENTER);
        document.add(appendixHeader);
        
        document.close();
        return baos.toByteArray();
    }
} 