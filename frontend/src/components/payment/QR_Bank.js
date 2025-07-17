import React, { useEffect, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './QR_Bank.css';
import { API_URL } from '../../api/configApi';
const QR_Bank = ({ visible, onClose, qrCode, orderCode, userId }) => {
    const [loading, setLoading] = useState(false);
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (visible && userId) {
            // Initialize WebSocket connection
            const socket = new SockJS(`${API_URL}/ws`);
            const client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    client.subscribe(`/topic/payment/${userId}`, (message) => {
                        const data = JSON.parse(message.body);
                        if (data.status === 'SUCCESS') {
                            message.success('Payment successful!');
                            onClose(true); // Pass true to indicate success
                        } else if (data.status === 'FAILED') {
                            message.error('Payment failed!');
                            onClose(false);
                        }
                    });
                },
                onDisconnect: () => {
                    console.log('Disconnected from WebSocket');
                }
            });

            client.activate();
            setStompClient(client);

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
    }, [visible, userId]);

    return (
        <Modal
            title="QR Code Payment"
            open={visible}
            onCancel={() => onClose(false)}
            footer={null}
            width={400}
            className="qr-bank-modal"
        >
            <div className="qr-container">
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <>
                        <img src={qrCode} alt="QR Code" className="qr-code" />
                        <p className="payment-id">Order Code: {orderCode}</p>
                        <p className="instruction">
                            Please scan the QR code with your banking app to make payment
                        </p>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default QR_Bank; 