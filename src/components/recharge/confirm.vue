<template>
  <v-dialog v-model="showConfirm" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="close_btn" @click="showConfirm = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="recharge_box" v-if="!payment">
          <div class="buy_title">PURCHASE</div>
          <div class="user_wallet" v-if="isConnect">
            <div class="address">{{ formatAddr(walletAddr) }}</div>
            <v-btn
              class="disconnect_btn"
              @click="handleDisconnect()"
              size="x-small"
              height="30"
            >
              <v-img
                :width="24"
                cover
                src="@/assets/images/svg/icon_disconnect.svg"
              ></v-img>
            </v-btn>
          </div>
          <div class="user_wallet interval" v-else></div>
          <div class="product_box">
            <div class="product_ton_val">
              {{ `${productInfo.amount || 0} TON` }}
            </div>
            <div class="product_usd_val">
              {{ `$${productInfo.price || 0}` }}
            </div>
          </div>
          <v-btn
            class="connect_btn stars"
            :elevation="8"
            height="42"
            @click="handleStars()"
          >
            <v-img
              width="24"
              class="reward_img"
              cover
              src="@/assets/images/recharge/icon_stars.png"
            ></v-img>
            <span class="finished">
              {{ `${productInfo.starPrice} Stars` }}
            </span>
          </v-btn>
          <v-btn
            v-if="!isConnect"
            class="connect_btn"
            :elevation="8"
            height="40"
            @click="connectToWallet()"
          >
            <v-img
              width="24"
              class="reward_img"
              cover
              src="@/assets/images/recharge/icon_ton.png"
            ></v-img>
            <span class="finished">TON CONNECT</span>
          </v-btn>
          <template v-else>
            <v-btn
              class="connect_btn usdt"
              :elevation="8"
              height="40"
              @click="handleBuy(2)"
            >
              <v-img
                width="32"
                class="reward_img"
                cover
                src="@/assets/images/recharge/icon_usdt.png"
              ></v-img>
              <span class="finished">{{ `${productInfo.price} USDT` }}</span>
            </v-btn>
            <v-btn
              class="connect_btn"
              :elevation="8"
              height="40"
              @click="handleBuy(1)"
            >
              <v-img
                width="24"
                class="reward_img"
                cover
                src="@/assets/images/recharge/icon_ton.png"
              ></v-img>
              <span class="finished">{{ `${productInfo.amount} TON` }}</span>
            </v-btn>
          </template>
        </div>
        <div v-else class="recharge_box">
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
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getOrderList, buyProduct, buyStarsProduct } from "@/services/api/user";
import { unitConversion } from "@/utils";
import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { toNano, beginCell, Address } from "@ton/ton";

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
      gmtJettons:
        "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    showConfirm: {
      get() {
        const { showConfirm } = useUserStore();
        return showConfirm;
      },
      set(val: boolean) {
        const { setShowConfirm } = useUserStore();
        setShowConfirm(val);
      },
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect;
      },
      set(val: any) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val);
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
    // jetton地址
    jettonAddr() {
      const { jettonAddr } = useUserStore();
      return jettonAddr;
    },
    productId() {
      const { productId } = useUserStore();
      return productId;
    },
    productInfo() {
      const { productInfo } = useUserStore();
      return productInfo;
    },
  },
  created() {
    this.payment = false;
  },
  methods: {
    unitConversion: unitConversion,
    handleReady() {
      this.showConfirm = false;
    },
    // 获取余额
    async fetchBalance() {
      const { walletAddr, gmtJettons } = this;

      let fetchUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(
        walletAddr
      )}`;

      fetchUrl += `/jettons/${encodeURIComponent(gmtJettons)}`;

      axios
        .get(fetchUrl)
        .then((res: any) => {
          if (res.status == 200) {
            const { wallet_address } = res.data;

            const { setJettonAddr } = useUserStore();
            setJettonAddr(wallet_address.address);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/test1gscbot/test1gsc";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://tonrollercoaster.com/tonconnect-manifest.json",
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/theRollerCoasterBot/RollerCoaster";
      }
      // webapp重定向
      this.tonConnect.uiOptions = {
        twaReturnUrl: miniappUrl,
      };

      // 监听钱包链接状态
      this.tonConnect.onStatusChange((wallet: ConnectedWallet) => {
        if (wallet) {
          const { listening } = useUserStore();
          const {
            account: { address },
          } = wallet;
          const isC = this.tonConnect.connected;
          listening({
            isc: isC,
            account: address,
          });
        }
      });
    },
    async connectToWallet() {
      this.handleDisconnect();
      this.tonConnect
        .connectWallet()
        .then((res: any) => {
          console.log(res);
        })
        .catch((err: any) => {
          console.log(err);
        });
      // 如果需要，可以对connectedWallet做一些事情
    },
    // 断开连接
    async handleDisconnect() {
      const isC = this.tonConnect.connected;
      if (isC) {
        // 如果已连接，断开连接
        await this.tonConnect.disconnect();

        const { listening } = useUserStore();
        listening({
          isc: false,
          address: null,
        });
      }
    },
    // 处理Stars
    async handleStars() {
      const { productId, walletAddr } = this;
      const buy = await buyProduct({
        productId: productId,
        formAddress: walletAddr,
      });

      if (buy.code == 200) {
        const confirm = await buyStarsProduct({
          productId: buy.data.productId,
          orderId: buy.data.orderId,
        });
        if (confirm.code == 200) {
          const { Telegram } = window as any;
          if (Telegram) {
            const { WebApp } = Telegram;
            WebApp.openInvoice(confirm.data, (e: any) => {
              this.status = "pending";
              this.payment = true;
              this.countDown();
            });
          }
        }
      }
    },
    // 处理下单
    async handleBuy(type: number) {
      const { productId, walletAddr } = this;

      const res = await buyProduct({
        productId: productId,
        formAddress: walletAddr,
      });

      if (res.code == 200) {
        if (type == 1) {
          this.handlePayment(res.data);
        } else {
          this.handleTransfer(res.data);
        }
      }
    },
    // 处理购买
    async handlePayment(event: any) {
      const { publicKey, amount, remark } = event;

      // 创建评论
      const body = beginCell()
        .storeUint(0, 32) // 写入32个零位以表示后面将跟随文本评论
        .storeStringTail(remark) // 写下我们的文本评论
        .endCell();

      // 创建交易体
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: publicKey, // 目的地址
            amount: toNano(amount).toString(), //以nanotons计的Toncoin
            payload: body.toBoc().toString("base64"),
          },
        ],
      };

      this.tonConnect
        .sendTransaction(transaction)
        .then((res: any) => {
          this.status = "pending";
          this.payment = true;
          console.log(res);
          this.countDown();
        })
        .catch((err: any) => {
          console.log(err);
        });
    },

    async handleTransfer(event: any) {
      const { jettonAddr } = this;

      // 创建交易体
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 30000,
        messages: [
          {
            address: jettonAddr,
            amount: toNano("0.05").toString(), //以nanotons计的Toncoin
            payload: event.cell,
          },
        ],
      };

      this.tonConnect
        .sendTransaction(transaction)
        .then(async (res: any) => {
          this.status = "pending";
          this.payment = true;
          console.log(res);
          this.countDown();
        })
        .catch((err: any) => {
          console.log(err);
        });
    },
    // 格式化地址
    formatAddr(event: string) {
      if (!event) return event;
      const addr = Address.parse(event).toString({
        bounceable: false,
      });

      var reg = /^(\S{8})\S+(\S{6})$/;
      return addr.replace(reg, "$1...$2");
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
      const {
        productInfo: { orderId },
      } = this;
      const res = await getOrderList({
        orderId: orderId,
        page: 1,
        size: 10,
      });
      if (res.code == 200) {
        const orderData = res.data.records as Array<order>;

        const { fetchUserInfo } = useUserStore();
        const order = orderData.find((e) => e.orderId == orderId);
        if (order && order.status == 1) {
          this.status = "complete";
          this.clearTimerFun();
          fetchUserInfo();
        }
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initTonConnect();
    });
  },
  beforeUnmount() {
    this.clearTimerFun();
    if (this.payment && this.status != "complete") {
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
  overflow-y: scroll;
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

.connect_btn + .connect_btn {
  margin-top: 8px;
}

.connect_btn {
  min-width: 80%;
  box-sizing: border-box;
  background-color: rgba(73, 182, 246, 1);
  border-width: 2px;
  border-style: solid;
  border-color: rgba(36, 36, 36, 1);
  border-radius: 8px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-style: normal;
  font-size: 18px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);

  &.usdt {
    background-color: #26a17b;
  }

  &.stars {
    background: linear-gradient(
      180deg,
      rgba(93, 158, 252, 1) 0%,
      rgba(150, 74, 245, 1) 51%,
      rgba(230, 57, 173, 1) 98%
    );
  }

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
  line-height: 1;
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