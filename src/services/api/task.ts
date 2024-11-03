import * as http from "@/services/apiService";
const serverUrl = "/coaster-server-web";

/**
 * 用户任务列表
 * @param params
 */
const getTaskList = (params: any) => http.get(serverUrl + "/user-task/list", params);

/**
 * 完成任务
 * @param params
 */
const completeTask = (params: any) => http.post(serverUrl + "/user-task/finish", params);

/**
 * 看广告领取奖励
 * @param params
 */
const getAdvertiseReward = (params: any) => http.get(serverUrl + "/ad/add?isWatchAd=false", params);

export {
  getTaskList,
  completeTask,
  getAdvertiseReward
};