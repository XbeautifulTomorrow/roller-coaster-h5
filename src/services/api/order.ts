import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web";


/**
 * 氛围组订单
 * @param params
 */
const getOrderAll = (params: any) => http.get("/coaster-server-sse/sse/getOrderAll", params, { showLoading: false });
/**
 * 场次对应参加人数
 * @param params
 */
const getNumberSessions = (params: any) => http.get(serverUrl + "/carOrder/numberSessions", params);
/**
 * 用户下单
 * @param params
 */
const addOrder = (params: any) => http.post(serverUrl + "/carOrder/addOrder", params);

/**
 * 订单列表
 * @param params
 */
const getOrderData = (params: any) => http.get(serverUrl + "/carOrder/pageList", params, { showLoading: false });

/**
 * 设置止盈止损
 * @param params
 */
const setOrder = (params: any) => http.post(serverUrl + "/carOrder/setOrder", params);

/**
 * 平仓
 * @param params
 */
const closeOrder = (params: any) => http.get(serverUrl + "/carOrder/closeOrder", params);



export {
  getOrderAll,
  getNumberSessions,
  addOrder,
  getOrderData,
  setOrder,
  closeOrder
};