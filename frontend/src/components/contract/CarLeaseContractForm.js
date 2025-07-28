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

  const [termsTab, setTermsTab] = useState('en');

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


    setFormData((prev) => ({
      ...prev,
      contractNumber: newContractNumber,
    }));


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
    
      const response = await axios.post(
        `${API_URL}/contracts/lease`,
        formattedData
      );


      if (
        contractData?.carData?.images &&
        contractData.carData.images.length > 0
      ) {
        try {

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
            <div className="lease-info-item"><label>Brand: </label><span>{contractData.carData.brand || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Model: </label><span>{contractData.carData.model || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Year: </label><span>{contractData.carData.year || 'N/A'}</span></div>
            <div className="lease-info-item"><label>License Plate: </label><span>{contractData.carData.licensePlate || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Owner ID: </label><span>{contractData.carData.ownerId || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Seats: </label><span>{contractData.carData.seats || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Type: </label><span>{contractData.carData.type || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Transmission: </label><span>{contractData.carData.transmission || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Fuel Type: </label><span>{contractData.carData.fuelType || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Fuel Consumption: </label><span>{contractData.carData.fuelConsumption ? contractData.carData.fuelConsumption + ' L/100km' : 'N/A'}</span></div>
            <div className="lease-info-item"><label>Status: </label><span>{contractData.carData.status || 'N/A'}</span></div>
            <div className="lease-info-item"><label>Location: </label><span>{contractData.carData.location || 'N/A'}</span></div>
            <div className="lease-info-item lease-full-width"><label>Description: </label><span>{contractData.carData.description || 'N/A'}</span></div>
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
          <label>Application Number:</label>
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
                I have read and agree to the <button 
                  type="button" 
                  onClick={() => setShowTermsModal(true)}
                  disabled={isContractCreated}
                >
                  Terms of Use and Privacy Policy
                </button> of Drivon
              </label>
              {!acceptedTerms && errors.terms && (
                <div className="partner-terms-error">
                  Please accept the terms and privacy policy to continue
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
            Register Partner Application
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
                📄 TERMS OF USE AND PRIVACY POLICY
              </h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="partner-terms-modal-close"
              >
                ×
              </button>
            </div>
            {/* Tabs */}
            <div className="partner-terms-modal-tabs" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                className={termsTab === 'en' ? 'active' : ''}
                style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: termsTab === 'en' ? '#eee' : '#fff', cursor: 'pointer' }}
                onClick={() => setTermsTab('en')}
              >
                English
              </button>
              <button
                className={termsTab === 'vi' ? 'active' : ''}
                style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: termsTab === 'vi' ? '#eee' : '#fff', cursor: 'pointer' }}
                onClick={() => setTermsTab('vi')}
              >
                Tiếng Việt
              </button>
            </div>
            {/* Modal Content */}
            <div className="partner-terms-modal-body">
              {termsTab === 'en' ? (
                <>
                  <p style={{color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                    (Applies to Drivon platform users)<br/>
                    Updated on: [●]
                  </p>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>1. DEFINITIONS</h3>
                    <ul>
                      <li><strong>Drivon:</strong> Online platform (including website and application) providing services to connect car renters and car owners.</li>
                      <li><strong>Renter:</strong> Individual or organization using the platform to find and rent cars from car owners.</li>
                      <li><strong>Car Owner (Owner):</strong> Individual or organization owning the vehicle and listing it on the platform for rent.</li>
                      <li><strong>Rental Transaction:</strong> Includes the process of booking, payment, delivery, use, and return of the car between renter and owner.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>2. ROLE OF DRIVON</h3>
                    <ul>
                      <li>Drivon is a platform intermediary, not a car rental party, does not own cars, does not represent any renter or car owner.</li>
                      <li>Drivon does not participate in rental transactions, including: negotiation of price, delivery of car, verification of renter, or signing of rental agreement.</li>
                      <li>All information about the vehicle, rental price, rental conditions… is provided by the car owner, Drivon is not responsible for the accuracy or quality of this information.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>3. TERMS FOR RENTERS</h3>
                    <p style={{marginBottom: '0.8rem'}}>When using the Drivon platform, renters agree that:</p>
                    <ul>
                      <li>Provide accurate personal information and assume responsibility for the information declared.</li>
                      <li>Take responsibility for the rental process, use, and return of the car on time and in good condition.</li>
                      <li>Comply with traffic laws and all relevant laws and regulations when operating the vehicle.</li>
                      <li>Actively contact, negotiate, and resolve any issues arising directly with the car owner.</li>
                      <li>Drivon is not responsible for any incident arising from the rental transaction.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>4. TERMS FOR CAR OWNERS (OWNER)</h3>
                    <p style={{marginBottom: '0.8rem'}}>Car owners agree when using the Drivon platform that:</p>
                    <ul>
                      <li>Are the legal owner of the vehicle or have legal authorization to rent it.</li>
                      <li>Provide accurate, updated information about the vehicle and assume responsibility for it.</li>
                      <li>Independently decide on rental conditions, rental price, deposit procedure, documents, and requirements for renters.</li>
                      <li>Independently assume responsibility for resolving any disputes or risks arising from renting the car (accidents, damage, violations of law, disputes...).</li>
                      <li>Drivon is not responsible for financial, legal, or compensation matters arising from the car rented.</li>
                    </ul>
                    <div className="highlight-box">
                      <strong style={{color: '#856404'}}>📌 Important Note:</strong><br/>
                      Car owners should draw up a separate rental agreement in writing with the renter before delivering the car, including:
                      <ul style={{margin: '0.5rem 0 0 1.5rem'}}>
                        <li>Rental conditions</li>
                        <li>Rules for handling incidents, loss, and disputes</li>
                        <li>Specific obligations and procedures for dispute resolution, compensation, and other matters</li>
                      </ul>
                      Drivon does not provide, confirm, or store this agreement.
                    </div>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>5. DISCLAIMER OF LEGAL LIABILITY</h3>
                    <p style={{marginBottom: '0.8rem'}}>By using the platform, users confirm that:</p>
                    <ul>
                      <li>Drivon is not liable for any legal, financial, or criminal matters arising from the rental or rental transaction.</li>
                      <li>Drivon does not represent, guarantee, or guarantee the quality of the vehicle, renter's behavior, or car owner's behavior.</li>
                      <li>Drivon is not liable for any accidents, traffic violations, fraud, or personal disputes between the two parties.</li>
                      <li>In case of an incident, users are responsible for resolving it directly with the other party. Drivon only supports providing transaction history, access logs when necessary.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>6. DISPUTE RESOLUTION</h3>
                    <ul>
                      <li>All disputes between renters and car owners must be resolved directly between the two parties.</li>
                      <li>Drivon does not participate in litigation, mediation, or acting as an agent for any party.</li>
                      <li>In the event of a request from a public authority, Drivon will provide relevant data such as transaction history, account records… within the scope permitted by law.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>7. COMMITMENT AND BINDING</h3>
                    <ul>
                      <li>Registering an account, listing a car, or renting a car through the platform is deemed to be read, understood, agreed, and bound by all the terms of this agreement.</li>
                      <li>Drivon reserves the right to update, modify, and amend the terms and conditions of this policy without prior notice.</li>
                      <li>The new version will be published publicly on the platform and take effect from the date of publication.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>8. LEGAL EFFECTIVENESS</h3>
                    <ul>
                      <li>This Terms of Use and Privacy Policy is effective from the date of publication and applies to all users of the Drivon platform.</li>
                      <li>This is a legally binding agreement between users and Drivon, which can be used as a basis for explanation with public authorities or in civil disputes (if any).</li>
                      <li>Users are responsible for reading and updating the policy periodically.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <p style={{color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                    (Áp dụng cho người dùng nền tảng Drivon)<br/>
                    Cập nhật lần cuối: [●]
                  </p>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>1. ĐỊNH NGHĨA</h3>
                    <ul>
                      <li><strong>Drivon:</strong> Nền tảng trực tuyến (bao gồm trang web và ứng dụng) cung cấp dịch vụ để kết nối người thuê xe và chủ xe.</li>
                      <li><strong>Người thuê:</strong> Cá nhân hoặc tổ chức sử dụng nền tảng để tìm và thuê xe từ chủ xe.</li>
                      <li><strong>Chủ xe (Chủ sở hữu):</strong> Cá nhân hoặc tổ chức sở hữu xe và đăng tải nó trên nền tảng để cho thuê.</li>
                      <li><strong>Giao dịch thuê:</strong> Bao gồm quá trình đặt phòng, thanh toán, giao xe, sử dụng và trả xe giữa người thuê và chủ xe.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>2. VAI TRÒ CỦA DRIVON</h3>
                    <ul>
                      <li>Drivon là một nền tảng trung gian, không phải là một bên thuê xe, không sở hữu xe, không đại diện cho bất kỳ người thuê hoặc chủ xe nào.</li>
                      <li>Drivon không tham gia vào các giao dịch thuê xe, bao gồm: thương lượng giá thuê, giao xe, xác minh người thuê hoặc ký kết hợp đồng thuê.</li>
                      <li>Tất cả thông tin về xe, giá thuê, điều kiện thuê… được cung cấp bởi chủ xe, Drivon không chịu trách nhiệm về tính chính xác hoặc chất lượng của thông tin này.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>3. ĐIỀU KHOẢN CHO NGƯỜI THUÊ</h3>
                    <p style={{marginBottom: '0.8rem'}}>Khi sử dụng nền tảng Drivon, người thuê đồng ý rằng:</p>
                    <ul>
                      <li>Cung cấp thông tin cá nhân chính xác và chịu trách nhiệm về thông tin khai báo.</li>
                      <li>Chịu trách nhiệm về quá trình thuê xe, sử dụng và trả xe đúng thời gian và trạng thái tốt.</li>
                      <li>Tuân thủ các luật giao thông và tất cả các luật và văn bản pháp lý khi vận hành xe.</li>
                      <li>Tương tác tích cực, thương lượng và giải quyết các vấn đề xảy ra trực tiếp với chủ xe.</li>
                      <li>Drivon không chịu trách nhiệm về bất kỳ sự cố nào xảy ra từ giao dịch thuê xe.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>4. ĐIỀU KHOẢN CHO CHỦ XE (CHỦ SỞ HỮU)</h3>
                    <p style={{marginBottom: '0.8rem'}}>Chủ xe đồng ý khi sử dụng nền tảng Drivon rằng:</p>
                    <ul>
                      <li>Là chủ sở hữu pháp lý của xe hoặc có sự đồng ý pháp lý để cho thuê.</li>
                      <li>Cung cấp thông tin chính xác, cập nhật liên tục về xe và chịu trách nhiệm về nó.</li>
                      <li>Độc lập quyết định điều kiện thuê, giá thuê, thủ tục ký quỹ, tài liệu và yêu cầu của người thuê.</li>
                      <li>Độc lập chịu trách nhiệm giải quyết các tranh chấp hoặc rủi ro xảy ra từ việc cho thuê xe (tai nạn, hư hỏng, vi phạm pháp luật, tranh chấp...).</li>
                      <li>Drivon không chịu trách nhiệm về các vấn đề tài chính, pháp lý hoặc bồi thường xảy ra từ xe được thuê.</li>
                    </ul>
                    <div className="highlight-box">
                      <strong style={{color: '#856404'}}>📌 Ghi chú quan trọng:</strong><br/>
                      Chủ xe nên lập một thỏa thuận thuê riêng biệt bằng văn bản với người thuê trước khi giao xe, bao gồm:
                      <ul style={{margin: '0.5rem 0 0 1.5rem'}}>
                        <li>Điều kiện thuê</li>
                        <li>Quy tắc xử lý sự cố, thiệt hại và tranh chấp</li>
                        <li>Trách nhiệm và thủ tục cụ thể cho việc giải quyết tranh chấp, bồi thường và các vấn đề khác</li>
                      </ul>
                      Drivon không cung cấp, xác nhận hoặc lưu trữ thỏa thuận này.
                    </div>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>5. PHÁT TRIỂN HỢP LÝ CỦA TRÁCH NHIỆM PHÁP LÝ</h3>
                    <p style={{marginBottom: '0.8rem'}}>Bằng cách sử dụng nền tảng, người dùng xác nhận rằng:</p>
                    <ul>
                      <li>Drivon không chịu trách nhiệm về bất kỳ vấn đề pháp lý, tài chính hoặc tội phạm nào xảy ra từ việc thuê hoặc giao dịch thuê.</li>
                      <li>Drivon không đại diện, cam kết hoặc bảo đảm về chất lượng xe, hành vi của người thuê hoặc hành vi của chủ xe.</li>
                      <li>Drivon không chịu trách nhiệm về bất kỳ tai nạn, vi phạm pháp luật, gian lận hoặc xung đột cá nhân nào giữa hai bên.</li>
                      <li>Trong trường hợp xảy ra sự cố, người dùng chịu trách nhiệm giải quyết trực tiếp với bên kia. Drivon chỉ hỗ trợ cung cấp lịch sử giao dịch, nhật ký truy cập khi cần thiết.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>6. GIẢI QUYẾT TRANH CHẤP</h3>
                    <ul>
                      <li>Tất cả các tranh chấp giữa người thuê và chủ xe phải được giải quyết trực tiếp giữa hai bên.</li>
                      <li>Drivon không tham gia trong phiên dịch, trọng tài hoặc hoạt động đại diện cho bất kỳ bên nào.</li>
                      <li>Trong trường hợp có yêu cầu từ cơ quan công cộng, Drivon sẽ cung cấp dữ liệu liên quan như lịch sử giao dịch, sổ sách tài khoản… trong phạm vi được phép theo luật.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>7. CAM KẾT VÀ BĂNG HẠN</h3>
                    <ul>
                      <li>Đăng ký tài khoản, đăng tải xe hoặc thuê xe qua nền tảng được coi là đọc, hiểu, đồng ý và bị ràng buộc bởi tất cả các điều khoản của thỏa thuận này.</li>
                      <li>Drivon cam kết cập nhật, sửa đổi và bổ sung các điều khoản và điều kiện của chính sách này mà không có thông báo trước.</li>
                      <li>Phiên bản mới sẽ được công bố công khai trên nền tảng và có hiệu lực từ ngày công bố.</li>
                    </ul>
                  </div>
                  
                  <div style={{marginBottom: '1.5rem'}}>
                    <h3>8. HIỆU LỰC PHÁP LÝ</h3>
                    <ul>
                      <li>Điều khoản Sử dụng và Chính sách bảo mật này có hiệu lực từ ngày công bố và áp dụng cho tất cả người dùng của nền tảng Drivon.</li>
                      <li>Đây là một thỏa thuận bắt buộc giữa người dùng và Drivon, có thể được sử dụng làm cơ sở giải thích với cơ quan công cộng hoặc trong tranh chấp dân sự (nếu có).</li>
                      <li>Người dùng chịu trách nhiệm đọc và cập nhật chính sách định kỳ.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="partner-terms-modal-footer">
              <button
                onClick={() => setShowTermsModal(false)}
                className="partner-terms-modal-btn secondary"
              >
                {termsTab === 'en' ? 'Close' : 'Đóng'}
              </button>
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="partner-terms-modal-btn primary"
              >
                {termsTab === 'en' ? 'I Agree' : 'Tôi đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarLeaseContractForm;
