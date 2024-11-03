import { defineStore } from "pinia";

export interface orderInfo {
  id: number, // ID
  userName: string, // 用户昵称
  userId: number, // 用户ID
  amount: number, // 购买数量
  coinName: string, //币种:RCP/USDT,
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
  level: number; // 等级
  [x: string]: string | number | any;
}

export interface guide {
  index: number, // 引导序号
  eventId: string, // 元素ID
  hintText: string, // 提示文字
  hintLocation: string // 提示位置
  hintAlign: string // 提示对齐
}



type Level = "BASIC" | "ADVANCED" | "LEGENDARY"

export const useGameStore = defineStore("game", {
  state: () => ({
    isInit: false, // 是否初始化
    gameLevel: "" as Level, // 当前房间等级
    showRules: false, // 显示规则
    showStop: false, // 显示止盈止损设置
    buyInfo: null as orderInfo | any, // 买入信息
    sellData: [],
    showCalculator: false, // 显示计算器
    initPrice: 1000.00, // 初始计算价格
    guideConfig: [{
      index: 0,
      eventId: "buyNum",
      hintText: "Enter $RCP Amount",
      hintLocation: "top",
      hintAlign: "left"
    }, {
      index: 1,
      eventId: "buyStatus",
      hintText: "Select Up or Down",
      hintLocation: "top",
      hintAlign: "right"
    }, {
      index: 2,
      eventId: "buyMultiplier",
      hintText: "Select Payout Multiplier",
      hintLocation: "top",
      hintAlign: "left"
    }, {
      index: 3,
      eventId: "placeOrder",
      hintText: "Place Order to Start Earn",
      hintLocation: "top",
      hintAlign: "right"
    }, {
      index: 4,
      eventId: "orderList",
      hintText: "Click Market Close at ROI > 0% to WIN",
      hintLocation: "bottom",
      hintAlign: "center"
    }] as Array<guide>, // 新手引导配置
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: "gameLevel", storage: sessionStorage, paths: ["gameLevel"] },
    ],
  },
  actions: {
    setIsInit(data: any) {
      this.isInit = data;
    },
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
    setSellData(data: any) {
      this.sellData = data;
    },
    setShowCalculator(data: any) {
      this.showCalculator = data;
    },
    setInitPrice(data: any) {
      this.initPrice = data;
    },
  },
});