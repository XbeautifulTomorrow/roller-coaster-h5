<template>
  <div class="withdraw_wrapper">
    <div class="withdraw_panel">
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Network</div>
          <div class="balance">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/airdrop/history.svg"
              @click="toHistory()"
            ></v-img>
          </div>
        </div>
        <div class="withdraw_from_input">
          <div class="coin_box">
            <v-img
              :width="24"
              cover
              src="@/assets/images/airdrop/coin_ton.png"
            ></v-img>
            <span>TON</span>
          </div>
          <div style="height: 26px"></div>
        </div>
      </div>
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Wallet Address</div>
        </div>
        <div class="withdraw_from_input">
          <v-text-field
            v-model="withdrawAddr"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            placeholder="Enter your address"
          ></v-text-field>
          <div style="height: 26px"></div>
        </div>
      </div>
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">TONMEMO</div>
        </div>
        <div class="withdraw_from_input">
          <v-text-field
            v-model="tonMemo"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            placeholder="TONMEMO"
          ></v-text-field>
          <div style="height: 26px"></div>
        </div>
      </div>
      <div class="withdraw_item">
        <div class="withdraw_item_title">
          <div class="operating">Withdraw Amount</div>
          <div class="balance">
            <span>
              {{ `Balance: ${unitConversion(userInfo.usdtAmount, 2, false)}` }}
            </span>
            <v-img
              :width="20"
              cover
              src="@/assets/images/game/icon_usdt.png"
            ></v-img>
          </div>
        </div>
        <div class="withdraw_from_input">
          <div class="coin_box">
            <v-img
              :width="24"
              cover
              src="@/assets/images/game/icon_usdt.png"
            ></v-img>
            <span>{{ coinName }}</span>
          </div>
          <v-text-field
            v-model="fromAmount"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            reverse
            @input="handleInput"
            @focus="fromOrTo = true"
            placeholder="0"
          ></v-text-field>
          <div class="max_btn" @click="handleMax()">MAX</div>
        </div>
        <div class="exchange_rate"></div>
        <div v-if="isError" class="error_box">USDT is not enough.</div>
      </div>
    </div>
    <div class="gas_fee">{{ `Gas Fee: ${gasFee} USDT` }}</div>
    <div class="withdraw_buttons">
      <v-btn
        class="button swap"
        @click="submitSwap()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="isWithdraw"
      >
        <div class="btn_text">
          <span class="finished">WITHDRAW</span>
        </div>
      </v-btn>
      <div class="button back" @click="handleBack()">BACK</div>
    </div>
    <withdraw></withdraw>
    <v-dialog v-model="showTips" width="280" persistent>
      <div class="dialog_box">
        <div class="dialog_title">
          <span>Important</span>
        </div>
        <div class="dialog_text">
          Both MEMO and an Address are required to successfully deposit your
          USDT to CEX.
        </div>
        <v-btn class="enter_btn" width="200" @click="showTips = false">
          <span class="finished">OK</span>
        </v-btn>
      </div>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { unitConversion, isEmpty } from "@/utils";
import { transferWithdraw } from "@/services/api/user";
import withdraw from "@/components/withdrawConfirm/index.vue";

import { TonConnectUI, ConnectedWallet } from "@tonconnect/ui";
import { Address } from "@ton/ton";
import bigNumber from "bignumber.js";

export default defineComponent({
  data() {
    return {
      showTips: true,
      coinName: "USDT",
      withdrawAddr: "" as any,
      fromAmount: "" as string | any,
      tonMemo: "" as string | any,
      fromOrTo: false,
      isError: false,
    };
  },
  components: {
    withdraw,
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    tonConnect: {
      get() {
        const { tonConnect } = useUserStore();
        return tonConnect;
      },
      set(val: boolean) {
        const { setTonConnect } = useUserStore();
        setTonConnect(val);
      },
    },
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr;
    },
    maxAmount() {
      const {
        userInfo: { usdtAmount },
      } = useUserStore();

      return usdtAmount;
    },
    isWithdraw() {
      const { fromAmount, isError, withdrawAddr } = this;
      let isV = false;

      if (!fromAmount) {
        isV = true;
      }

      if (!withdrawAddr) {
        isV = true;
      }

      if (isError) {
        isV = true;
      }

      return isV;
    },
    gasFee() {
      const { fromAmount, removeTxt } = this;
      const num = removeTxt(fromAmount);

      if (!num) return 0;

      const amount = new bigNumber(num)
        .multipliedBy(0.003)
        .plus(0.3)
        .toNumber();

      return amount;
    },
  },
  created() {
    if (!this.tonConnect) {
      this.initTonConnect();
    } else {
      this.withdrawAddr = Address.parse(this.walletAddr).toString({
        bounceable: false,
      });
    }
  },
  methods: {
    unitConversion: unitConversion,

    // 初始化ton-connect
    async initTonConnect() {
      let miniappUrl = "https://t.me/gm_coin_test_bot/checking";

      this.tonConnect = new TonConnectUI({
        manifestUrl: "https://gmking.io/tonconnect-manifest.json",
      });

      if (import.meta.env.MODE == "prod") {
        miniappUrl = "https://t.me/theGMCoinBot/GMCoin";
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

          this.withdrawAddr = Address.parse(address).toString({
            bounceable: false,
          });
        }
      });
    },
    handleInput(event: any) {
      let {
        target: { _value },
      } = event;

      if (isEmpty(_value)) {
        this.isError = false;
        return;
      }

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");
      // 分割整数和小数部分
      let parts = value.split(".");
      // 处理整数部分添加逗号
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // 判断余额
      if (Number(this.removeTxt(this.fromAmount)) > Number(this.maxAmount)) {
        this.isError = true;
      } else {
        this.isError = false;
      }

      this.fromAmount = parts[0];
    },
    handleMax() {
      this.fromOrTo = true;
      this.fromAmount = Number(this.maxAmount).toLocaleString();

      if (!this.fromAmount) {
        this.isError = false;
      }
    },
    async submitSwap() {
      const { fromAmount, withdrawAddr, coinName, removeTxt } = this;
      let amountVal = Number(removeTxt(fromAmount));

      const res = await transferWithdraw({
        amount: amountVal,
        coinName: coinName,
        chainName: "TON", //网络
        address: Address.parse(withdrawAddr).toRawString(), //提币地址
      });

      const { setOrderId, setShowWithdraw } = useUserStore();
      setOrderId(2);
      setShowWithdraw(true);

      if (res.code == 200) {
        this.fromOrTo = true;
        this.fromAmount = "";

        const { setOrderId, setShowWithdraw } = useUserStore();
        setOrderId(res.data);
        setShowWithdraw(true);
      }
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
    handleBack() {
      this.$router.go(-1);
    },
    toHistory() {
      this.$router.push({
        name: "History",
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.withdraw_wrapper {
  margin: 0 8px;
}

.withdraw_title {
  font-size: 24px;
  font-weight: 700;
  font-style: normal;
  color: #fdefd6;
  padding-top: 16px;
}

.withdraw_panel {
  background-color: rgba(6, 4, 4, 0.75);
  border-radius: 8px;
  padding: 16px 0;

  & > .withdraw_item + .withdraw_item {
    margin-top: 12px;
  }
}

.withdraw_item {
  padding: 0 8px;
  position: relative;

  .withdraw_item_title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #b0b5c5;

    .balance {
      display: flex;
      align-items: center;
      font-size: 14px;

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }
  }
}

.withdraw_from_input {
  background-color: #2b2b2b;
  border-radius: 8px;
  padding: 8px;
  margin-top: 4px;
  color: #fff;
  display: flex;
  align-items: center;

  .coin_box {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-style: normal;
    font-size: 14px;
    color: #b0b5c5;
    padding-right: 30px;

    .v-img {
      flex: none;
      margin-right: 4px;
      border-radius: 50%;
    }
  }

  :deep(.v-field__input) {
    font-size: 14px;
    padding: 0;
    min-height: 0;
    line-height: 1.2;
  }

  .zero_fill {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;
    color: #b0b5c5;
  }

  .unit {
    margin-left: 4px;
    font-weight: 700;
    font-style: normal;
    font-size: 16px;
    color: #b0b5c5;
  }

  .max_btn {
    margin-left: 4px;

    background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
    color: #000;
    padding: 4px 16px;
    border-radius: 4px;
    font-weight: 700;
    font-style: normal;
    font-size: 12px;
  }
}

.convert_btn {
  margin: 16px 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
    transform: rotate(90deg);
  }
}

.exchange_rate {
  height: 24px;
}

.error_box {
  position: absolute;
  bottom: 0px;
  font-size: 12px;
  color: #ff0000;
}

.tips_text {
  padding: 16px 0;
  font-size: 14px;
  color: white;
  text-align: center;
}

.gas_fee {
  font-size: 14px;
  color: #fdefd6;
  text-align: right;
  padding-top: 4px;
  margin-bottom: 24px;
}

.hint_box {
  padding: 16px 0 4px;
  font-size: 10px;
  color: #fdefd6;
  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.withdraw_buttons {
  .button {
    height: 40px;
    padding: 0;
    text-align: center;
    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    border-radius: 8px;

    &.swap {
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      box-sizing: border-box;
      border-width: 2px;
      border-style: solid;
      border-color: #242424;
      font-weight: 700;
      font-style: normal;
      color: #000;

      &.v-btn--disabled {
        background-color: rgba(53, 53, 53, 1);
        color: #696969;

        .btn_text {
          .v-img {
            opacity: 0.2;
          }
        }
      }
    }

    &.back {
      margin-top: 12px;
      line-height: 40px;
      background-color: #ececec;
      box-sizing: border-box;
      color: #000;
      border-width: 2px;
      border-style: solid;
      border-color: #242424;
      font-weight: 700;
      font-style: normal;
    }
  }
}

.btn_text {
  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-left: 4px;
    margin-bottom: -2px;
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

.dialog_box {
  background-color: #fff;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 16px 8px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #000;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .dialog_title {
    margin-bottom: 24px;
  }

  .dialog_text {
    font-size: 16px;
  }

  & > .v-btn {
    font-size: 14px;
    border-radius: 8px;
    color: #fff;
    margin-top: 12px;
  }

  .enter_btn {
    border: 1px solid #000;
    background-color: rgba(255, 232, 26, 1);
    color: #c8c1c1;
    font-size: 16px;
    box-shadow: 0px 5px 5px 0px rgba(242, 9, 9, 0.15) inset;
  }

  .finished {
    text-transform: none;
    letter-spacing: 0;
    color: #000;
  }
}
</style>