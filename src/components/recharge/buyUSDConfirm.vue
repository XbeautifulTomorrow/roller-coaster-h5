<template>
  <v-dialog v-model="showBuyUSDConfirm" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="close_btn" @click="handleReady()">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="recharge_box">
          <div v-if="status == 'complete'">
            <div class="success_img">
              <v-img
                width="60"
                cover
                src="@/assets/images/svg/airdrop/checked.svg"
              ></v-img>
            </div>
            <div class="success_text">Purchase successfully!</div>
            <v-btn
              class="connect_btn"
              :elevation="8"
              height="36"
              @click="handleReady()"
            >
              <span class="finished">OK</span>
            </v-btn>
          </div>
          <div v-else>
            <div class="buy_title">PROCESSING</div>
            <div class="wait">
              <v-img
                :class="[status != 'pending' ? 'timeuot' : '']"
                width="100"
                cover
                src="@/assets/images/recharge/wait.png"
              ></v-img>
            </div>
            <div class="count_down" v-if="status == 'pending'">
              <div class="count_down_time">{{ timeMsg }}</div>
              <div class="count_down_text">
                The purchase being confirmed, please wait pateintly for a while
              </div>
            </div>
            <div class="timeout" v-if="status == 'timeout'">
              <div>Order processing is taking longer.</div>
              <div>You can keep waiting or close the window.</div>
              <div>We will notify you in bot after success.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getOrderList } from "@/services/api/user";
import { unitConversion } from "@/utils";

type statusType = "pending" | "complete" | "timeout";
interface order {
  orderId: number; //订单ID
  userId: number; //用户ID
  tgId: number; //tgID
  productId: number; //产品ID
  walletAddress: string; //充值钱包地址
  amount: number; //充值数量
  status: number; //订单状态（0-进行中，1-已完成，2-失败）
  statusStr: string;
  energyAmount: number; //能量数量
  gmcAmount: number; //GMC数量
  price: number; //产品价格
  priceCoin: string; //价格币种
  txid: string; //交易地址
  publicKey: string; //公钥
  amountCoin: string; //充值币种
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      payment: false,
      status: "pending" as statusType,
      timer: null as number | any,
      countdown: 60,
      timeMsg: "60s",
      orderData: [] as Array<order>,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    showBuyUSDConfirm: {
      get() {
        const { showBuyUSDConfirm } = useUserStore();
        return showBuyUSDConfirm;
      },
      set(val: boolean) {
        const { setShowBuyUSDConfirm } = useUserStore();
        setShowBuyUSDConfirm(val);
      },
    },
    isConnect() {
      const { isConnect } = useUserStore();
      return isConnect;
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr;
    },
    usdtOrderId() {
      const { usdtOrderId } = useUserStore();
      return usdtOrderId;
    },
  },
  beforeUpdate() {},
  mounted() {
    this.status = "pending";
    this.countDown();
  },
  methods: {
    unitConversion: unitConversion,
    handleReady() {
      this.showBuyUSDConfirm = false;
    },
    // 倒计时
    countDown() {
      const Countdown = 60;
      if (!this.timer) {
        this.countdown = Countdown;
        this.timeMsg = this.countdown + "s";
        this.timer = setInterval(() => {
          if (this.countdown > 0 && this.countdown <= 60) {
            this.countdown--;

            this.fetchPaymentResults();
            if (this.countdown !== 0) {
              this.timeMsg = this.countdown + "s";
            } else {
              this.timeMsg = this.countdown + "s";
              this.clearTimerFun();
              this.status = "timeout";
            }
          }
        }, 1000);
      }
    },
    // 清除计时器
    clearTimerFun() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    // 获取支付结果（刷新余额
    async fetchPaymentResults() {
      const { usdtOrderId } = this;
      const res = await getOrderList({
        orderId: usdtOrderId,
        page: 1,
        size: 10,
      });
      if (res.code == 200) {
        const orderData = res.data.records as Array<order>;

        const { fetchUserInfo } = useUserStore();
        const order = orderData.find((e) => e.orderId == Number(usdtOrderId));
        if (order && order.status == 1) {
          this.status = "complete";
          this.clearTimerFun();
          fetchUserInfo();
        }
      }
    },
  },
  beforeUnmount() {
    this.clearTimerFun();
    if (this.status != "complete") {
      // 如果已付款，更新一下用户信息
      const { fetchUserInfo } = useUserStore();
      fetchUserInfo();
    }
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
}

.dialog_box {
  width: 100%;
  min-width: 80vw;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
}

.close_btn {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, #f0d3b3 0%, #e6c449 100%);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 24px;
  right: 24px;

  .v-img {
    flex: none;
  }
}

.recharge_panel {
  width: 100%;
  border-radius: 4px;
  max-height: 80vh;
  font-size: 14px;
  background-color: rgba(66, 20, 79, 1);
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 0.5),
    0px 5px 5px 0px rgba(96, 69, 54, 0.4) inset;
  border-radius: 16px;
  padding: 0 0 16px;
}

.buy_title {
  word-wrap: break-word;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  background-color: rgba(0, 0, 0, 0.4);
  font-weight: 700;
  font-style: normal;
  padding: 12px 0;
  font-size: 20px;
  color: #ffffff;
  text-align: center;
}

.user_wallet {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 16px;

  &.interval {
    margin-bottom: 24px;
  }

  .address {
    background-color: rgba(137, 104, 85, 1);
    border-radius: 5px;
    color: #fcdfbd;
    padding: 6px 24px;
  }

  .disconnect_btn {
    width: auto !important;
    background: inherit;
    background-color: rgba(247, 93, 71, 1);
    box-sizing: border-box;
    border-width: 2px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 1);
    border-radius: 5px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
    margin-left: 8px;

    .v-img {
      flex: none;
    }
  }
}

.product_box {
  padding: 0 0 12px;

  .product_ton_val {
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    color: white;
  }

  .product_usd_val {
    white-space: nowrap;
    text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
    font-size: 20px;
    color: #ffedd6;
    margin-top: 12px;
  }
}

.wait {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    animation: rotate 3s linear infinite;

    &.timeuot {
      animation: none;
    }
  }
}

.count_down {
  padding: 0 16px;

  .count_down_time {
    font-weight: 700;
    font-style: normal;
    font-size: 28px;
    color: #ffffff;
    text-align: center;
    margin: 8px 0;
  }

  .count_down_text {
    font-weight: 400;
    font-style: normal;
    color: #e3d1af;
    font-size: 14px;
    text-align: center;
  }
}

.timeout {
  font-style: normal;
  color: #e3d1af;
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
  padding: 0 16px;
}

.success_img {
  width: 100px;
  height: 100px;
  background-color: #73da7f;
  border: 4px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 24px;

  .v-img {
    flex: none;
  }
}

.success_text {
  font-weight: 700;
  color: #e3d1af;
  text-align: center;
  font-size: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.connect_btn {
  background-color: rgba(73, 182, 246, 1);
  box-sizing: border-box;
  border-width: 2px;
  border-style: solid;
  border-color: rgba(36, 36, 36, 1);
  border-radius: 10px;
  -moz-box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  -webkit-box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-style: normal;
  font-size: 20px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>