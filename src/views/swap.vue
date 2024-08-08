<template>
  <div class="swap_wrapper">
    <div class="swap_panel">
      <div class="swap_item">
        <div class="swap_item_title">
          <div class="operating">From</div>
          <div class="balance">
            <span v-if="coinName == 'RCP'">
              {{ `Available ${unitConversion(userInfo.rcpAmount)}` }}
            </span>
            <span v-else>
              {{ `Available ${unitConversion(userInfo.rctAmount)}` }}
            </span>
            <v-img
              v-if="coinName == 'RCP'"
              :width="20"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
            <v-img
              v-else
              :width="20"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
          </div>
        </div>
        <div class="swap_from_input">
          <div class="coin_box">
            <v-img
              v-if="coinName == 'RCP'"
              :width="24"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
            <v-img
              v-else
              :width="24"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
            <span>${{ coinName == "RCP" ? "RCP" : "RCT" }}</span>
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
          ></v-text-field>
          <div class="unit" v-if="coinName == 'RCP'">M</div>
          <div class="max_btn" @click="handleMax()">MAX</div>
        </div>
        <div v-if="isError" class="error_box">$RCP is not enough.</div>
      </div>
      <div class="convert_btn" @click="handleConvert()">
        <v-img
          :width="30"
          cover
          src="@/assets/images/svg/main/icon_convert.svg"
        ></v-img>
      </div>
      <div class="swap_item">
        <div class="swap_item_title">
          <div class="operating">To</div>
        </div>
        <div class="swap_from_input">
          <div class="coin_box">
            <v-img
              v-if="coinName != 'RCP'"
              :width="24"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
            <v-img
              v-else
              :width="24"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
            <span>${{ coinName != "RCP" ? "RCP" : "RCT" }}</span>
          </div>
          <v-text-field
            v-model="toAmount"
            base-color="#fff"
            bg-color="rgba(0,0,0,0)"
            color="#fff"
            variant="plain"
            hide-details="auto"
            reverse
          ></v-text-field>
          <div class="unit" v-if="coinName != 'RCP'">M</div>
        </div>
      </div>
      <div class="tips_text">1$RCT=10,000$RCP</div>
    </div>
    <div class="swap_buttons">
      <v-btn
        class="button swap"
        @click="submitSwap()"
        width="100%"
        height="40"
        rounded="lg"
        size="small"
        :disabled="!fromAmount || isError"
      >
        <span class="finished">SWAP</span>
      </v-btn>
      <div class="button back" @click="handleBack()">BACK</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import bigNumber from "bignumber.js";
import { accurateDecimal, unitConversion } from "@/utils";
import { transferSwap } from "@/services/api/user";
import { useMessageStore } from "@/store/message.js";

type coin = "RCP" | "RCT";

export default defineComponent({
  data() {
    return {
      coinName: "RCP" as coin,
      fromAmount: null as number | any,
      toAmount: null as number | any,
      isError: false,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    maxAmount() {
      const {
        userInfo: { rcpAmount, rctAmount },
      } = useUserStore();
      if (this.coinName == "RCP") {
        // swap只能输入百万以上
        const amount = new bigNumber(rcpAmount).dividedBy(1000000);
        return accurateDecimal(amount, 0);
      } else {
        return rctAmount;
      }
    },
  },
  methods: {
    unitConversion: unitConversion,
    handleInput(val: any) {
      if (!this.fromAmount) return;

      if (
        Number(this.maxAmount) <= 0 ||
        Number(this.fromAmount) > Number(this.maxAmount)
      ) {
        this.isError = true;
      } else {
        this.isError = false;
      }

      // 去除非数字字符
      let value = String(this.fromAmount).replace(/[^\d.]/g, "");

      // 更新输入框的值
      if (this.coinName == "RCP") {
        this.fromAmount = Math.floor(Number(value));
      } else {
        let parts = value.split(".");

        if (parts[1]) {
          const amount = accurateDecimal(Number(value), 2);
          this.fromAmount = amount;
        } else {
          this.fromAmount = value;
        }
      }
    },
    handleMax() {
      this.fromAmount = this.maxAmount;
    },
    async handleConvert() {
      if (this.coinName == "RCP") {
        this.coinName = "RCT";
      } else {
        this.coinName = "RCP";
      }

      this.fromAmount = null;
    },
    async submitSwap() {
      const { fromAmount, coinName } = this;
      let amountVal = fromAmount;

      if (this.coinName == "RCP") {
        amountVal = new bigNumber(fromAmount).multipliedBy(1000000).toNumber();
      }

      const res = await transferSwap({
        amount: amountVal,
        coinName: coinName == "RCP" ? "RCT" : "RCP",
      });
      if (res.code == 200) {
        const { fetchUserInfo } = useUserStore();
        fetchUserInfo();
        const { setMessageText } = useMessageStore();
        setMessageText("Swap successful");
      }
    },
    handleBack() {
      this.$router.go(-1);
    },
  },
  watch: {
    fromAmount(newV: any) {
      const { coinName } = this;

      if (!newV) {
        this.toAmount = null;
      }

      if (coinName == "RCP") {
        const amount = new bigNumber(newV || 0).multipliedBy(100);
        this.toAmount = accurateDecimal(amount, 2, true) || null;
      } else {
        const amount = new bigNumber(newV || 0)
          .multipliedBy(10000)
          .dividedBy(1000000);
        this.toAmount = accurateDecimal(amount, 4);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.swap_wrapper {
  margin: 0 8px;
}

.swap_panel {
  padding-top: 16px;
}

.swap_item {
  background-color: #2a2f40;
  border-radius: 8px;
  padding: 20px 8px 24px;
  position: relative;

  .swap_item_title {
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

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }
  }
}

.swap_from_input {
  background-color: #1f212e;
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
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

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  :deep(.v-field__input) {
    padding: 0;
    min-height: 0;
    line-height: 1.2;
    font-weight: bold;
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

.error_box {
  position: absolute;
  bottom: 4px;
  font-size: 12px;
  color: #ff0000;
}

.tips_text {
  padding: 16px 0;
  font-size: 14px;
  color: #b0b5c5;
  text-align: center;
}

.swap_buttons {
  padding: 4px 8px 0;

  .button {
    padding: 10px 0;
    text-align: center;
    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    border-radius: 8px;

    &.swap {
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      color: #000;
    }

    &.back {
      margin-top: 20px;
      background-color: #ececec;
      color: #000;
    }
  }
}
</style>