import React, { useState, useEffect, useRef } from "react";
import "./BookingManager.css";
import { useRentalHistory } from "../../contexts/RentalHistoryContext";
import {
  FaCar,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../api/configApi";
import pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";
import { showErrorToast, showSuccessToast } from "../notification/notification";
import axios from "axios";

pdfMake.vfs = pdfMake.vfs || {};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancel" },
];
const RentalStats = ({ stats }) => (
  <div className="statsGrid">
    <div className="statCard">
      <div className="statIcon">
        <FaCar />
      </div>
      <div>
        <div className="statValue">{stats.totalRentals}</div>
        <div className="statLabel">Total Rentals</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaClipboardCheck />
      </div>
      <div>
        <div className="statValue" style={{ color: "#27ae60" }}>
          {stats.completed}
        </div>
        <div className="statLabel">Completed</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaMoneyBillWave />
      </div>
      <div>
        <div className="statValue" style={{ color: "#f1c40f" }}>
          {stats.totalRevenue?.toLocaleString("en-US")} ₫
        </div>
        <div className="statLabel">Total Revenue</div>
      </div>
    </div>
    <div className="statCard">
      <div className="statIcon">
        <FaCalendarAlt />
      </div>
      <div>
        <div className="statValue">{stats.thisMonth}</div>
        <div className="statLabel">This Month</div>
      </div>
    </div>
  </div>
);

const RentalFilters = ({
  statusFilter,
  setStatusFilter,
  search,
  setSearch,
  date,
  setDate,
  onFilter,
  onExport,
  onDownloadSampleContract,
}) => (
  <div className="filtersBar">
    <input
      className="searchInput"
      type="text"
      placeholder="Search by car, renter, or location..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <select
      className="statusSelect"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="">All Status</option>
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    <input
      className="dateInput"
      type="month"
      value={date}
      onChange={(e) => setDate(e.target.value)}
    />
    <button className="exportBtn" onClick={onExport}>
      Export
    </button>
    <button className="downloadBtn" onClick={onDownloadSampleContract}>
      <FaDownload style={{ fontSize: "1.1em" }} />
      Download Sample Contract
    </button>
  </div>
);

const RentalHistoryPage = () => {
  const {
    rentalsData,
    loading,
    error,
    refreshRentalsData,
    updateRentalStatus,
  } = useRentalHistory();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 7));
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isLicenseModalVisible, setIsLicenseModalVisible] = useState(false);
  const [selectedRenter, setSelectedRenter] = useState(null);
  const [licenseImages, setLicenseImages] = useState([]);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const navigate = useNavigate();
  const [cancelRequests, setCancelRequests] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const initialFetchDone = useRef(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.userId && !initialFetchDone.current) {
      refreshRentalsData(user.userId);
      initialFetchDone.current = true;
    }
  }, [refreshRentalsData]);

  // Fetch cancel requests for each booking
  useEffect(() => {
    const fetchCancelRequests = async () => {
      const requests = {};
      for (const rental of rentalsData) {
        if (rental.id) {
          try {
            const res = await axios.get(
              `${API_URL}/bookings/${rental.id}/cancel-request`
            );
            if (res.data && res.data.status === "PENDING") {
              requests[rental.id] = res.data;
            }
          } catch (e) {
            // Không có cancel request hoặc lỗi, bỏ qua
          }
        }
      }
      setCancelRequests(requests);
    };
    if (rentalsData.length > 0) fetchCancelRequests();
  }, [rentalsData]);

  // Stats calculation (exclude PENDING payments)
  const validRentalsData = rentalsData.filter(
    (r) => r.paymentStatus?.toUpperCase() !== "PENDING"
  );
  const stats = {
    totalRentals: validRentalsData.length,
    completed: validRentalsData.filter((r) => r.status === "completed").length,
    totalRevenue: validRentalsData.reduce(
      (sum, r) => sum + (r.totalPrice || 0),
      0
    ),
    thisMonth: validRentalsData.filter(
      (r) => new Date(r.startTime).getMonth() === new Date().getMonth()
    ).length,
  };

  // Filtered and sorted data (newest bookings first)
  const filteredData = rentalsData
    .filter((rental) => {
      const matchesStatus =
        !statusFilter || rental.status?.toLowerCase() === statusFilter;
      const matchesSearch =
        !search ||
        rental.car?.brand?.toLowerCase().includes(search.toLowerCase()) ||
        rental.car?.model?.toLowerCase().includes(search.toLowerCase()) ||
        rental.renter?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        rental.pickupLocation?.toLowerCase().includes(search.toLowerCase()) ||
        rental.dropoffLocation?.toLowerCase().includes(search.toLowerCase());
      const matchesDate =
        !date || (rental.startTime && rental.startTime.slice(0, 7) === date);
      // Hide bookings with PENDING payment status
      const hasValidPayment = rental.paymentStatus?.toUpperCase() !== "PENDING";
      return matchesStatus && matchesSearch && matchesDate && hasValidPayment;
    })
    .sort((a, b) => {
      // Sort by booking creation time (newest first)
      // If no booking creation time, fallback to startTime
      const timeA = a.createdAt || a.startTime || "0";
      const timeB = b.createdAt || b.startTime || "0";
      return new Date(timeB) - new Date(timeA);
    });

  const handleStatusChange = async (rentalId, newStatus) => {
    try {
      await updateRentalStatus(rentalId, newStatus);
      showSuccessToast("Status updated successfully!");
    } catch (err) {
      showErrorToast("Failed to update status!");
    }
  };

  const handleAcceptCancel = async (bookingId) => {
    try {
      await axios.put(
        `${API_URL}/bookings/${bookingId}/accept-cancel?ownerId=${user.userId}`
      );
      showSuccessToast("Cancellation accepted successfully!");
      setCancelRequests((prev) => {
        const newRequests = { ...prev };
        delete newRequests[bookingId];
        return newRequests;
      });
      refreshRentalsData(user.userId);
    } catch (e) {
      showErrorToast("Unable to accept cancellation.");
    }
  };

  const handleRejectCancel = async (bookingId) => {
    try {
      await axios.put(
        `${API_URL}/bookings/${bookingId}/reject-cancel?ownerId=${user.userId}`
      );
      showSuccessToast("Cancellation request rejected!");
      setCancelRequests((prev) => {
        const newRequests = { ...prev };
        delete newRequests[bookingId];
        return newRequests;
      });
      refreshRentalsData(user.userId);
    } catch (e) {
      showErrorToast("Unable to reject cancellation request.");
    }
  };

  const fetchLicenseImages = async (userId) => {
    try {
      setLoadingLicense(true);
      const response = await fetch(`${API_URL}/user/image?userId=${userId}`);
      if (response.ok) {
        const images = await response.json();
        const licenseOnly = images.filter(
          (img) => img.documentType === "license"
        );
        setLicenseImages(licenseOnly);
      } else {
        showErrorToast("Không thể tải hình ảnh bằng lái!");
        setLicenseImages([]);
      }
    } catch (error) {
      console.error("Error fetching license images:", error);
      showErrorToast("Lỗi khi tải hình ảnh bằng lái!");
      setLicenseImages([]);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleRowClick = (rental) => {
    const renterId =
      rental.renter?.userId || rental.renter?.id || rental.renter?._id;
    if (renterId) {
      setSelectedRenter(rental.renter);
      setIsLicenseModalVisible(true);
      fetchLicenseImages(renterId);
    } else {
      showErrorToast("Không tìm thấy thông tin người thuê!");
    }
  };

  const handleCloseLicenseModal = () => {
    setIsLicenseModalVisible(false);
    setSelectedRenter(null);
    setLicenseImages([]);
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { color: "green", fontWeight: "bold" };
      case "PENDING":
      case "Not Paid":
        return { color: "red", fontWeight: "bold" };
      default:
        return {};
    }
  };

  const exportToPDF = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const currentDate = new Date().toLocaleDateString("en-US");

      // Prepare table data
      const tableBody = [
        [
          { text: "Car", style: "tableHeader" },
          { text: "Renter", style: "tableHeader" },
          { text: "Start Date", style: "tableHeader" },
          { text: "End Date", style: "tableHeader" },
          { text: "Pickup Location", style: "tableHeader" },
          { text: "Dropoff Location", style: "tableHeader" },
          { text: "Status", style: "tableHeader" },
          { text: "Total Amount", style: "tableHeader" },
        ],
      ];

      // Add rental data to table
      filteredData.forEach((rental) => {
        tableBody.push([
          `${rental.car?.brand} ${rental.car?.model}\n${rental.car?.licensePlate}`,
          rental.renter?.fullName || rental.renter?.email || rental.renter?.id,
          rental.startTime
            ? new Date(rental.startTime).toLocaleDateString("en-US")
            : "",
          rental.endTime
            ? new Date(rental.endTime).toLocaleDateString("en-US")
            : "",
          rental.pickupLocation || "",
          rental.dropoffLocation || "",
          rental.status || "",
          `${rental.totalPrice?.toLocaleString("en-US")} ₫` || "0 ₫",
        ]);
      });

      // PDF document definition
      const docDefinition = {
        content: [
          {
            text: "RENTAL HISTORY REPORT",
            style: "header",
            alignment: "center",
            margin: [0, 0, 0, 20],
          },
          {
            text: `Generated on: ${currentDate}`,
            style: "subheader",
            alignment: "center",
            margin: [0, 0, 0, 20],
          },
          {
            text: "Summary Statistics",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            columns: [
              {
                text: `Total Rentals: ${stats.totalRentals}`,
                style: "statText",
              },
              {
                text: `Completed: ${stats.completed}`,
                style: "statText",
              },
              {
                text: `This Month: ${stats.thisMonth}`,
                style: "statText",
              },
              {
                text: `Total Revenue: ${stats.totalRevenue?.toLocaleString(
                  "en-US"
                )} ₫`,
                style: "statText",
              },
            ],
            margin: [0, 0, 0, 20],
          },
          {
            text: "Rental Details",
            style: "sectionHeader",
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
              body: tableBody,
            },
            layout: {
              fillColor: function (rowIndex, node, columnIndex) {
                return rowIndex === 0 ? "#f0f0f0" : null;
              },
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            color: "#2c3e50",
          },
          subheader: {
            fontSize: 12,
            color: "#7f8c8d",
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: "#34495e",
            margin: [0, 10, 0, 5],
          },
          statText: {
            fontSize: 10,
            color: "#2c3e50",
          },
          tableHeader: {
            bold: true,
            fontSize: 9,
            color: "#2c3e50",
            alignment: "center",
          },
        },
        defaultStyle: {
          fontSize: 8,
        },
        pageMargins: [40, 60, 40, 60],
        pageSize: "A4",
      };

      // Generate and download PDF
      const pdfDoc = pdfMake.createPdf(docDefinition);
      const fileName = `rental_history_${currentDate.replace(/\//g, "-")}.pdf`;

      // Vừa tải xuống vừa mở trong tab mới
      pdfDoc.download(fileName);
      pdfDoc.open();

      showSuccessToast("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      showErrorToast("Failed to export PDF!");
    }
  };

  // Hàm tải hợp đồng mẫu (copy từ ContractModal.js, đổi tên)
  const handleDownloadSampleContract = async () => {
    try {
      if (!window.pdfMake && pdfMake) {
        window.pdfMake = pdfMake;
      }
      if (!window.pdfMake) {
        showErrorToast(
          "PDFMake chưa được load. Vui lòng refresh trang và thử lại."
        );
        return;
      }
      // Hàm phụ trợ
      const formatDate = (dateString) => {
        if (!dateString) return ".......................";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
      };
      const formatPrice = (price) => {
        if (!price) return ".......................";
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price);
      };
      // Dữ liệu mẫu
      const contractData = {};
      const docDefinition = {
        content: [
          // Header
          {
            text: "HỢP ĐỒNG THUÊ XE Ô TÔ",
            style: "header",
            alignment: "center",
          },
          {
            text: "(Số: ......................./HĐTX)",
            style: "normal",
            alignment: "center",
          },
          { text: "\n" },

          // Date and location
          {
            text: "Hôm nay, ngày ....................... tháng ....................... năm ......................., tại ........................",
            style: "normal",
          },
          { text: "Chúng tôi gồm có:\n" },

          // Party A
          {
            text: "BÊN CHO THUÊ (BÊN A):",
            style: "sectionHeader",
          },
          {
            ul: [
              "Cá nhân: Ông/Bà .......................",
              "Sinh ngày: .......................",
              "CMND/CCCD số: ....................... do ....................... cấp ngày .......................",
              "Địa chỉ thường trú: .......................",
              "Số điện thoại liên hệ: .......................",
              "Email: .......................",
              "Số tài khoản ngân hàng: ....................... tại Ngân hàng .......................",
            ],
            style: "list",
          },
          { text: "\n" },

          // Party B
          {
            text: "BÊN THUÊ (BÊN B):",
            style: "sectionHeader",
          },
          {
            ul: [
              "Cá nhân: Ông/Bà .......................",
              "Sinh ngày: .......................",
              "CMND/CCCD số: ....................... do ....................... cấp ngày .......................",
              "Giấy phép lái xe hạng: ....................... số ....................... có giá trị đến .......................",
              "Địa chỉ thường trú: .......................",
              "Số điện thoại liên hệ: .......................",
              "Email: .......................",
            ],
            style: "list",
          },
          { text: "\n" },

          // Contract content
          {
            text: 'Sau khi bàn bạc, hai bên thống nhất ký kết Hợp đồng thuê xe ô tô (sau đây gọi tắt là "Hợp đồng") với các điều khoản và điều kiện chi tiết như sau:\n',
            style: "normal",
          },

          // Article 1
          {
            text: "ĐIỀU 1: ĐỐI TƯỢNG CỦA HỢP ĐỒNG",
            style: "sectionHeader",
          },
          {
            text: '1.1. Bên A đồng ý cho Bên B thuê và Bên B đồng ý thuê 01 (một) xe ô tô (sau đây gọi là "Xe") với các đặc điểm sau:',
            style: "normal",
          },
          {
            ul: [
              `Loại xe: ${
                contractData?.carBrand || "......................."
              } ${contractData?.carModel || "......................."}`,
              `Màu sơn: ${contractData?.carColor || "......................."}`,
              `Biển số đăng ký: ${
                contractData?.carPlate || "......................."
              }`,
              `Số khung: ${contractData?.carVin || "......................."}`,
              `Số máy: ${contractData?.carEngine || "......................."}`,
            ],
            style: "list",
          },
          {
            text: "1.2. Tình trạng Xe khi bàn giao được mô tả chi tiết tại Biên bản bàn giao xe (Phụ lục 01 đính kèm Hợp đồng này và là một phần không thể tách rời của Hợp đồng).",
            style: "normal",
          },

          // Article 2
          {
            text: "ĐIỀU 2: THỜI HẠN THUÊ VÀ MỤC ĐÍCH SỬ DỤNG",
            style: "sectionHeader",
          },
          {
            text: "2.1. Thời hạn thuê:",
            style: "normal",
          },
          {
            ul: [
              `Thời gian thuê là: ${
                contractData?.rentalDays || "......................."
              } ngày/tháng`,
              `Bắt đầu từ: ${formatDate(contractData?.startDate)}`,
              `Kết thúc vào: ${formatDate(contractData?.endDate)}`,
            ],
            style: "list",
          },
          {
            text: "2.2. Gia hạn: Nếu Bên B có nhu cầu gia hạn Hợp đồng, phải thông báo cho Bên A trước ít nhất ....................... giờ/ngày trước khi Hợp đồng hết hạn.",
            style: "normal",
          },
          {
            text: "2.3. Mục đích sử dụng: Bên B thuê xe để ........................ Bên B cam kết không sử dụng xe vào các mục đích vi phạm pháp luật.",
            style: "normal",
          },

          // Article 3
          {
            text: "ĐIỀU 3: GIÁ THUÊ, ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN",
            style: "sectionHeader",
          },
          {
            text: "3.1. Giá thuê:",
            style: "normal",
          },
          {
            ul: [
              `Đơn giá thuê là: ${formatPrice(
                contractData?.dailyPrice
              )}/ngày (Bằng chữ: .......................)`,
              `Tổng giá trị Hợp đồng (tạm tính): ${formatPrice(
                contractData?.totalPrice
              )} (Bằng chữ: .......................)`,
              "Giá thuê trên chưa bao gồm thuế GTGT (nếu có), chi phí nhiên liệu, phí cầu đường, phí đỗ xe, và các khoản phạt vi phạm giao thông (nếu có).",
              "Phụ phí vượt giờ: Nếu Bên B trả xe muộn so với thời gian quy định tại Điều 2, Bên B sẽ phải thanh toán thêm một khoản phí vượt giờ là ....................... VNĐ/giờ. Nếu quá ....................... giờ sẽ được tính tròn 01 (một) ngày thuê.",
              "Phụ phí vượt km (nếu có): Hợp đồng giới hạn số km di chuyển là ....................... km/ngày. Nếu vượt quá, Bên B phải trả thêm ....................... VNĐ/km.",
            ],
            style: "list",
          },
          {
            text: "3.2. Tiền đặt cọc:",
            style: "normal",
          },
          {
            ul: [
              `Bên B phải đặt cọc cho Bên A một khoản tiền là ${formatPrice(
                contractData?.deposit
              )} (Bằng chữ: .......................) VÀ/HOẶC tài sản thế chấp là ........................`,
              "Khoản tiền/tài sản đặt cọc này sẽ được Bên A hoàn trả đầy đủ cho Bên B sau khi Bên B đã thanh toán toàn bộ tiền thuê và các chi phí phát sinh (nếu có), đồng thời bàn giao lại xe trong tình trạng như lúc nhận.",
            ],
            style: "list",
          },
          {
            text: "3.3. Phương thức thanh toán:",
            style: "normal",
          },
          {
            ul: [
              "Thanh toán tiền thuê: Bên B thanh toán cho Bên A ....................... tổng giá trị Hợp đồng ngay khi ký kết. Số tiền còn lại sẽ được thanh toán khi Bên B trả xe.",
              "Hình thức thanh toán: Tiền mặt hoặc chuyển khoản vào tài khoản ngân hàng của Bên A tại thông tin nêu trên.",
            ],
            style: "list",
          },

          // Article 4
          {
            text: "ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A",
            style: "sectionHeader",
          },
          {
            text: "4.1. Quyền của Bên A:",
            style: "normal",
          },
          {
            ul: [
              "Nhận đủ tiền thuê và tiền đặt cọc theo thỏa thuận tại Điều 3.",
              "Yêu cầu Bên B bồi thường thiệt hại nếu xe bị hư hỏng, mất mát do lỗi của Bên B.",
              "Đơn phương chấm dứt Hợp đồng và thu hồi xe ngay lập tức nếu Bên B vi phạm nghiêm trọng các nghĩa vụ nêu trong Hợp đồng (sử dụng xe sai mục đích, không trả tiền thuê, tự ý sửa chữa, cầm cố xe...).",
            ],
            style: "list",
          },
          {
            text: "4.2. Nghĩa vụ của Bên A:",
            style: "normal",
          },
          {
            ul: [
              "Bàn giao Xe và toàn bộ giấy tờ liên quan (bản sao công chứng Giấy đăng ký xe, bản gốc Giấy chứng nhận kiểm định, bản gốc Giấy bảo hiểm TNDS) cho Bên B đúng thời gian, địa điểm và trong tình trạng kỹ thuật tốt, đảm bảo an toàn vận hành.",
              "Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu của Xe.",
              "Hướng dẫn Bên B các tính năng cơ bản của Xe.",
              "Hoàn trả tiền/tài sản đặt cọc cho Bên B sau khi đã trừ các chi phí hợp lý (nếu có) khi kết thúc Hợp đồng.",
              "Chịu trách nhiệm chi trả chi phí bảo dưỡng, sửa chữa các hư hỏng do lỗi kỹ thuật của bản thân chiếc xe.",
            ],
            style: "list",
          },

          // Article 5
          {
            text: "ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B",
            style: "sectionHeader",
          },
          {
            text: "5.1. Quyền của Bên B:",
            style: "normal",
          },
          {
            ul: [
              "Nhận xe và giấy tờ đúng theo thỏa thuận.",
              "Được toàn quyền sử dụng Xe trong thời hạn thuê và đúng mục đích đã thỏa thuận.",
              "Yêu cầu Bên A sửa chữa kịp thời các hư hỏng không do lỗi của mình gây ra.",
            ],
            style: "list",
          },
          {
            text: "5.2. Nghĩa vụ của Bên B:",
            style: "normal",
          },
          {
            ul: [
              "Thanh toán đầy đủ tiền thuê và các chi phí phát sinh (nếu có).",
              "Xuất trình đầy đủ CMND/CCCD, Giấy phép lái xe hợp lệ.",
              "Chịu trách nhiệm quản lý, bảo quản xe và các giấy tờ liên quan trong suốt thời gian thuê.",
              "Tự chi trả toàn bộ chi phí nhiên liệu, phí cầu đường, bến bãi, và các chi phí khác phát sinh trong quá trình sử dụng xe.",
              "Chịu hoàn toàn trách nhiệm trước pháp luật nếu gây ra tai nạn giao thông, vi phạm luật giao thông đường bộ (bao gồm cả phạt nguội). Bên A sẽ cung cấp thông tin của Bên B cho cơ quan chức năng khi có yêu cầu.",
              "Không được cho thuê lại, giao xe cho người không có trong Hợp đồng điều khiển (trừ khi có sự đồng ý bằng văn bản của Bên A).",
              "Không được sử dụng xe để cầm cố, thế chấp, bán hoặc thực hiện các hành vi trái pháp luật khác.",
              "Không được tự ý tháo dỡ, thay đổi kết cấu, phụ kiện của xe. Nếu xe gặp sự cố kỹ thuật, phải báo ngay cho Bên A để phối hợp giải quyết. Không tự ý sửa chữa trừ trường hợp khẩn cấp và có sự đồng ý của Bên A.",
              "Bàn giao lại xe đúng thời gian, địa điểm, với tình trạng kỹ thuật và vệ sinh như khi nhận.",
            ],
            style: "list",
          },

          // Article 6
          {
            text: "ĐIỀU 6: TRÁCH NHIỆM BỒI THƯỜNG THIỆT HẠI",
            style: "sectionHeader",
          },
          {
            text: "6.1. Trường hợp tai nạn, hư hỏng:",
            style: "normal",
          },
          {
            ul: [
              "Bên B phải có trách nhiệm giữ nguyên hiện trường, báo ngay cho cơ quan công an nơi gần nhất và thông báo cho Bên A để cùng giải quyết.",
              "Nếu lỗi thuộc về Bên B, Bên B phải chịu toàn bộ chi phí sửa chữa, khắc phục thiệt hại. Trong trường hợp xe được bảo hiểm chi trả, Bên B phải chịu phần chi phí mà bảo hiểm không chi trả (mức miễn thường) và toàn bộ chi phí thiệt hại về giá trị của xe (nếu có) và tiền thuê xe trong những ngày xe phải vào xưởng sửa chữa.",
              "Nếu lỗi không thuộc về Bên B, Bên B không phải chịu trách nhiệm bồi thường.",
            ],
            style: "list",
          },
          {
            text: "6.2. Trường hợp mất mát:",
            style: "normal",
          },
          {
            ul: [
              "Nếu Bên B làm mất xe hoặc các phụ kiện, giấy tờ đi kèm, Bên B phải bồi thường 100% giá trị của xe/phụ kiện/giấy tờ tại thời điểm mất mát. Giá trị xe được xác định theo giá thị trường.",
            ],
            style: "list",
          },

          // Article 7
          {
            text: "ĐIỀU 7: CHẤM DỨT HỢP ĐỒNG",
            style: "sectionHeader",
          },
          {
            text: "7.1. Hợp đồng này chấm dứt khi:",
            style: "normal",
          },
          {
            ul: [
              "Hết thời hạn thuê và hai bên đã hoàn thành mọi nghĩa vụ.",
              "Hai bên thỏa thuận chấm dứt trước hạn.",
              "Một trong hai bên đơn phương chấm dứt Hợp đồng do có sự vi phạm của bên còn lại theo quy định tại Hợp đồng này.",
            ],
            style: "list",
          },

          // Article 8
          {
            text: "ĐIỀU 8: GIẢI QUYẾT TRANH CHẤP",
            style: "sectionHeader",
          },
          {
            text: "Mọi tranh chấp phát sinh từ Hợp đồng này sẽ được giải quyết trước hết thông qua thương lượng, hòa giải. Nếu không thể giải quyết được, một trong hai bên có quyền khởi kiện tại Tòa án nhân dân có thẩm quyền để giải quyết theo quy định của pháp luật.",
            style: "normal",
          },

          // Article 9
          {
            text: "ĐIỀU 9: CAM KẾT CHUNG",
            style: "sectionHeader",
          },
          {
            text: "9.1. Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản đã thỏa thuận trong Hợp đồng.",
            style: "normal",
          },
          {
            text: "9.2. Mọi sửa đổi, bổ sung Hợp đồng phải được lập thành văn bản và có chữ ký của cả hai bên.",
            style: "normal",
          },
          {
            text: "9.3. Hợp đồng này được lập thành 02 (hai) bản, có giá trị pháp lý như nhau, mỗi bên giữ 01 (một) bản.",
            style: "normal",
          },
          {
            text: "9.4. Hợp đồng có hiệu lực kể từ thời điểm ký kết.",
            style: "normal",
          },

          // Chữ ký
          { text: "\n\n" },
          {
            text: "BÊN GIAO (BÊN A)                    BÊN NHẬN (BÊN B)",
            style: "normal",
            alignment: "center",
          },
          {
            text: "(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)",
            style: "normal",
            alignment: "center",
          },
          { text: "\n" },

          // Phụ lục
          { text: "\n\n" },
          {
            text: "PHỤ LỤC 01: BIÊN BẢN BÀN GIAO XE",
            style: "appendixHeader",
            alignment: "center",
          },
          {
            text: `(Đính kèm Hợp đồng thuê xe số: ${new Date()
              .toLocaleDateString("vi-VN")
              .replace(/\//g, "")}/HĐTX)`,
            style: "normal",
            alignment: "left",
          },
          { text: "\n" },

          // I. THÔNG TIN BÀN GIAO
          {
            text: "I. THÔNG TIN BÀN GIAO",
            style: "sectionHeader",
          },
          {
            ul: [
              `Thời gian bàn giao: ${formatDate(contractData?.startDate)}`,
              `Thời gian nhận lại (dự kiến): ${formatDate(
                contractData?.endDate
              )}`,
              `Địa điểm bàn giao: ${
                contractData?.pickupLocation || "......................."
              }`,
              `Số km hiện tại (ODO): ${
                contractData?.currentKm || "......................."
              }`,
              `Tình trạng nhiên liệu: ${
                contractData?.fuelStatus || "......................."
              }`,
            ],
            style: "list",
          },
          { text: "\n" },

          // II. KIỂM TRA TÌNH TRẠNG XE
          {
            text: "II. KIỂM TRA TÌNH TRẠNG XE (Đánh dấu x vào ô tương ứng)",
            style: "sectionHeader",
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", "*", "*", "*"],
              body: [
                [
                  { text: "Hạng mục", style: "tableHeader" },
                  { text: "Tình trạng lúc giao", style: "tableHeader" },
                  { text: "Tình trạng lúc nhận", style: "tableHeader" },
                  { text: "Ghi chú", style: "tableHeader" },
                ],
                [
                  "Ngoại thất - Sơn xe",
                  "[ ] Tốt / [ ] Có xước",
                  "[ ] Tốt / [ ] Có xước",
                  "(Mô tả vị trí)",
                ],
                ["Đèn pha, đèn hậu", "[ ] Tốt", "[ ] Tốt", ""],
                ["Gương chiếu hậu", "[ ] Tốt", "[ ] Tốt", ""],
                ["Lốp xe (4 bánh)", "[ ] Tốt", "[ ] Tốt", ""],
                ["Lốp dự phòng & dụng cụ", "[ ] Có đủ", "[ ] Có đủ", ""],
                [
                  "Nội thất - Ghế ngồi",
                  "[ ] Sạch / [ ] Bẩn",
                  "[ ] Sạch / [ ] Bẩn",
                  "",
                ],
                [
                  "Hệ thống điều hòa",
                  "[ ] Hoạt động tốt",
                  "[ ] Hoạt động tốt",
                  "",
                ],
                [
                  "Hệ thống âm thanh",
                  "[ ] Hoạt động tốt",
                  "[ ] Hoạt động tốt",
                  "",
                ],
                ["Thảm lót sàn", "[ ] Sạch", "[ ] Sạch", ""],
                ["Giấy đăng ký xe (bản sao)", "[ ] Có", "[ ] Có", ""],
                ["Giấy kiểm định", "[ ] Có", "[ ] Có", ""],
                ["Giấy bảo hiểm TNDS", "[ ] Có", "[ ] Có", ""],
              ],
            },
            layout: {
              hLineWidth: function (i, node) {
                return 0.5;
              },
              vLineWidth: function (i, node) {
                return 0.5;
              },
              hLineColor: function (i, node) {
                return "#aaa";
              },
              vLineColor: function (i, node) {
                return "#aaa";
              },
            },
          },
          { text: "\n" },

          // III. XÁC NHẬN
          {
            text: "III. XÁC NHẬN",
            style: "sectionHeader",
          },
          {
            text: "Bên B xác nhận đã nhận xe với đầy đủ giấy tờ và tình trạng như mô tả ở trên.",
            style: "normal",
          },
          { text: "\n" },

          // Chữ ký phụ lục
          {
            text: "BÊN GIAO (BÊN A)                    BÊN NHẬN (BÊN B)",
            style: "normal",
            alignment: "center",
          },
          {
            text: "(Ký, ghi rõ họ tên)                 (Ký, ghi rõ họ tên)",
            style: "normal",
            alignment: "center",
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 5],
          },
          appendixHeader: {
            fontSize: 16,
            bold: true,
            margin: [0, 20, 0, 10],
          },
          normal: {
            fontSize: 12,
            margin: [0, 5, 0, 5],
          },
          list: {
            fontSize: 12,
            margin: [0, 5, 0, 5],
          },
          tableHeader: {
            bold: true,
            fontSize: 11,
            color: "black",
            fillColor: "#f0f0f0",
          },
        },
        defaultStyle: {
          font: "Roboto",
        },
      };
      window.pdfMake.createPdf(docDefinition).download("hop-dong-mau.pdf");
      showSuccessToast("Downloaded sample contract!");
    } catch (error) {
      showErrorToast(
        "An error occurred while downloading the sample contract!"
      );
    }
  };

  return (
    <div className="mainContent">
      <h2 className="h2Title">Rental History</h2>
      <p className="subtitle">Manage and track all your rental bookings</p>
      <RentalStats stats={stats} />
      <RentalFilters
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        search={search}
        setSearch={setSearch}
        date={date}
        setDate={setDate}
        onExport={exportToPDF}
        onDownloadSampleContract={handleDownloadSampleContract}
      />
      <div className="rentalList">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <table className="rentalTable">
            <thead>
              <tr>
                <th>Car</th>
                <th>Renter</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Pickup Location</th>
                <th>Dropoff Location</th>
                <th>Status</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((rental) => {
                const isCancelPending = cancelRequests[rental.id];
                return (
                  <React.Fragment key={rental.id}>
                    <tr
                      onMouseEnter={() => setHoveredRow(rental.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={() => handleRowClick(rental)}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        backgroundColor:
                          hoveredRow === rental.id ? "#f0f8ff" : "transparent",
                        transition: "background-color 0.2s ease",
                      }}
                      title="Click để xem bằng lái của người thuê"
                    >
                      <td>
                        <b>
                          {rental.car?.brand} {rental.car?.model}
                        </b>
                        <div className="licensePlate">
                          {rental.car?.licensePlate}
                        </div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <button
                          className="chatIconBtn"
                          style={{
                            background: "none",
                            border: "none",
                            marginRight: 8,
                            cursor: "pointer",
                            verticalAlign: "middle",
                            fontSize: 20,
                            color: "#6c63ff",
                          }}
                          title="Message with renter"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/messages", {
                              state: {
                                selectedUser: {
                                  id:
                                    rental.renter?.userId ||
                                    rental.renter?.id ||
                                    rental.renter?._id,
                                  name:
                                    rental.renter?.fullName ||
                                    rental.renter?.email ||
                                    rental.renter?.id,
                                  avatar: rental.renter?.avatar || undefined,
                                },
                              },
                            });
                          }}
                        >
                          <i className="bi bi-chat-dots"></i>
                        </button>
                        {rental.renter?.fullName ||
                          rental.renter?.email ||
                          rental.renter?.id}
                      </td>
                      <td>
                        {rental.startTime
                          ? new Date(rental.startTime).toLocaleDateString(
                              "en-US"
                            )
                          : ""}
                      </td>
                      <td>
                        {rental.endTime
                          ? new Date(rental.endTime).toLocaleDateString("en-US")
                          : ""}
                      </td>
                      <td>
                        <span className="locationTag">
                          {rental.pickupLocation}
                        </span>
                      </td>
                      <td>
                        <span className="locationTag">
                          {rental.dropoffLocation}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`${"statusBadge"} ${
                            "statusBadge" + rental.status?.toLowerCase()
                          }`}
                          value={rental.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(rental.id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={
                            isCancelPending ||
                            ["completed", "cancelled"].includes(
                              rental.status?.toLowerCase()
                            )
                          }
                        >
                          {statusOptions.map((opt) => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              disabled={
                                rental.status === "ongoing" &&
                                opt.value === "pending"
                              }
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={getPaymentStatusStyle(rental.paymentStatus)}>
                        {rental.totalPrice?.toLocaleString("vi-VN")} đ
                      </td>
                    </tr>
                    {isCancelPending && (
                      <tr>
                        <td colSpan={8} className="cancel-action-row">
                          <div style={{ marginBottom: 12 }}>
                            <span>Awaiting cancellation confirmation</span>
                          </div>
                          <div>
                            <button
                              className="cancel-action-btn accept"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptCancel(rental.id);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="cancel-action-btn reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectCancel(rental.id);
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal hiển thị bằng lái */}
      {isLicenseModalVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseLicenseModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "20px",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: 0, color: "#2c3e50" }}>
                Bằng lái xe -{" "}
                {selectedRenter?.fullName ||
                  selectedRenter?.email ||
                  "Người thuê"}
              </h3>
              <button
                onClick={handleCloseLicenseModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            {loadingLicense ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Đang tải hình ảnh...</p>
              </div>
            ) : licenseImages.length > 0 ? (
              <div>
                {licenseImages.map((image, index) => (
                  <div key={index} style={{ marginBottom: "20px" }}>
                    {image.description && (
                      <p
                        style={{
                          marginBottom: "10px",
                          fontWeight: "bold",
                          color: "#555",
                        }}
                      >
                        {image.description}
                      </p>
                    )}
                    <img
                      src={image.imageUrl}
                      alt={`Bằng lái ${index + 1}`}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "block";
                      }}
                    />
                    <div
                      style={{
                        display: "none",
                        padding: "20px",
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      Không thể tải hình ảnh
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <p>Người thuê chưa tải lên bằng lái xe</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalHistoryPage;
