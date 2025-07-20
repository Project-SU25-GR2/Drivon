import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// import "./ContractForm.css";
import "./CarLeaseContractForm.css";
import "./RentYourCarForm.css";
import cloudinaryConfig from "../../config/cloudinary";
import SimpleButton from "../others/SimpleButton";
import { API_URL } from '../../api/configApi';

const CarLeaseContractForm = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const contractData = location.state?.contractData;

  // Get user from localStorage as fallback
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUser = user || storedUser;

  const [formData, setFormData] = useState({
    contractNumber: contractData?.contractNumber || "",
    carId: contractData?.carId || "",
    ownerId: currentUser?.userId || "",
    customerId: currentUser?.userId || "",
    deposit: contractData?.deposit || "",
    name: currentUser?.fullName || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    pricePerDay: contractData?.carData?.dailyRate || "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContractCreated, setIsContractCreated] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cccdImages, setCccdImages] = useState([]);
  const [zoomImg, setZoomImg] = useState(null);

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
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.userId) {
      axios.get(`${API_URL}/user/image?userId=${currentUser.userId}`)
        .then(res => {
          const cccdImgs = (res.data || []).filter(img => img.documentType === 'cccd');
          setCccdImages(cccdImgs.map(img => img.imageUrl));
        })
        .catch(() => setCccdImages([]));
    }
  }, [currentUser?.userId]);

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
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contractNumber) {
      newErrors.contractNumber = "Please enter contract number";
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
    if (!formData.email) {
      newErrors.email = "Please enter email";
    }
    if (!acceptedTerms) {
      newErrors.terms = "Please accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateContractNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `HD${timestamp}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (!acceptedTerms) {
        setMessage("Vui lòng chấp nhận điều khoản và chính sách sử dụng để tiếp tục");
        return;
      }
      setMessage("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    setMessage("Creating contract...");

    // // Kiểm tra carId đã tồn tại chưa
    // try {
    //   const checkResponse = await axios.get(
    //     `${API_URL}/contracts/check-car/${formData.carId}`
    //   );
    //   if (checkResponse.data.exists) {
    //     setMessage(
    //       "Car ID already exists in the system. Please choose another car."
    //     );
    //     setIsSubmitting(false);
    //     return;
    //   }
    // } catch (error) {
    //   setMessage(
    //     "Error checking car ID: " +
    //       (error.response?.data?.error || error.message)
    //   );
    //   setIsSubmitting(false);
    //   return;
    // }

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
      carId: formData.carId.toString(),
      customerId: formData.ownerId,
      deposit: parseFloat(formData.deposit) || 0,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      pricePerDay: parseFloat(formData.pricePerDay) || 0,
      carData: contractData?.carData,
    };

    try {
      // Gửi thông tin hợp đồng lên backend (không có pdfUrl)
      const response = await axios.post(
        `${API_URL}/contracts/lease`,
        formattedData
      );

      // Sau khi tạo hợp đồng thành công, lưu ảnh vào car_images nếu có
      if (
        contractData?.carData?.images &&
        contractData.carData.images.length > 0
      ) {
        try {
          // Lấy ảnh đầu tiên làm main image, các ảnh còn lại là other images
          const mainImage = contractData.carData.images[0];
          const otherImages = contractData.carData.images.slice(1);

          await axios.post(`${API_URL}/cars/images`, {
            carId: formData.carId,
            mainImage: mainImage,
            otherImages: otherImages,
          });
        } catch (imgErr) {
          console.error("Lỗi khi lưu ảnh xe:", imgErr);
        }
      }

      // Lưu cavetImages nếu có
      if (contractData?.cavetImages && contractData.cavetImages.length > 0) {
        try {
          await axios.post(`${API_URL}/cars/images/cavet`, {
            carId: formData.carId,
            cavetImages: contractData.cavetImages,
          });
        } catch (cavetErr) {
          console.error("Lỗi khi lưu ảnh cavet:", cavetErr);
        }
      }
      
      // Save otherDocImages if available
      if (contractData?.otherDocImages && contractData.otherDocImages.length > 0) {
        try {
          await axios.post(`${API_URL}/cars/images/other`, {
            carId: formData.carId,
            otherDocumentImages: contractData.otherDocImages,
          });
        } catch (otherErr) {
          console.error("Error saving other document images:", otherErr);
        }
      }

      if (response.data) {
        setMessage("Contract created successfully! Your partner application has been submitted.");
        setIsContractCreated(true);
        navigate("/contracts"); // Navigate to contracts page after successful creation
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
    <div className="lease-container">
      <h2 className="lease-title">Partner Registration Form</h2>
      {message && (
        <div
          className={`lease-message ${message.includes("successfully") ? "lease-success" : "lease-error"}`}
        >
          {message}
        </div>
      )}

      {contractData?.carData && (
        <div className="lease-section-card">
          <h3 className="lease-section-title">Vehicle Information</h3>
          <div className="lease-info-grid">
            <div className="lease-info-item"><label>Brand:</label><span>{contractData.carData.brand || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Model:</label><span>{contractData.carData.model || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Year:</label><span>{contractData.carData.year || 'N/A'}</span></div>
            <div className="lease-info-item"><label>License Plate:</label><span>{contractData.carData.licensePlate || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Owner ID:</label><span>{contractData.carData.ownerId || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Seats:</label><span>{contractData.carData.seats || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Type:</label><span>{contractData.carData.type || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Transmission:</label><span>{contractData.carData.transmission || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Fuel Type:</label><span>{contractData.carData.fuelType || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Fuel Consumption:</label><span>{contractData.carData.fuelConsumption ? contractData.carData.fuelConsumption + ' L/100km' : 'N/A'}</span></div>
            <div className="lease-info-item"><label>Status:</label><span>{contractData.carData.status || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Location:</label><span>{contractData.carData.location || 'N/A'}</span></div>
            <div className="lease-info-item lease-full-width"><label>Description:</label><span>{contractData.carData.description || 'N/A'}</span></div>
          </div>
          {contractData.carData.images && contractData.carData.images.length > 0 && (
            <div className="lease-image-section">
              <h4>Vehicle Images:</h4>
              <div className="lease-image-grid">
                {contractData.carData.images.map((image, index) => (
                  <img key={index} src={image} alt={`Car ${index + 1}`} />
                ))}
              </div>
            </div>
          )}
          {contractData.cavetImages && contractData.cavetImages.length > 0 && (
            <div className="lease-image-section">
              <h4>Vehicle Registration (Cavet) Images:</h4>
              <div className="lease-image-grid">
                {contractData.cavetImages.map((image, index) => (
                  <img key={index} src={image} alt={`Cavet ${index + 1}`} />
                ))}
              </div>
            </div>
          )}
          {contractData.otherDocImages && contractData.otherDocImages.length > 0 && (
            <div className="lease-image-section">
              <h4>Other Document Images:</h4>
              <div className="lease-image-grid">
                {contractData.otherDocImages.map((image, index) => (
                  <img key={index} src={image} alt={`Other Doc ${index + 1}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="lease-form-grid">
        <div className="lease-form-group">
          <label>Deposit:</label>
          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleChange}
            className={errors.deposit ? "lease-error-input" : ""}
            required
          />
          {errors.deposit && (
            <div className="lease-field-error">{errors.deposit}</div>
          )}
        </div>
        <div className="lease-form-group">
          <label>Price per Day (VND):</label>
          <input
            type="number"
            name="pricePerDay"
            value={formData.pricePerDay}
            onChange={handleChange}
            className={errors.pricePerDay ? "lease-error-input" : ""}
            required
          />
          {errors.pricePerDay && (
            <div className="lease-field-error">{errors.pricePerDay}</div>
          )}
        </div>
        <div className="lease-form-group">
          <label>Contract Number:</label>
          <input
            type="text"
            name="contractNumber"
            value={formData.contractNumber}
            readOnly
            className={errors.contractNumber ? "lease-error-input" : "lease-readonly-input"}
            required
          />
          {errors.contractNumber && (
            <div className="lease-field-error">{errors.contractNumber}</div>
          )}
        </div>
        <div className="lease-form-group">
          <label>Car ID:</label>
          <input
            type="text"
            name="carId"
            value={formData.carId}
            readOnly
            className={errors.carId ? "lease-error-input" : "lease-readonly-input"}
            required
          />
          {errors.carId && <div className="lease-field-error">{errors.carId}</div>}
        </div>
        <div className="lease-form-group">
          <label>Owner ID:</label>
          <input
            type="text"
            name="ownerId"
            value={formData.ownerId}
            readOnly
            className="lease-readonly-input"
          />
        </div>
        <div className="lease-form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "lease-error-input" : ""}
            required
          />
          {errors.name && <div className="lease-field-error">{errors.name}</div>}
        </div>
        <div className="lease-form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10,11}"
            className={errors.phone ? "lease-error-input" : ""}
            required
          />
          {errors.phone && <div className="lease-field-error">{errors.phone}</div>}
        </div>
        <div className="lease-form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="lease-readonly-input"
          />
        </div>
        {cccdImages.length > 0 && (
          <div className="lease-image-section">
            <h4>Verified Citizen ID Images</h4>
            <div className="lease-image-grid">
              {cccdImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`CCCD ${idx + 1}`}
                  style={{ cursor: 'zoom-in' }}
                  onClick={() => setZoomImg(img)}
                />
              ))}
            </div>
          </div>
        )}
        {zoomImg && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onClick={() => setZoomImg(null)}
          >
            <img
              src={zoomImg}
              alt="Zoom CCCD"
              style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 2px 16px #0008' }}
              onClick={e => e.stopPropagation()}
            />
            <button
              style={{ position: 'fixed', top: 30, right: 40, fontSize: 32, color: '#fff', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10000 }}
              onClick={() => setZoomImg(null)}
              aria-label="Close"
            >×</button>
          </div>
        )}
        <div className="lease-form-group lease-full-width">
          <div className="partner-terms-checkbox">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
              disabled={isContractCreated}
            />
            <div style={{flex:1}}>
              <label htmlFor="acceptTerms">
                Tôi đã đọc và đồng ý với <button 
                  type="button" 
                  onClick={() => setShowTermsModal(true)}
                  disabled={isContractCreated}
                >
                  Điều khoản và Chính sách sử dụng
                </button> của nền tảng Drivon
              </label>
              {!acceptedTerms && errors.terms && (
                <div className="partner-terms-error">
                  Vui lòng chấp nhận điều khoản và chính sách để tiếp tục
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="lease-form-group lease-full-width">
          <SimpleButton
            type="submit"
            disabled={!acceptedTerms || isContractCreated}
            isLoading={isSubmitting}
            className="lease-submit-btn"
          >
            Create Contract
          </SimpleButton>
        </div>
      </form>
      
      {/* --- Terms and Conditions Modal --- */}
      {showTermsModal && (
        <div className="partner-terms-modal">
          <div className="partner-terms-modal-content">
            {/* Modal Header */}
            <div className="partner-terms-modal-header">
              <h2>
                📄 ĐIỀU KHOẢN VÀ CHÍNH SÁCH SỬ DỤNG
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="partner-terms-modal-close"
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="partner-terms-modal-body">
              <p style={{color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                (Áp dụng cho người dùng nền tảng Drivon)<br/>
                Cập nhật ngày: [●]
              </p>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>1. ĐỊNH NGHĨA</h3>
                <ul>
                  <li><strong>Drivon:</strong> Nền tảng trực tuyến (bao gồm website và ứng dụng) cung cấp dịch vụ kết nối giữa người thuê xe tự lái và chủ xe.</li>
                  <li><strong>Người thuê:</strong> Cá nhân hoặc tổ chức sử dụng nền tảng để tìm và thuê xe từ chủ xe.</li>
                  <li><strong>Chủ xe (Owner):</strong> Cá nhân hoặc tổ chức sở hữu phương tiện và đăng xe lên nền tảng để cho thuê.</li>
                  <li><strong>Giao dịch thuê xe:</strong> Bao gồm quá trình đặt xe, thanh toán, bàn giao, sử dụng và hoàn trả xe giữa người thuê và chủ xe.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>2. VAI TRÒ CỦA DRIVON</h3>
                <ul>
                  <li>Drivon là nền tảng trung gian kết nối, không phải là bên cho thuê xe, không sở hữu xe, không đại diện cho bất kỳ người thuê hoặc chủ xe nào.</li>
                  <li>Drivon không tham gia vào giao dịch thuê xe, bao gồm: đàm phán giá, bàn giao xe, xác minh người thuê, hoặc ký hợp đồng thuê xe.</li>
                  <li>Mọi thông tin về phương tiện, giá thuê, điều kiện thuê… là do chủ xe cung cấp, Drivon không chịu trách nhiệm về tính xác thực hoặc chất lượng của thông tin này.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>3. ĐIỀU KHOẢN DÀNH CHO NGƯỜI THUÊ</h3>
                <p style={{marginBottom: '0.8rem'}}>Người thuê khi sử dụng nền tảng Drivon đồng ý rằng:</p>
                <ul>
                  <li>Cung cấp thông tin cá nhân chính xác và chịu trách nhiệm với các thông tin đã khai báo.</li>
                  <li>Tự chịu trách nhiệm với quá trình thuê, sử dụng và hoàn trả xe đúng thời hạn, đúng tình trạng.</li>
                  <li>Tuân thủ luật giao thông và các quy định pháp luật khi điều khiển phương tiện.</li>
                  <li>Chủ động liên hệ, đàm phán và giải quyết các vấn đề phát sinh trực tiếp với chủ xe.</li>
                  <li>Drivon không chịu trách nhiệm đối với bất kỳ sự cố nào xảy ra trong giao dịch thuê xe.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>4. ĐIỀU KHOẢN DÀNH CHO CHỦ XE (OWNER)</h3>
                <p style={{marginBottom: '0.8rem'}}>Chủ xe khi sử dụng nền tảng Drivon đồng ý rằng:</p>
                <ul>
                  <li>Là chủ sở hữu hợp pháp của xe hoặc có đủ quyền hợp pháp để cho thuê.</li>
                  <li>Cung cấp thông tin chính xác, cập nhật về phương tiện và chịu trách nhiệm với thông tin đó.</li>
                  <li>Tự quyết định điều kiện cho thuê, giá thuê, quy trình đặt cọc, giấy tờ và yêu cầu với người thuê.</li>
                  <li>Tự chịu trách nhiệm giải quyết mọi rủi ro phát sinh từ việc cho thuê xe (tai nạn, hư hỏng, vi phạm pháp luật, tranh chấp...).</li>
                  <li>Drivon không chịu trách nhiệm tài chính, pháp lý hay bồi thường trong bất kỳ trường hợp nào liên quan đến xe đã cho thuê.</li>
                </ul>
                <div className="highlight-box">
                  <strong style={{color: '#856404'}}>📌 Khuyến nghị quan trọng:</strong><br/>
                  Chủ xe nên lập hợp đồng thuê xe riêng bằng văn bản với người thuê trước khi bàn giao xe, bao gồm:
                  <ul style={{margin: '0.5rem 0 0 1.5rem'}}>
                    <li>Điều kiện sử dụng xe</li>
                    <li>Quy định về trách nhiệm khi xảy ra sự cố, mất mát</li>
                    <li>Quy trình xử lý tranh chấp, mức bồi thường, và các nghĩa vụ cụ thể</li>
                  </ul>
                  Drivon không cung cấp, không xác nhận và không lưu trữ hợp đồng này.
                </div>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>5. MIỄN TRỪ TRÁCH NHIỆM PHÁP LÝ</h3>
                <p style={{marginBottom: '0.8rem'}}>Bằng việc sử dụng nền tảng, người dùng xác nhận rằng:</p>
                <ul>
                  <li>Drivon không chịu trách nhiệm pháp lý, tài chính hoặc hình sự với bất kỳ sự cố nào phát sinh từ giao dịch thuê hoặc cho thuê xe.</li>
                  <li>Drivon không đại diện, không bảo đảm, không bảo lãnh cho chất lượng xe, hành vi người thuê hay chủ xe.</li>
                  <li>Drivon không chịu trách nhiệm trong các trường hợp tai nạn, vi phạm giao thông, gian lận, lừa đảo hoặc tranh chấp cá nhân giữa hai bên.</li>
                  <li>Trong trường hợp xảy ra sự cố, người dùng có trách nhiệm tự thương lượng, xử lý với bên còn lại. Drivon chỉ hỗ trợ cung cấp lịch sử giao dịch, nhật ký truy cập khi cần thiết.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>6. GIẢI QUYẾT TRANH CHẤP</h3>
                <ul>
                  <li>Mọi tranh chấp giữa người thuê và chủ xe phải được giải quyết trực tiếp giữa hai bên.</li>
                  <li>Drivon không tham gia tố tụng, hòa giải hay đứng ra đại diện cho bất kỳ bên nào.</li>
                  <li>Trong trường hợp được yêu cầu bởi cơ quan nhà nước, Drivon sẽ cung cấp dữ liệu liên quan như lịch sử giao dịch, hồ sơ tài khoản… trong phạm vi pháp luật cho phép.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>7. CAM KẾT VÀ RÀNG BUỘC</h3>
                <ul>
                  <li>Việc đăng ký tài khoản, đăng xe hoặc thuê xe thông qua nền tảng được xem là người dùng đã đọc, hiểu, đồng ý và ràng buộc với toàn bộ nội dung của bản điều khoản này.</li>
                  <li>Drivon có quyền cập nhật, chỉnh sửa nội dung chính sách và điều khoản này mà không cần thông báo trước.</li>
                  <li>Phiên bản mới sẽ được công bố công khai trên nền tảng và có hiệu lực kể từ thời điểm đăng tải.</li>
                </ul>
              </div>
              
              <div style={{marginBottom: '1.5rem'}}>
                <h3>8. HIỆU LỰC PHÁP LÝ</h3>
                <ul>
                  <li>Chính sách và Điều khoản sử dụng này có hiệu lực kể từ ngày công bố và áp dụng cho toàn bộ người dùng nền tảng Drivon.</li>
                  <li>Đây là một thỏa thuận sử dụng dịch vụ có giá trị pháp lý giữa người dùng và Drivon, có thể được sử dụng làm căn cứ giải trình với cơ quan chức năng hoặc trong tranh chấp dân sự (nếu có).</li>
                  <li>Người dùng có trách nhiệm đọc và cập nhật chính sách định kỳ.</li>
                </ul>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="partner-terms-modal-footer">
              <button
                onClick={() => setShowTermsModal(false)}
                className="partner-terms-modal-btn secondary"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="partner-terms-modal-btn primary"
              >
                Tôi đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarLeaseContractForm;
