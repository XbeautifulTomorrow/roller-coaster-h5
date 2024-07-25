import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web";

/**
 * Telegram登录。
 * @param params
 */
const validateToken = (params: any) => http.get(serverUrl + "/tg-user/validate", params);
/**
 * Telegram登录。
 * @param params
 */
const telegramLogin = (params: any) => http.post(serverUrl + "/tg-user/login", params);

/**
 * 获取用户信息
 * @param params
 */
const getUserInfo = (params: any) => http.get(serverUrl + "/user/userInfo", params);

/**
 * 获取等级列表
 * @param params
 */
const getLevelList = (params: any) => http.get(serverUrl + "/user-level/list", params);

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
const buyProduct = (params: any) => http.get(serverUrl + "/product-info/purchase", params);


/**
 * 购买产品
 * @param params
 */
const getOrderList = (params: any) => http.get(serverUrl + "/order/list", params);

export {
  validateToken,
  telegramLogin,
  getUserInfo,
  getLevelList,
  levelUpgrade,
  getInviteUserList,
  getInviteRankingList,
  receiveGifts,
  getProductList,
  buyProduct,
  getOrderList
};