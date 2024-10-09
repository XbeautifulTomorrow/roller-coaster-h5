<template>
  <div class="buy_tokens_wrapper">
    <div class="buy_usdt">
      <div class="buy_usdt_title">
        <div class="operating">Buy</div>
      </div>
      <div class="buy_to_input">
        <div class="coin_box">
          <v-img
            :width="32"
            cover
            src="@/assets/images/game/icon_usdt.png"
          ></v-img>
        </div>
        <v-text-field
          v-model="toAmount"
          base-color="#fff"
          bg-color="rgba(0,0,0,0)"
          color="#fff"
          variant="plain"
          hide-details="auto"
          reverse
          placeholder="Recive"
          @input="handleInput"
        ></v-text-field>
      </div>
    </div>
    <div class="buy_usdt">
      <div class="buy_usdt_title">
        <div class="operating">Price</div>
        <div class="number">
          {{ `≈ ${formatRounding(convertTonPrice || 0) || 0} TON` }}
        </div>
      </div>
    </div>
    <v-btn
      class="connect_btn stars"
      :elevation="8"
      height="36"
      @click="handleStars()"
    >
      <v-img
        width="24"
        class="reward_img"
        cover
        src="@/assets/images/recharge/icon_stars.png"
      ></v-img>
      <span class="finished">
        {{ `${formatRounding(convertStarPrice, 0)} Stars` }}
      </span>
    </v-btn>
    <v-btn
      v-if="!isConnect"
      class="connect_btn"
      :elevation="8"
      height="36"
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
        height="36"
        @click="handleBuy(2)"
        :disabled="!toAmount"
      >
        <v-img
          width="24"
          class="reward_img"
          cover
          src="@/assets/images/game/icon_usdt.png"
        ></v-img>
        <span class="finished">{{ `${toAmount} USDT` }}</span>
      </v-btn>
      <v-btn
        class="connect_btn"
        :elevation="8"
        height="36"
        @click="handleBuy(1)"
        :disabled="!toAmount"
      >
        <v-img
          width="24"
          class="reward_img"
          cover
          src="@/assets/images/recharge/icon_ton.png"
        ></v-img>
        <span class="finished">
          {{ `${formatRounding(convertTonPrice || 0) || 0} TON` }}
        </span>
      </v-btn>
      <v-btn
        class="connect_btn"
        :elevation="8"
        height="36"
        @click="handleManual()"
        :disabled="!toAmount"
      >
        <v-img
          width="24"
          class="reward_img"
          cover
          src="@/assets/images/svg/manual_transfer.svg"
        ></v-img>
        <span class="finished">Manual Transfer</span>
      </v-btn>
    </template>
    <div class="split_box">OR</div>
    <div class="title_text" @click="toFrens()">
      <v-img :width="20" cover src="@/assets/images/game/icon_usdt.png"></v-img>
      <span>FREE USDT</span>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { purchasePoints, starPurchasePoints } from "@/services/api/user";

import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { toNano, beginCell } from "@ton/ton";

// 工具类
import bigNumber from "bignumber.js";
import { accurateDecimal, isEmpty } from "@/utils";

export default defineComponent({
  data() {
    return {
      toAmount: "1",
      gmtJettons:
        "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe",
      gmtConvertUsd: "" as any,
      timer: null as any,
    };
  },
  computed: {
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
    // TON转化至USD价格
    tonConvertUsd() {
      const { tonConvertUsd } = useUserStore();
      return tonConvertUsd;
    },
    convertTonPrice() {
      const { toAmount, tonConvertUsd, removeTxt } = this;
      const amount = removeTxt(toAmount);
      return new bigNumber(amount).dividedBy(tonConvertUsd).toNumber();
    },
    // Stars价格
    convertStarPrice() {
      const { toAmount, removeTxt } = this;

      const amount = removeTxt(toAmount);

      // 星星价格
      const price = new bigNumber(amount)
        .multipliedBy(1.53846)
        .multipliedBy(50)
        .toNumber();

      return price;
    },
  },

  async created() {
    this.getExchangePrice();
  },
  methods: {
    toFrens() {
      this.$router.push("/frens");
      this.$emit("closeBuy");
    },
    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/test1gscbot/test1gsc";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://tonrollercoaster.com/tonconnect-manifest.json",
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/RollerMasterBot/RollerMaster";
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

          this.fetchBalance();
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
    handleInput(event: any) {
      let {
        target: { _value },
      } = event;

      if (isEmpty(_value)) {
        return;
      }

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");

      // 分割整数和小数部分
      let parts = value.split(".");

      // 处理整数部分添加逗号
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // 更新输入框的值
      this.toAmount = parts[0];

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (Number(this.removeTxt(parts[0])) <= 0) return;
    },
    getExchangePrice() {
      const { fetchCoinExchange } = useUserStore();
      fetchCoinExchange("TON");
    },
    // 处理下单
    async handleBuy(type: number) {
      const { toAmount, removeTxt, walletAddr } = this;

      const amount = removeTxt(toAmount);

      const res = await purchasePoints({
        usdtAmount: amount,
        formAddress: walletAddr,
        buttonType: type == 1 ? "TON" : "USDT",
      });

      if (res.code == 200) {
        if (type == 1) {
          this.handlePayment(res.data);
        } else {
          this.handleTransfer(res.data);
        }
      }
    },
    // 处理TON购买
    async handlePayment(event: any) {
      const { usdtOrderId, publicKey, tonAmount, remark } = event;

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
            amount: toNano(tonAmount).toString(), //以nanotons计的Toncoin
            payload: body.toBoc().toString("base64"),
          },
        ],
      };

      this.tonConnect
        .sendTransaction(transaction)
        .then((res: any) => {
          // 打开确认弹窗
          const { setUsdtOrderId } = useUserStore();
          setUsdtOrderId(usdtOrderId);
          this.$emit("closeBuy");
        })
        .catch((err: any) => {
          console.log(err);
        });
    },
    // 处理USDT购买
    async handleTransfer(event: any) {
      const { jettonAddr } = this;
      const { usdtOrderId } = event;

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
          // 打开确认弹窗
          const { setUsdtOrderId } = useUserStore();
          setUsdtOrderId(usdtOrderId);
          this.$emit("closeBuy");
        })
        .catch((err: any) => {
          console.log(err);
        });
    },
    // 处理Stars
    async handleStars() {
      const { toAmount, removeTxt, walletAddr } = this;
      const buy = await purchasePoints({
        usdtAmount: removeTxt(toAmount),
        formAddress: walletAddr,
        buttonType: "STARS",
      });

      if (buy.code == 200) {
        const confirm = await starPurchasePoints({
          usdtOrderId: buy.data.usdtOrderId,
        });

        if (confirm.code == 200) {
          const { Telegram } = window as any;
          if (Telegram) {
            const { WebApp } = Telegram;
            WebApp.openInvoice(confirm.data, (e: any) => {
              // 打开确认弹窗
              const { setUsdtOrderId } = useUserStore();
              setUsdtOrderId(buy.data.usdtOrderId);
              this.$emit("closeBuy");
            });
          }
        }
      }
    },
    // 处理手动转账
    async handleManual() {
      const { toAmount, removeTxt, walletAddr } = this;
      const buy = await purchasePoints({
        usdtAmount: removeTxt(toAmount),
        formAddress: walletAddr,
        buttonType: "MANUAL",
      });

      if (buy.code == 200) {
        const { setShowManual, setManualInfo } = useUserStore();
        setManualInfo(buy.data);
        setShowManual(true);
      }
    },
    // 向上取整
    formatRounding(event: number | string, type = 2) {
      const num = new bigNumber(event).multipliedBy(100).toNumber();
      const amount = new bigNumber(Math.ceil(num)).dividedBy(100).toNumber();
      return Number(amount).toLocaleString(undefined, {
        maximumFractionDigits: type,
      });
    },
    // 格式化数字
    formatNumber(event: number | string, type: number) {
      const num = accurateDecimal(event, type);
      return Number(num).toLocaleString(undefined, {
        maximumFractionDigits: type,
      });
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.tonConnect) {
        this.initTonConnect();
      } else {
        this.fetchBalance();
      }
    });
  },
});
</script>

<style lang="scss" scoped>
.buy_usdt {
  border-radius: 8px;
  padding: 4px 0;
  position: relative;

  .buy_usdt_title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 16px;
    font-weight: 700;
    font-style: normal;
    color: #fff;
    padding-bottom: 4px;

    .number {
      white-space: nowrap;
    }
  }
}

.buy_to_input {
  background-color: rgba(38, 38, 38, 1);
  border-width: 2px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 1);
  border-radius: 10px;
  padding: 8px;
  color: #fff;
  display: flex;
  align-items: center;

  .coin_box {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    font-size: 24px;
    color: #000;
    border-radius: 16px;

    .v-img {
      flex: none;
      border-radius: 50%;
      border-width: 2px;
      border-style: solid;
      border-color: rgba(0, 0, 0, 1);
    }
  }

  :deep(.v-field__input) {
    font-size: 16px;
    padding: 0;
    min-height: 0;
    line-height: 1.2;
    font-weight: bold;

    &::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: #cccccc;
    }
    &:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #cccccc;
      opacity: 1;
    }
    &::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #cccccc;
      opacity: 1;
    }
    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #cccccc;
    }
    &::-ms-input-placeholder {
      /* Microsoft Edge */
      color: #cccccc;
    }

    &::placeholder {
      /* Most modern browsers support this now. */
      color: #cccccc;
    }
  }

  .zero_fill {
    font-size: 16px;
    font-weight: 700;
    color: #b0b5c5;
  }

  .unit {
    margin-left: 4px;
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #f33b59;
  }
}

.expected_box {
  margin: 16px 8px;
  padding: 4px 8px;
  background-color: rgba(255, 237, 214, 1);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.34);
  border-radius: 8px;
}

.expected_item {
  padding: 4px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expected_item_left {
  font-size: 14px;
  color: #999999;
}

.expected_item_right {
  font-size: 14px;
  color: #2a2a2a;
  display: flex;
  align-items: center;

  .operating_box {
    margin-left: 8px;
    padding: 4px;
    border-radius: 4px;
    background-color: #f2f3f5;

    .v-img {
      flex: none;
    }
  }
}

.connect_btn + .connect_btn {
  margin-top: 8px;
}

.connect_btn {
  width: 100%;
  box-sizing: border-box;
  background-color: rgba(73, 182, 246, 1);
  border-width: 2px;
  border-style: solid;
  border-color: rgba(36, 36, 36, 1);
  border-radius: 8px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
  font-weight: 700;
  font-style: normal;
  font-size: 16px;
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

  &.v-btn--disabled {
    background-color: rgba(53, 53, 53, 1);
    color: #696969;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
  display: inline-block;
  height: 20px;
  line-height: 1.2;
}

.split_box {
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  padding: 12px 0;
}

.title_text {
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(235, 170, 133, 1) 0%,
    rgba(191, 112, 118, 1) 100%
  );
  border-radius: 8px;
  padding: 8px 0;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.9);
  box-shadow: 0px 5px 2px 0px rgba(230, 217, 217, 0.6) inset;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}
</style>