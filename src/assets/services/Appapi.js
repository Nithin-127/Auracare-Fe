import { commonAPI } from "./CommonApi";
import { BASE_URL } from "./Baseurl";

// Register user
export const registerAPI = async (user) => {
    return await commonAPI('POST', `${BASE_URL}/register`, user, "");
};

// Login user
export const loginAPI = async (user) => {
    return await commonAPI('POST', `${BASE_URL}/login`, user, "");
};

// Google Login
export const googleLoginAPI = async (reqBody) => {
    return await commonAPI('POST', `${BASE_URL}/google-login`, reqBody, "");
};

// Update profile
export const updateProfileAPI = async (id, reqBody, header) => {
    return await commonAPI('PATCH', `${BASE_URL}/profile/${id}`, reqBody, header);
}

// Donor registration
export const registerDonorAPI = async (reqBody, header) => {
    return await commonAPI('POST', `${BASE_URL}/donors/register`, reqBody, header);
};

// Get my donor profile
export const getMyDonorAPI = async (userId, header) => {
    return await commonAPI('GET', `${BASE_URL}/donors/me/${userId}`, "", header);
};

// Recipient registration
export const registerReceiverAPI = async (reqBody, header) => {
    return await commonAPI('POST', `${BASE_URL}/receivers/register`, reqBody, header);
};

// Get my receiver profile
export const getMyReceiverAPI = async (userId, header) => {
    return await commonAPI('GET', `${BASE_URL}/receivers/me/${userId}`, "", header);
};

// Admin stats
export const getAdminStatsAPI = async (header) => {
    return await commonAPI('GET', `${BASE_URL}/admin/stats`, "", header);
};

// Admin - Get all donors
export const getAllDonorsAPI = async (header) => {
    return await commonAPI('GET', `${BASE_URL}/donors`, "", header);
};

// Admin - Get all receivers
export const getAllReceiversAPI = async (header) => {
    return await commonAPI('GET', `${BASE_URL}/receivers`, "", header);
};

// Admin - Update donor status
export const updateDonorStatusAPI = async (id, reqBody, header) => {
    return await commonAPI('PATCH', `${BASE_URL}/admin/donor/${id}/status`, reqBody, header);
};

// Admin - Update receiver status
export const updateReceiverStatusAPI = async (id, reqBody, header) => {
    return await commonAPI('PATCH', `${BASE_URL}/admin/receiver/${id}/status`, reqBody, header);
};

// Admin - Delete donor
export const deleteDonorAPI = async (id, header) => {
    return await commonAPI('DELETE', `${BASE_URL}/admin/donor/${id}`, "", header);
};

// Admin - Delete receiver
export const deleteReceiverAPI = async (id, header) => {
    return await commonAPI('DELETE', `${BASE_URL}/admin/receiver/${id}`, "", header);
};

// Public - Get approved donors
export const getApprovedDonorsAPI = async () => {
    return await commonAPI('GET', `${BASE_URL}/approved-donors`, "", "");
};

// Public - Get approved receivers
export const getApprovedReceiversAPI = async () => {
    return await commonAPI('GET', `${BASE_URL}/approved-receivers`, "", "");
};

// Contact Message
export const saveMessageAPI = async (reqBody) => {
    return await commonAPI('POST', `${BASE_URL}/contact`, reqBody, "");
};

// Admin - Get all messages
export const getAllMessagesAPI = async (header) => {
    return await commonAPI('GET', `${BASE_URL}/admin/messages`, "", header);
};

// Donor Contact Requests
export const contactDonorAPI = async (reqBody, header) => {
    return await commonAPI('POST', `${BASE_URL}/contact-donor`, reqBody, header);
};

export const getDonorRequestsAPI = async (donorId, header) => {
    return await commonAPI('GET', `${BASE_URL}/donor/requests/${donorId}`, "", header);
};

// Payment APIs
export const createCheckoutSessionAPI = async (header) => {
    return await commonAPI('POST', `${BASE_URL}/create-checkout-session`, {}, header);
};

export const verifyPaymentAPI = async (reqBody, header) => {
    return await commonAPI('POST', `${BASE_URL}/verify-payment`, reqBody, header);
};
