import { defineStore } from "pinia";

interface orderInfo {
  id: number, // ID
  userName: string, // 用户昵称
  userId: number, // 用户ID
  amount: number, // 购买数量
  coinName: string, //币种:RCP/RCT,
  price: number, // 价格
  multiplier: number, // 倍数
  exitPrice: number, // 退出价格
  income: number, // 收益，前端计算
  roi: string, // 盈亏
  createTime: string, // 创建时间
  updateTime: string, // 更新时间
  strikeOut: number,  // 退出状态
  side: string // 买入类型
  ebustPrice: number // 爆仓价格，前端计算
  profit: number; // 止盈
  loss: number; // 止损
  [x: string]: string | number | any;
}

type Level = "BASIC" | "ADVANCED" | "LEGENDARY"

export const useGameStore = defineStore("game", {
  state: () => ({
    gameLevel: "" as Level, // 当前挑战Id
    showRules: false, // 显示规则
    showStop: false, // 显示止盈止损设置
    buyInfo: null as orderInfo | any // 买入信息
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: "gameLevel", storage: sessionStorage, paths: ["gameLevel"] },
    ],
  },
  actions: {
    setGameLevel(data: any) {
      this.gameLevel = data;
    },
    setShowRules(data: any) {
      this.showRules = data;
    },
    setShowStop(data: any) {
      this.showStop = data;
    },
    setBuyInfo(data: any) {
      this.buyInfo = data;
    },
  },
});