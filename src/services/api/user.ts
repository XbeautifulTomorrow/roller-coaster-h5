import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web";

/**
 * Telegram登录。
 * @param params
 */
const validateToken = (params: any) => http.get(serverUrl + "/tg-user/validate", params, { showLoading: false });
/**
 * Telegram登录。
 * @param params
 */
const telegramLogin = (params: any) => http.post(serverUrl + "/tg-user/login", params);

/**
 * 获取用户信息
 * @param params
 */
const getUserInfo = (params: any) => http.get(serverUrl + "/user/userInfo", params, { showLoading: false });

/**
 * 获取等级列表
 * @param params
 */
const getLevelDetails = (params: any) => http.get(serverUrl + "/user-level/details", params);

/**
 * 邀请用户列表
 * @param params
 */
const getInviteUserList = (params: any) => http.get(serverUrl + "/user/inviteUsers", params);

/**
 * 邀请排行榜
 * @param params
 */
const getInviteRankingList = (params: any) => http.get(serverUrl + "/user/inviteRanking", params);

/**
 * 3base赠礼
 * @param params
 */
const receiveGifts = (params: any) => http.get(serverUrl + "/user/threeBaseAssociations", params);

/**
 * 充值产品
 * @param params
 */
const getProductList = (params: any) => http.get(serverUrl + "/product-info/list", params);

/**
 * 购买产品
 * @param params
 */
const buyProduct = (params: any) => http.get(serverUrl + "/product-info/purchase", params);


/**
 * 订单列表
 * @param params
 */
const getOrderList = (params: any) => http.get(serverUrl + "/order/list", params);

/**
 * swap 购买
 * @param params
 */
const transferSwap = (params: any) => http.post(serverUrl + "/transfer/swap", params);

/**
 * 搜索用户
 * @param params
 */
const searchByTgId = (params: any) => http.get(serverUrl + "/user/findByTgId", params);

/**
 * 发送TIP
 * @param params
 */
const transferSendTip = (params: any) => http.post(serverUrl + "/transfer/sendTip", params);




export {
  validateToken,
  telegramLogin,
  getUserInfo,
  getLevelDetails,
  getInviteUserList,
  getInviteRankingList,
  receiveGifts,
  getProductList,
  buyProduct,
  getOrderList,
  transferSwap,
  searchByTgId,
  transferSendTip
};