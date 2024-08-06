import { defineStore } from "pinia";
import { getLocalStore, setSessionStore, getSessionStore, removeSessionStore, accurateDecimal } from "@/utils";
import { getUserInfo, receiveGifts } from "@/services/api/user";
import { buyProduct } from "@/services/api/user.js";
import { en, zhHant } from 'vuetify/locale'
import { getLang } from "@/locales/index";

// 等级图标
import Level_1 from "@/assets/images/main/level_1.png";
import Level_2 from "@/assets/images/main/level_2.png";
import Level_3 from "@/assets/images/main/level_3.png";
import Level_4 from "@/assets/images/main/level_4.png";
import Level_5 from "@/assets/images/main/level_5.png";
import Level_6 from "@/assets/images/main/level_6.png";
import Level_7 from "@/assets/images/main/level_7.png";
import Level_8 from "@/assets/images/main/level_8.png";
import Level_9 from "@/assets/images/main/level_9.png";
import Level_10 from "@/assets/images/main/level_10.png";
import Level_11 from "@/assets/images/main/level_11.png";
import Level_12 from "@/assets/images/main/level_12.png";
import Level_13 from "@/assets/images/main/level_13.png";
import Level_14 from "@/assets/images/main/level_14.png";
import Level_15 from "@/assets/images/main/level_15.png";
import Level_16 from "@/assets/images/main/level_16.png";
import Level_17 from "@/assets/images/main/level_17.png";
import Level_18 from "@/assets/images/main/level_18.png";
import Level_19 from "@/assets/images/main/level_19.png";
import Level_20 from "@/assets/images/main/level_20.png";
import Level_21 from "@/assets/images/main/level_21.png";
import Level_22 from "@/assets/images/main/level_22.png";
import Level_23 from "@/assets/images/main/level_23.png";
import Level_24 from "@/assets/images/main/level_24.png";
import Level_25 from "@/assets/images/main/level_25.png";
import Level_26 from "@/assets/images/main/level_26.png";
import Level_27 from "@/assets/images/main/level_27.png";

const langMenu: any = {
  zh_CN: en,
  en_US: zhHant
};

export interface userInterface {
  userId: number, //用户ID
  tgId: number, //tgid
  avatar: string, //头像
  userName: string, //用户名
  rcpAmount: number, //RCP数量
  rctAmount: number, //RCT数量
  level: number, //等级
  inviteCode: string, //邀请码
  totalRcpAmount: number, //总RCP返佣数量
  totalRctAmount: number //总RCT返佣数量
  [x: string]: string | number | any;
}

export interface logInterface {
  id: string | number, //用户ID
  userName: string, //用户名
  email: string, //邮箱
  roleId: number | string,
  ip: string, // 登录IP
  certificate: string, //用户Token
  createTime: string, // 注册时间
  tgId: number | string //tgID
}

export interface productInfo {
  productId: number, //产品ID
  orderId: number, //订单ID
  walletAddress: number, //充值钱包地址
  publicKey: string, //地址公钥
  price: number, //产品价格
  priceCoin: string, //价格币种
  amount: number, //充值金额
  amountCoin: string, //充值币种
  remark: string //充值钱包地址_订单ID
  [x: string]: string | number | any;
}


export const useUserStore = defineStore("user", {
  state: () => ({
    locale: langMenu[getLang()],
    userInfo: {} as userInterface,
    logInfo: {} as logInterface,

    userPage: null as string | any,
    currentTime: null as string | any,
    isLogin: getLocalStore("certificate") ? true : false,
    showGift: false, // 礼物弹窗
    showRecharge: false, // 充值弹窗
    productId: null as number | string | any, // 充值产品ID
    productInfo: {} as productInfo, // 充值产品信息
    tonConnect: null as any, // 链接对象
    walletAddr: null as number | string | any,     // 钱包地址
    isConnect: false,     //链接状态
    showConfirm: false, // 确认弹窗
    retryCount: 5, // 登录重试次数
    loadLog: false,
    showSend: false, // 发送TIP弹窗
    sendUserId: null as string | any, // 发送用户Id
    sendUser: null as string | any, // 发送用户名
    levelImages: {
      0: Level_1,
      1: Level_2,
      2: Level_3,
      3: Level_4,
      4: Level_5,
      5: Level_6,
      6: Level_7,
      7: Level_8,
      8: Level_9,
      9: Level_10,
      10: Level_11,
      11: Level_12,
      12: Level_13,
      13: Level_14,
      14: Level_15,
      15: Level_16,
      16: Level_17,
      17: Level_18,
      18: Level_19,
      19: Level_20,
      20: Level_21,
      21: Level_22,
      22: Level_23,
      23: Level_24,
      24: Level_25,
      25: Level_26,
      26: Level_27,
    }, // 等级图标
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: "userInfo", storage: localStorage, paths: ["userInfo"] },
      { key: "logInfo", storage: localStorage, paths: ["logInfo"] },
      { key: "retryCount", storage: sessionStorage, paths: ["retryCount"] }
    ],
  },
  actions: {
    setLogin(data: any) {
      this.logInfo = data;
      this.isLogin = true;
    },
    setLoad(data: any) {
      this.loadLog = data;
    },
    async fetchUserInfo() {
      const res = await getUserInfo({});
      if (res.code == 200) {
        this.userInfo = res.data;
        this.userInfo.rcpAmount = accurateDecimal(this.userInfo.rcpAmount, 0);
      } else {
        this.logoutApi();
      }
    },
    setUserInfo(data: any) {
      this.userInfo = data;
    },
    setShowGift(data: any) {
      this.showGift = data;
    },
    setShowRecharge(data: any) {
      this.showRecharge = data;
    },
    setTonConnect(data: any) {
      this.tonConnect = data;
    },
    async setProductId(data: any) {
      this.productId = data;

      const res = await buyProduct({ productId: data });
      if (res.code == 200) {
        this.productInfo = res.data;
      }

      this.showConfirm = true;
    },
    listening(data: any) {
      if (data.isc) {
        this.isConnect = true;
        this.walletAddr = data.account;
      } else {
        this.isConnect = false;
        this.walletAddr = null;
      }
    },
    setShowConfirm(data: any) {
      this.showConfirm = data;
    },
    setLocale(data: any) {
      this.locale = data == "en_US" ? en : zhHant;
    },
    setCurrentTime(data: any) {
      this.currentTime = data;
    },
    // 领取礼物
    fetchReceiveGifts() {
      const recommend = getSessionStore("recommend");

      if (recommend) {
        removeSessionStore("recommend");
        receiveGifts({}).then(e => {
          if (e.code == 200 && e.data) {
            // 如果可领取
            this.showGift = true;

            //刷新用户数据
            this.fetchUserInfo();
          }
        })
      }
    },
    setShowSend(data: any) {
      this.showSend = data;
    },
    setSendUser(data: any) {
      this.sendUser = data;
    },
    setSendUserId(data: any) {
      this.sendUserId = data;
    },
    async logoutApi() {
      const invateCode = getSessionStore("invateCode");
      sessionStorage.clear();
      setSessionStore("invateCode", invateCode);

      localStorage.removeItem("logInfo");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("certificate");
      this.isLogin = false;
      this.userInfo = {} as userInterface;
      window.NavigationPreloadManager;

      if (import.meta.env.MODE != "dev") {
        if (this.retryCount > 0) {
          window.location.reload();
        }

        this.retryCount--;
      }
    }
  }
});