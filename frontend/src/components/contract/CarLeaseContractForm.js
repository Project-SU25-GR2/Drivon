import React, { useState, useEffect } from "react";
import axios from "axios";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { useLocation } from "react-router-dom";
import "../css/ContractForm.css";
import cloudinaryConfig from "../../config/cloudinary";
import Button from "../others/Button";

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

const CarLeaseContractForm = ({ user }) => {
  const location = useLocation();
  const contractData = location.state?.contractData;

  // Get user from localStorage as fallback
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = user || storedUser;

  const [formData, setFormData] = useState({
    contractNumber: contractData?.contractNumber || "",
    startDate: contractData?.startDate || "",
    endDate: contractData?.endDate || "",
    carId: contractData?.carId || "",
    ownerId: currentUser?.userId || "",
    customerId: currentUser?.userId || "",
    deposit: contractData?.deposit || "",
    name: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    cccd: currentUser?.cccd || "",
    email: currentUser?.email || "",
    terms: false,
    pricePerDay: contractData?.carData?.dailyRate || "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContractCreated, setIsContractCreated] = useState(false);

  useEffect(() => {
    if (contractData) {
      setFormData((prev) => ({
        ...prev,
        carId: contractData.carId,
        pricePerDay: contractData.carData?.dailyRate || prev.pricePerDay,
      }));
    }
  }, [contractData]);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        ownerId: currentUser.userId,
        customerId: currentUser.userId,
        name: currentUser.fullName || prev.name,
        phone: currentUser.phone || prev.phone,
        cccd: currentUser.cccd || prev.cccd,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate và set lỗi (chỉ hiển thị lỗi, không return)
    if (name === "phone" && value && !/^[0-9]{10,11}$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Phone number must be 10-11 digits",
      }));
    } else if (name === "cccd" && value && !/^[0-9]{12}$/.test(value)) {
      setErrors((prev) => ({ ...prev, [name]: "ID number must be 12 digits" }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contractNumber) {
      newErrors.contractNumber = "Please enter contract number";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Please select start date";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Please select end date";
    }
    if (!formData.carId) {
      newErrors.carId = "Please enter car ID";
    }
    if (!formData.name) {
      newErrors.name = "Please enter name";
    }
    if (!formData.phone) {
      newErrors.phone = "Please enter phone number";
    }
    if (!formData.cccd) {
      newErrors.cccd = "Please enter CCCD";
    }
    if (!formData.terms) {
      newErrors.terms = "Please accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePDF = (contractData) => {
    const docDefinition = {
      content: [
        {
          text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
          style: "header",
          alignment: "center",
        },
        {
          text: "Độc lập – Tự do – Hạnh phúc",
          style: "subheader",
          alignment: "center",
        },
        {
          text: "-------------------------------",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        {
          text: "HỢP ĐỒNG ĐĂNG KÍ CHO THUÊ XE",
          style: "title",
          alignment: "center",
          margin: [0, 10, 0, 0],
        },
        {
          text: `Ngày: ${new Date().toLocaleDateString("vi-VN")}`,
          alignment: "center",
        },
        {
          text: `Số HĐ: ${contractData.contractNumber}`,
          alignment: "center",
          margin: [0, 0, 0, 20],
        },

        { text: "BÊN A", style: "section" },
        { text: `Tên: ${contractData.name}` },
        { text: `Số điện thoại: ${contractData.phone}` },
        { text: `CCCD: ${contractData.cccd}` },
        { text: `Mail: ${contractData.email}`, margin: [0, 0, 0, 10] },

        { text: "BÊN B", style: "section" },
        { text: "Tên: Cty TNHH Group2" },
        { text: "Số điện thoại: 0394672210" },
        { text: "Mail: Binhvuong221004@gmail.com", margin: [0, 0, 0, 20] },

        { text: "THÔNG TIN XE", style: "section" },
        { text: `Hãng xe: ${contractData.carData?.brand || "N/A"}` },
        { text: `Model: ${contractData.carData?.model || "N/A"}` },
        { text: `Năm sản xuất: ${contractData.carData?.year || "N/A"}` },
        { text: `Biển số xe: ${contractData.carData?.licensePlate || "N/A"}` },
        { text: `Miêu tả: ${contractData.carData?.description || "N/A"}` },
        {
          text: `Địa điểm: ${contractData.carData?.location || "N/A"}`,
          margin: [0, 0, 0, 20],
        },

        { text: "THÔNG TIN BÊN THUÊ CẦN CUNG CẤP", style: "section" },
        { text: `Yêu cầu: CCCD/CMND/Hộ chiếu, Giấy phép lái xe` },
        {
          text: `Giá thuê/ngày: ${contractData.pricePerDay.toLocaleString(
            "vi-VN"
          )} VNĐ`,
        },
        {
          text: `Tiền cọc: ${contractData.deposit.toLocaleString("vi-VN")} VNĐ`,
          margin: [0, 0, 0, 20],
        },

        { text: "THÔNG TIN HỢP ĐỒNG", style: "section" },
        { text: `Ngày bắt đầu: ${contractData.startDate}` },
        {
          text: `Ngày kết thúc: ${contractData.endDate}`,
          margin: [0, 0, 0, 20],
        },

        { text: "ĐIỀU KHOẢN", style: "section" },
        {
          text: "Bên A đã đọc và đồng ý với các điều khoản của hợp đồng này.",
          margin: [0, 0, 0, 20],
        },
        { text: "☒ Đã đồng ý với điều khoản", margin: [0, 0, 0, 20] },

        {
          columns: [
            {
              width: "*",
              text: [
                { text: "BÊN A:\n", style: "section" },
                { text: `Tên: ${contractData.name}\n` },
                { text: 'Đã ký online "verify code"', italics: true },
              ],
            },
            {
              width: "*",
              text: [
                { text: "BÊN B:\n", style: "section" },
                { text: "Tên: Group2\n" },
                { text: "Đã ký!" },
              ],
            },
          ],
        },
      ],
      styles: {
        header: { fontSize: 14, bold: true },
        subheader: { fontSize: 12, italics: true },
        title: { fontSize: 16, bold: true },
        section: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    return new Promise((resolve) => {
      pdfMake.createPdf(docDefinition).getBlob((blob) => {
        resolve(blob);
      });
    });
  };

  const generateContractNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `HD${year}${month}${day}${random}`;
  };

  const uploadPDFToCloudinary = async (pdfBlob) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, "contract.pdf");
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("api_key", cloudinaryConfig.apiKey);
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`;
    const response = await axios.post(cloudinaryUrl, formData);
    return response.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    setMessage("Creating contract...");

    // Kiểm tra carId đã tồn tại chưa
    try {
      const checkResponse = await axios.get(
        `http://localhost:8080/api/contracts/check-car/${formData.carId}`
      );
      if (checkResponse.data.exists) {
        setMessage(
          "Car ID already exists in the system. Please choose another car."
        );
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      setMessage(
        "Error checking car ID: " +
          (error.response?.data?.error || error.message)
      );
      setIsSubmitting(false);
      return;
    }

    // Generate a new contract number
    const newContractNumber = generateContractNumber();

    // Update formData with the new contract number
    setFormData((prev) => ({
      ...prev,
      contractNumber: newContractNumber,
    }));

    // Ensure all required fields are present and properly formatted
    const formattedData = {
      contractNumber: newContractNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      carId: formData.carId.toString(),
      customerId: formData.customerId, // Use a default customer ID
      deposit: parseFloat(formData.deposit) || 0,
      name: formData.name,
      phone: formData.phone,
      cccd: formData.cccd,
      email: formData.email,
      pricePerDay: parseFloat(formData.pricePerDay) || 0,
      carData: contractData?.carData,
    };

    try {
      // 1. Generate PDF
      const pdfBlob = await generatePDF({
        ...formData,
        contractNumber: newContractNumber,
        carData: contractData?.carData,
      });

      // 2. Upload PDF lên Cloudinary
      let pdfUrl = "";
      try {
        pdfUrl = await uploadPDFToCloudinary(pdfBlob);
      } catch (err) {
        setMessage(
          "Lỗi khi upload PDF lên Cloudinary: " +
            (err.response?.data?.error || err.message)
        );
        setIsSubmitting(false);
        return;
      }

      // 3. Gửi thông tin hợp đồng + pdfUrl lên backend
      const response = await axios.post(
        "http://localhost:8080/api/contracts/lease",
        {
          ...formattedData,
          pdfUrl,
        }
      );

      // 4. Sau khi tạo hợp đồng thành công, lưu ảnh vào car_images nếu có
      if (
        contractData?.carData?.images &&
        contractData.carData.images.length > 0
      ) {
        try {
          // Lấy ảnh đầu tiên làm main image, các ảnh còn lại là other images
          const mainImage = contractData.carData.images[0];
          const otherImages = contractData.carData.images.slice(1);

          await axios.post("http://localhost:8080/api/cars/images", {
            carId: formData.carId,
            mainImage: mainImage,
            otherImages: otherImages,
          });
        } catch (imgErr) {
          console.error("Lỗi khi lưu ảnh xe:", imgErr);
        }
      }

      if (response.data) {
        setMessage("Contract created successfully!");
        setIsContractCreated(true);
        // Tạo URL từ pdfBlob và mở tab mới + tải file PDF về
        const localPdfUrl = URL.createObjectURL(pdfBlob);
        window.open(localPdfUrl, "_blank");
        const link = document.createElement("a");
        link.href = localPdfUrl;
        link.download = `hopdong_${newContractNumber}.pdf`;
        link.click();
        setTimeout(() => {
          URL.revokeObjectURL(localPdfUrl);
        }, 100);
      }
    } catch (error) {
      console.error("Error details:", error.response?.data);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).join(
          ", "
        );
        setMessage("Validation errors: " + errorMessages);
      } else {
        setMessage(
          "Error creating contract: " +
            (error.response?.data?.error || error.message)
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contract-form-container">
      <h2>Car Lease Agreement</h2>
      {message && (
        <div
          className={`message ${
            message.includes("successfully") ? "success" : "error"
          }`}
        >
          {message}
        </div>
      )}

      {contractData?.carData && (
        <div className="car-info-section">
          <h3>Vehicle Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Brand:</label>
              <span>{contractData.carData.brand}</span>
            </div>
            <div className="info-item">
              <label>Model:</label>
              <span>{contractData.carData.model}</span>
            </div>
            <div className="info-item">
              <label>Year:</label>
              <span>{contractData.carData.year}</span>
            </div>
            <div className="info-item">
              <label>License Plate:</label>
              <span>{contractData.carData.licensePlate}</span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <span>{contractData.carData.description}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span>{contractData.carData.type}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{contractData.carData.location}</span>
            </div>
          </div>
          {contractData.carData.images &&
            contractData.carData.images.length > 0 && (
              <div className="car-images">
                <h4>Vehicle Images:</h4>
                <div className="image-grid">
                  {contractData.carData.images.map((image, index) => (
                    <img key={index} src={image} alt={`Car ${index + 1}`} />
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Deposit:</label>
          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleChange}
            className={errors.deposit ? "error" : ""}
            required
          />
          {errors.deposit && (
            <div className="field-error">{errors.deposit}</div>
          )}
        </div>
        <div className="form-group">
          <label>Price per Day (VND):</label>
          <input
            type="number"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            className={errors.pricePerDay ? "error" : ""}
            required
          />
          {errors.pricePerDay && (
            <div className="field-error">{errors.pricePerDay}</div>
          )}
        </div>
        <div className="form-group">
          <label>Contract Number:</label>
          <input
            type="text"
            name="contractNumber"
            value={formData.contractNumber}
            onChange={handleChange}
            className={errors.contractNumber ? "error" : ""}
            required
          />
          {errors.contractNumber && (
            <div className="field-error">{errors.contractNumber}</div>
          )}
        </div>

        <div className="form-group">
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={errors.startDate ? "error" : ""}
            required
          />
          {errors.startDate && (
            <div className="field-error">{errors.startDate}</div>
          )}
        </div>

        <div className="form-group">
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={errors.endDate ? "error" : ""}
            required
          />
          {errors.endDate && (
            <div className="field-error">{errors.endDate}</div>
          )}
        </div>

        <div className="form-group">
          <label>Car ID:</label>
          <input
            type="text"
            name="carId"
            value={formData.carId}
            onChange={handleChange}
            className={errors.carId ? "error" : ""}
            required
          />
          {errors.carId && <div className="field-error">{errors.carId}</div>}
        </div>

        <div className="form-group">
          <label>Owner ID:</label>
          <input
            type="text"
            name="ownerId"
            value={formData.ownerId}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            required
          />
          {errors.name && <div className="field-error">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10,11}"
            className={errors.phone ? "error" : ""}
            required
          />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label>ID Number:</label>
          <input
            type="text"
            name="cccd"
            value={formData.cccd}
            onChange={handleChange}
            pattern="[0-9]{12}"
            className={errors.cccd ? "error" : ""}
            required
          />
          {errors.cccd && <div className="field-error">{errors.cccd}</div>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              required
              disabled={isContractCreated}
            />
            Đồng ý với điều khoản
          </label>
        </div>

        <Button
          type="submit"
          className="submit-button"
          disabled={!formData.terms || isContractCreated}
          isLoading={isSubmitting}
        >
          Create Contract
        </Button>
      </form>
    </div>
  );
};

export default CarLeaseContractForm;
