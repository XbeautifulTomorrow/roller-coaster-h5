import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web"

/**
 * 用户下单
 * @param params
 */
const addOrder = (params: any) => http.post(serverUrl + "/carOrder/addOrder", params);

/**
 * 订单列表
 * @param params
 */
const getOrderData = (params: any) => http.get(serverUrl + "/carOrder/pageList", params);

/**
 * 平仓
 * @param params
 */
const closeOrder = (params: any) => http.get(serverUrl + "/carOrder/closeOrder", params);

export {
  addOrder,
  getOrderData,
  closeOrder
};