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

export {
  getTaskList,
  completeTask
};