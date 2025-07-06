import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/PaymentForm.css";
import { API_URL } from '../../api/configApi';
import { showErrorToast, showSuccessToast } from '../notification/notification';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate unique order code using timestamp
      const orderCode = Date.now();

      // Convert amount to number
      const requestData = {
        orderCode: orderCode,
        amount: parseInt(formData.amount),
        description: formData.description,
        returnUrl: "http://localhost:3000/payment-success",
        cancelUrl: "http://localhost:3000/payment-cancel",
      };

      console.log("Sending request with data:", requestData);

      const response = await axios.post(
        `${URL}/payments/create`,
        requestData
      );

      console.log("Response from server:", response.data);

      if (response.data.error) {
        showErrorToast("Error: " + response.data.error);
        return;
      }

      if (response.data.data && response.data.data.checkoutUrl) {
        window.location.href = response.data.data.checkoutUrl;
      } else {
        console.error("Unexpected response format:", response.data);
        showErrorToast(
          "No checkout URL received from server. Please check console for details."
        );
      }
    } catch (error) {
      console.error(
        "Payment creation failed:",
        error.response?.data || error.message
      );
      showErrorToast(
        "Payment creation failed: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className="payment-form-container">
      <h2>Payment Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount (VND):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
