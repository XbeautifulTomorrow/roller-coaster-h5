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
              type="number"
              bg-color="rgba(0,0,0,0)"
              color="#fff"
              variant="plain"
              hide-details="auto"
              @focus="stopProfit.isPrice = true"
              placeholder="Price"
            ></v-text-field>
            <div class="profit_input_box up">
              <span>+</span>
              <v-text-field
                label=""
                v-model="stopProfit.profit"
                type="number"
                bg-color="rgba(0,0,0,0)"
                base-color=""
                color="#fff"
                variant="plain"
                hide-details="auto"
                @focus="stopProfit.isPrice = false"
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
              type="number"
              bg-color="rgba(0,0,0,0)"
              color="#fff"
              variant="plain"
              hide-details="auto"
              @focus="stopLoss.isPrice = true"
              placeholder="Price"
            ></v-text-field>
            <div class="profit_input_box down">
              <span>-</span>
              <v-text-field
                label=""
                v-model="stopLoss.profit"
                type="number"
                bg-color="rgba(0,0,0,0)"
                base-color=""
                color="#fff"
                variant="plain"
                hide-details="auto"
                @focus="stopLoss.isPrice = false"
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
import { accurateDecimal } from "@/utils";
import { setOrder } from "@/services/api/order.js";

export default defineComponent({
  data() {
    return {
      stopProfit: {
        isPrice: false, // 是否价格
        price: null as number | any, // 价格
        profit: null as number | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止盈
      stopLoss: {
        isPrice: false, // 是否价格
        price: null as number | any, // 价格
        profit: null as number | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止损
    };
  },
  computed: {
    showStop: {
      get() {
        const { showStop } = useGameStore();
        return showStop;
      },
      set(val: boolean) {
        const { setShowStop, setBuyInfo } = useGameStore();
        setShowStop(val);
        setBuyInfo(null); // 清空买入信息
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

      if (!stopProfit.price || !stopLoss.price) {
        isBuy = false;
      }

      if (!stopProfit.profit || !stopLoss.profit) {
        isBuy = false;
      }

      return isBuy;
    },
  },
  methods: {
    handleReady() {
      this.showStop = false;
    },
    // 计算止盈止损收益
    handleStopProfit(num: any, type: string) {
      const { amount } = this.buyInfo;
      if (type == "profit") {
        const profit = this.getProfit(num, true);

        this.stopProfit.profit = profit > 0 ? profit : null;
      } else {
        const profit = this.getProfit(num, false);
        const loss = profit < 0 ? Math.abs(profit) : null;

        if (loss) {
          this.stopLoss.profit = Number(loss) > amount ? amount : loss;
        } else {
          this.stopLoss.profit = null;
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
        const typeNum = new bigNumber(0).plus(profit);
        return accurateDecimal(typeNum, 2);
      } else {
        // 空  0-(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).minus(profit);
        return accurateDecimal(typeNum, 2);
      }
    },
    /**
     * 根据收益计算卖出价格
     * @param {number} profit - 预期收益
     * @param {number} isFee - 是否有服务费
     * @returns {number} 返回计算后的卖出价格。
     */
    getSellPrice(profit: number, isFee: boolean) {
      const { price, amount, multiplier } = this.buyInfo;
      if (isFee) {
        profit = Number(new bigNumber(profit).multipliedBy(1.05));
      }

      // 卖出价格 = 收益 / (杠杆倍数 * 买入数量) * 买入价 + 买入价
      const multiplierNum = new bigNumber(multiplier).multipliedBy(amount);
      const sellPrice = new bigNumber(profit)
        .dividedBy(multiplierNum)
        .multipliedBy(price)
        .plus(price);
      return accurateDecimal(sellPrice, 2);
    },
    async handleSubmit() {
      const {
        buyInfo: { id },
        stopProfit,
        stopLoss,
      } = this;
      const res = await setOrder({
        id: id,
        profit: stopProfit.profit,
        loss: stopLoss.profit,
      });
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
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(amount).multipliedBy(0.1).toNumber();
        if (Number(profit) >= threshold) {
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
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(amount).multipliedBy(0.1).toNumber();

        if (Number(profit) >= threshold) {
          this.stopLoss.isError = false;
        } else {
          this.stopLoss.isError = true;
        }
      } else {
        this.stopLoss.isError = false;
      }
    },
  },
  watch: {
    buyInfo(newV) {
      if (!newV) {
        this.stopProfit = {
          isPrice: true, // 是否价格
          price: null, // 价格
          profit: null, // 收益
          isError: false,
        };

        this.stopLoss = {
          isPrice: true, // 是否价格
          price: null, // 价格
          profit: null, // 收益
          isError: false,
        };

        return;
      }

      this.stopProfit = {
        isPrice: false, // 是否价格
        price: null, // 价格
        profit: newV.profit, // 收益
        isError: false,
      }; // 止盈

      this.stopLoss = {
        isPrice: false, // 是否价格
        price: null, // 价格
        profit: newV.loss, // 收益
        isError: false,
      }; // 止损
    },
    "stopProfit.price"(newV: any) {
      if (!this.stopProfit.isPrice || !this.buyInfo) return;
      this.handleStopProfit(newV, "profit");

      this.verifyProfit();
    },
    "stopProfit.profit"(newV: any) {
      if (this.stopProfit.isPrice || !this.buyInfo) return;
      this.stopProfit.price = this.getSellPrice(newV, true);

      this.verifyProfit();
    },
    "stopLoss.price"(newV: any) {
      if (!this.stopLoss.isPrice || !this.buyInfo) return;
      this.handleStopProfit(newV, "loss");

      this.verifyLoss();
    },
    "stopLoss.profit"(newV: any) {
      if (this.stopLoss.isPrice || !this.buyInfo) return;
      if (newV > 0 && newV <= this.buyInfo.amount) {
        this.stopLoss.price = this.getSellPrice(-newV, false);
      } else {
        this.stopLoss.price = null;
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
