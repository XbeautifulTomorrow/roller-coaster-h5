import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-sse"

/**
 * 用户下单
 * @param params
 */
const addOrder = (params: any) => http.get(serverUrl + "/carOrder/addOrder", params);

/**
 * 订单列表
 * @param params
 */
const getOrderData = (params: any) => http.post(serverUrl + "/carOrder/pageList", params);

export {
  addOrder,
  getOrderData
};