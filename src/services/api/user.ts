import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web";

/**
 * Telegram验证
 * @param params
 */
const validateToken = (params: any) => http.get(serverUrl + "/tg-user/validate", params, { showLoading: false });
/**
 * Telegram登录
 * @param params
 */
const telegramLogin = (params: any) => http.post(serverUrl + "/tg-user/login", params);

/**
 * 获取用户信息
 * @param params
 */
const getUserInfo = (params: any) => http.get(serverUrl + "/user/userInfo", params, { showLoading: false });

/**
 * 获取等级详情
 * @param params
 */
const getLevelDetails = (params: any) => http.get(serverUrl + "/user-level/details", params);

/**
 * 用户升级
 * @param params
 */
const levelUpgrade = (params: any) => http.get(serverUrl + "/user-level/upgrade", params);

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
const buyProduct = (params: any) => http.post(serverUrl + "/product-info/purchase", params);


/**
 * 星星购买产品
 * @param params
 */
const buyStarsProduct = (params: any) => http.get(serverUrl + "/product-info/starPayment", params);

/**
 * 获取订单结果
 * @param params
 */
const getOrderDetails = (params: any) => http.get(serverUrl + "/order/details", params, { showLoading: false });

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


/**
 * 获取价格
 * @param params
 */
const getExchangeRate = (params: any) => http.get(serverUrl + "/coin/price/exchangeRate", params);

/**
 * 购买USD
 * @param params
 */
const purchasePoints = (params: any) => http.post(serverUrl + "/usdt-order/purchase", params);

/**
* 获取购买USD结果
* @param params
*/
const getPurchaseDetails = (params: any) => http.get(serverUrl + "/usdt-order/details", params, { showLoading: false });

/**
 * 星星购买USDT
 * @param params
 */
const starPurchasePoints = (params: any) => http.get(serverUrl + "/usdt-order/starPayment", params);

/**
 * 提款
 * @param params
 */
const transferWithdraw = (params: any) => http.post(serverUrl + "/transfer/withdraw", params);

/**
 * 获取提款结果
 * @param params
 */
const getWithdrawDetails = (params: any) => http.get(serverUrl + "/transfer/record/withdrawDetails", params, { showLoading: false });

/**
 * 提币记录
 * @param params
 */
const getWithdrawList = (params: any) => http.get(serverUrl + "/transfer/record/withdrawList", params, { showLoading: false });

/**
 * 充值地址
 * @param params
 */
const getRechargeAddress = (params: any) => http.get(serverUrl + "/transfer/rechargeAddress", params);

export {
  validateToken,
  telegramLogin,
  getUserInfo,
  getLevelDetails,
  levelUpgrade,
  getInviteUserList,
  getInviteRankingList,
  receiveGifts,
  getProductList,
  buyProduct,
  buyStarsProduct,
  getOrderDetails,
  transferSwap,
  searchByTgId,
  transferSendTip,
  getExchangeRate,
  transferWithdraw,
  getWithdrawDetails,
  getWithdrawList,
  purchasePoints,
  starPurchasePoints,
  getPurchaseDetails,
  getRechargeAddress
};