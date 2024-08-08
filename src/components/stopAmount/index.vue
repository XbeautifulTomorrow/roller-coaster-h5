<template>
  <v-dialog v-model="showStop" width="auto">
    <div class="dialog_box">
      <div class="buy_numer_info">
        <div class="stop_profit">
          <span>TAKE PROFIT AT PRICE/PROFIT</span>
          <div class="profit_input">
            <v-text-field
              label=""
              v-model="stopProfit.price"
              bg-color="rgba(0,0,0,0)"
              color="#fff"
              variant="plain"
              hide-details="auto"
              @input="handleInput"
              @focus="
                stopProfit.isPrice = true;
                currentInput = 1;
              "
              placeholder="Price"
            ></v-text-field>
            <div class="profit_input_box up">
              <span>+</span>
              <v-text-field
                label=""
                v-model="stopProfit.profit"
                bg-color="rgba(0,0,0,0)"
                base-color=""
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="
                  stopProfit.isPrice = false;
                  currentInput = 2;
                "
                placeholder="Profit"
              ></v-text-field>
            </div>
            <div class="error_text" v-if="stopProfit.isError">
              Trigger price is too close to current price
            </div>
          </div>
        </div>
        <div class="stop_loss">
          <span>CLOSE BET AT PRICE/LOSS</span>
          <div class="profit_input">
            <v-text-field
              label=""
              v-model="stopLoss.price"
              bg-color="rgba(0,0,0,0)"
              color="#fff"
              variant="plain"
              hide-details="auto"
              @input="handleInput"
              @focus="
                stopLoss.isPrice = true;
                currentInput = 3;
              "
              placeholder="Price"
            ></v-text-field>
            <div class="profit_input_box down">
              <span>-</span>
              <v-text-field
                label=""
                v-model="stopLoss.profit"
                bg-color="rgba(0,0,0,0)"
                base-color=""
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="
                  stopLoss.isPrice = false;
                  currentInput = 4;
                "
                placeholder="Profit"
              ></v-text-field>
            </div>
            <div class="error_text" v-if="stopLoss.isError">
              Trigger price is too close to current price
            </div>
          </div>
        </div>
      </div>
      <v-btn
        class="ready_btn"
        width="220"
        height="32"
        rounded="lg"
        size="small"
        @click="handleSubmit()"
        :disabled="!isBuy"
      >
        <span class="finished">CONFIRM</span>
      </v-btn>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/store/game.js";
import bigNumber from "bignumber.js";
import { accurateDecimal, isEmpty } from "@/utils";
import { setOrder } from "@/services/api/order.js";

export default defineComponent({
  data() {
    return {
      currentInput: 1, // 当前Input
      stopProfit: {
        isPrice: false, // 是否价格
        price: "" as string | any, // 价格
        profit: "" as string | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止盈
      stopLoss: {
        isPrice: false, // 是否价格
        price: "" as string | any, // 价格
        profit: "" as string | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止损
    };
  },
  computed: {
    // 当前房间
    gameLevel() {
      const { gameLevel } = useGameStore();
      return gameLevel;
    },
    showStop: {
      get() {
        const { showStop } = useGameStore();
        return showStop;
      },
      set(val: boolean) {
        const { setShowStop, setBuyInfo } = useGameStore();
        setShowStop(val);
        if (!val) {
          setBuyInfo(null); // 清空买入信息
        }
      },
    },
    buyInfo() {
      const { buyInfo } = useGameStore();
      return buyInfo;
    },
    // 判断是否可设置
    isBuy() {
      const { stopProfit, stopLoss } = this;
      let isBuy = true;

      if (
        stopProfit.isError ||
        stopLoss.isError ||
        (!stopProfit.price &&
          !stopProfit.profit &&
          !stopLoss.price &&
          !stopLoss.profit)
      ) {
        isBuy = false;
      }

      return isBuy;
    },
  },
  methods: {
    handleReady() {
      this.showStop = false;
    },
    handleInput(event: any) {
      let {
          target: { _value },
        } = event,
        isDecimal = false;

      if (!_value) return;

      // 去除非数字字符
      let value = _value.replace(/[^\d.]/g, "");
      // 分割整数和小数部分
      let parts = value.split(".");
      // 处理整数部分添加逗号
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      // 拼接整数和小数部分
      if (parts[1]) {
        isDecimal = true;
      } else {
        isDecimal = false;
      }

      // 更新输入框的值
      if (this.currentInput == 1) {
        if (isDecimal) {
          parts[1] = parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1];
          this.stopProfit.price = parts.join(".");
        } else {
          this.stopProfit.price = parts.join(".");
        }
      } else if (this.currentInput == 2) {
        this.stopProfit.profit = parts[0];
      } else if (this.currentInput == 3) {
        if (isDecimal) {
          parts[1] = parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1];
          this.stopLoss.price = parts.join(".");
        } else {
          this.stopLoss.price = parts.join(".");
        }
      } else if (this.currentInput == 4) {
        this.stopLoss.profit = parts[0];
      }
    },
    // 计算止盈止损收益
    handleStopProfit(num: any, type: string) {
      const { amount } = this.buyInfo;
      if (type == "profit") {
        const profit = this.getProfit(num, true);

        this.stopProfit.profit =
          profit > 0 ? Number(profit).toLocaleString() : "";
      } else {
        const profit = this.getProfit(num, false);
        const loss = profit < 0 ? Math.abs(profit) : "";

        if (loss) {
          this.stopLoss.profit =
            num && Number(loss) > amount
              ? Number(amount).toLocaleString()
              : Number(loss).toLocaleString();
        } else {
          this.stopLoss.profit = "";
        }
      }
    },
    /**
     * 根据卖出价格计算收益
     * @param {number} sellPrice - 卖出价格。
     * @param {number} isFee - 是否有服务费
     * @returns {number} 返回计算后的利润，保留两位小数。
     */
    getProfit(sellPrice: number, isFee: boolean) {
      const { side, price, amount, multiplier } = this.buyInfo;
      const diffNum = new bigNumber(sellPrice).minus(price); // 差值
      let profit = diffNum
        .dividedBy(price)
        .multipliedBy(multiplier)
        .multipliedBy(amount); // 盈利

      if (isFee) {
        profit = profit.multipliedBy(0.95); // 有服务费
      }

      if (side == "buy") {
        // 多  0+(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).plus(profit).toNumber();
        return Math.floor(typeNum);
      } else {
        // 空  0-(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).minus(profit).toNumber();
        return Math.floor(typeNum);
      }
    },
    /**
     * 根据收益计算卖出价格
     * @param {number} profit - 预期收益
     * @param {number} isFee - 是否有服务费
     * @returns {number} 返回计算后的卖出价格。
     */
    getSellPrice(profit: number | string, isFee: boolean) {
      const { price, amount, multiplier } = this.buyInfo;
      let profitNum = profit;

      if (isFee) {
        profitNum = Number(new bigNumber(profit || 0).multipliedBy(1.05));
      }

      // 卖出价格 = 收益 / (杠杆倍数 * 买入数量) * 买入价 + 买入价
      const multiplierNum = new bigNumber(multiplier).multipliedBy(amount);
      const sellPrice = new bigNumber(profitNum || 0)
        .dividedBy(multiplierNum)
        .multipliedBy(price)
        .plus(price)
        .toNumber();

      if (!isEmpty(profit)) {
        return Number(accurateDecimal(sellPrice, 2, true)).toLocaleString();
      } else {
        return "";
      }
    },
    async handleSubmit() {
      const {
        buyInfo: { id },
        stopProfit,
        stopLoss,
      } = this;

      let params = {
        id: id,
        profit: "",
        loss: "",
      };
      if (!isEmpty(stopProfit.profit)) {
        params.profit = this.removeTxt(stopProfit.profit);
      }

      if (!isEmpty(stopLoss.profit)) {
        params.profit = this.removeTxt(stopLoss.profit);
      }

      const res = await setOrder(params);
      if (res.code == 200) {
        this.$emit("onStop");
        const { setBuyInfo } = useGameStore();
        this.handleReady();
        setBuyInfo(null);
      }
    },
    verifyProfit() {
      const {
        stopProfit: { price, profit },
        buyInfo: { amount },
        removeTxt,
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(removeTxt(amount))
          .multipliedBy(0.1)
          .toNumber();
        if (Number(removeTxt(profit)) > threshold) {
          this.stopProfit.isError = false;
        } else {
          this.stopProfit.isError = true;
        }
      } else {
        this.stopProfit.isError = false;
      }
    },
    verifyLoss() {
      const {
        stopLoss: { price, profit },

        buyInfo: { amount },
        removeTxt,
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(removeTxt(amount))
          .multipliedBy(0.1)
          .toNumber();

        if (
          Number(removeTxt(profit)) > threshold &&
          Number(removeTxt(profit)) < Number(removeTxt(amount))
        ) {
          this.stopLoss.isError = false;
        } else {
          this.stopLoss.isError = true;
        }
      } else {
        this.stopLoss.isError = false;
      }
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
  },
  watch: {
    buyInfo(newV) {
      if (!newV) {
        this.stopProfit = {
          isPrice: true, // 是否价格
          price: "", // 价格
          profit: "", // 收益
          isError: false,
        };

        this.stopLoss = {
          isPrice: true, // 是否价格
          price: "", // 价格
          profit: "", // 收益
          isError: false,
        };

        return;
      }

      this.stopProfit = {
        isPrice: false, // 是否价格
        price: "", // 价格
        profit: newV.profit ? Number(newV.profit).toLocaleString() : "", // 收益
        isError: false,
      }; // 止盈

      this.stopLoss = {
        isPrice: false, // 是否价格
        price: "", // 价格
        profit: newV.loss ? Number(newV.loss).toLocaleString() : "", // 收益
        isError: false,
      }; // 止损
    },
    "stopProfit.price"(newV: any) {
      if (!this.stopProfit.isPrice || !this.buyInfo) return;
      this.handleStopProfit(this.removeTxt(newV), "profit");

      this.verifyProfit();
    },
    "stopProfit.profit"(newV: any) {
      if (this.stopProfit.isPrice || !this.buyInfo) return;
      this.stopProfit.price = this.getSellPrice(this.removeTxt(newV), true);

      this.verifyProfit();
    },
    "stopLoss.price"(newV: any) {
      if (!this.stopLoss.isPrice || !this.buyInfo) return;
      this.handleStopProfit(this.removeTxt(newV), "loss");

      this.verifyLoss();
    },
    "stopLoss.profit"(newV: any) {
      if (this.stopLoss.isPrice || !this.buyInfo) return;
      if (newV > 0 && newV <= this.buyInfo.amount) {
        this.stopLoss.price = this.getSellPrice(
          -Number(this.removeTxt(newV) || 0),
          false
        );
      } else {
        this.stopLoss.price = "";
      }

      this.verifyLoss();
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
}

.dialog_box {
  border-radius: 8px;
  padding: 24px 36px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
  background-color: #1f212e;
}

.buy_numer_info {
  & > div {
    width: 220px;
    padding-bottom: 24px;
  }
}

.stop_profit,
.stop_loss {
  margin: 0 auto;
  font-size: 14px;
  font-weight: bold;
  color: #b0b5c5;

  & > span {
    display: block;
    margin-bottom: 4px;
  }
}

.profit_input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  & > div {
    flex: 1;
    max-width: calc(50% - 2px);
  }

  :deep(.v-field__input) {
    padding: 4px;
    min-height: 0;
    color: #fff;
    background-color: #161823;
    border-radius: 6px;
    font-weight: bold;

    &::-webkit-input-placeholder {
      /* WebKit, Blink, Edge */
      color: #b0b5c5;
    }
    &:-moz-placeholder {
      /* Mozilla Firefox 4 to 18 */
      color: #b0b5c5;
      opacity: 1;
    }
    &::-moz-placeholder {
      /* Mozilla Firefox 19+ */
      color: #b0b5c5;
      opacity: 1;
    }
    &:-ms-input-placeholder {
      /* Internet Explorer 10-11 */
      color: #b0b5c5;
    }
    &::-ms-input-placeholder {
      /* Microsoft Edge */
      color: #b0b5c5;
    }

    &::placeholder {
      /* Most modern browsers support this now. */
      color: #b0b5c5;
    }
  }

  .profit_input_box {
    background-color: #161823;
    border-radius: 6px;
    display: flex;
    align-items: center;
    padding: 4px;

    span {
      padding-right: 4px;
    }

    :deep(.v-field__input) {
      padding: 0;
      min-height: 0;
      background-color: transparent;
      font-weight: bold;

      &::-webkit-input-placeholder {
        /* WebKit, Blink, Edge */
        color: #b0b5c5;
      }
      &:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        color: #b0b5c5;
        opacity: 1;
      }
      &::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        color: #b0b5c5;
        opacity: 1;
      }
      &:-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: #b0b5c5;
      }
      &::-ms-input-placeholder {
        /* Microsoft Edge */
        color: #b0b5c5;
      }

      &::placeholder {
        /* Most modern browsers support this now. */
        color: #b0b5c5;
      }
    }

    &.up {
      color: #66ff07;

      :deep(.v-field__input) {
        color: #66ff07;
      }

      &:hover {
        box-shadow: 0px 0px 4px #66ff07;
      }
    }

    &.down {
      color: #ff0000;

      :deep(.v-field__input) {
        color: #ff0000;
      }

      &:hover {
        box-shadow: 0px 0px 4px #ff0000;
      }
    }
  }

  .error_text {
    position: absolute;
    bottom: -16px;
    width: 100%;
    max-width: none;
    font-size: 12px;
    color: #ff0000;
  }
}

.ready_btn {
  background-color: rgba(255, 232, 26, 1);
  box-shadow: 0px 5px 5px 0px rgba(242, 9, 9, 0.14901960784313725) inset;
  color: #000;
  font-size: 14px;
  font-weight: bold;
}

.finished {
  text-transform: none;
}
</style>
