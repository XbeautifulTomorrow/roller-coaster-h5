<template>
  <v-dialog v-model="showStop" width="auto">
    <div class="dialog_box">
      <div class="buy_numer_info">
        <div class="stop_profit">
          <span>TAKE PROFIT AT PRICE/PROFIT</span>
          <div class="profit_input">
            <v-text-field label="" v-model="stopProfit.price" type="number" bg-color="rgba(0,0,0,0)" color="#fff"
              variant="plain" hide-details="auto"></v-text-field>
            <div class="profit_input_box up">
              <span>+</span>
              <v-text-field label="" v-model="stopProfit.profit" type="number" bg-color="rgba(0,0,0,0)" base-color=""
                color="#fff" variant="plain" hide-details="auto"></v-text-field>
            </div>
          </div>
        </div>
        <div class="stop_loss">
          <span>CLOSE BET AT PRICE/LOSS</span>
          <div class="profit_input">
            <v-text-field label="" v-model="stopLoss.price" type="number" bg-color="rgba(0,0,0,0)" color="#fff"
              variant="plain" hide-details="auto"></v-text-field>
            <div class="profit_input_box down">
              <span>-</span>
              <v-text-field label="" v-model="stopLoss.profit" type="number" bg-color="rgba(0,0,0,0)" base-color=""
                color="#fff" variant="plain" hide-details="auto"></v-text-field>
            </div>
          </div>
        </div>
      </div>
      <v-btn class="ready_btn" width="220" height="32" rounded="lg" size="small" @click="handleSubmit()"
        :disabled="!isBuy">
        <span class="finished">CONFIRM</span>
      </v-btn>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useGameStore } from "@/store/game.js";
import bigNumber from 'bignumber.js';
import { accurateDecimal } from "@/utils";
import { setOrder } from "@/services/api/order.js";

export default defineComponent({
  data() {
    return {
      stopProfit: {
        isPrice: true, // 是否价格
        price: null as number | any, // 价格
        profit: null as number | any, // 收益
      }, // 止盈
      stopLoss: {
        isPrice: true, // 是否价格
        price: null as number | any, // 价格
        profit: null as number | any, // 收益
      }, // 止损
    }
  },
  computed: {
    showStop: {
      get() {
        const { showStop } = useGameStore();
        return showStop
      },
      set(val: boolean) {
        const { setShowStop, setBuyInfo } = useGameStore();
        setShowStop(val);
        setBuyInfo(null); // 清空买入信息
      }
    },
    buyInfo() {
      const { buyInfo } = useGameStore();
      return buyInfo
    },
    // 判断是否可设置
    isBuy() {
      const { stopProfit, stopLoss } = this;
      let isBuy = true;

      if (!stopProfit.price || !stopLoss.price) {
        isBuy = false;
      };

      if (!stopProfit.profit || !stopLoss.profit) {
        isBuy = false;
      };

      return isBuy
    },
  },
  created() {
    this.stopProfit = {
      isPrice: true, // 是否价格
      price: null, // 价格
      profit: null, // 收益
    }; // 止盈
    this.stopLoss = {
      isPrice: true, // 是否价格
      price: null, // 价格
      profit: null, // 收益
    } // 止损
  },
  methods: {
    handleReady() {
      this.showStop = false;
    },
    // 计算止盈止损价格
    handleStopPrice(num: any, type: string) {
      const { side, price, amount, multiplier } = this.buyInfo;
      if (type == "profit") {
        const profit = this.getProfit(side, price, num, amount, multiplier);

        this.stopProfit.profit = profit > 0 ? profit : null;
      } else {
        const profit = this.getProfit(side, price, num, amount, multiplier);
        const loss = profit < 0 ? Math.abs(profit) : null;

        if (loss) {
          this.stopLoss.profit = Number(loss) > amount ? null : loss;
        } else {
          this.stopLoss.profit = null;
        }
      }
    },
    /**
     * 动态计算收益
     * @param {string} type - 类型，'buy':多/'sell':空
     * @param {number} buyPrice - 买入价格。
     * @param {number} sellPrice - 卖出价格。
     * @param {number} buyNum - 买入数量。
     * @param {number} multiple - 杠杆倍数。
     * @returns {number} 返回计算后的利润，保留两位小数。
     */
    getProfit(type: string, buyPrice: number, sellPrice: number, buyNum: number, multiple: number) {

      const diffNum = new bigNumber(sellPrice).minus(buyPrice); // 差值
      const profit = diffNum.dividedBy(buyPrice).multipliedBy(multiple).multipliedBy(buyNum); // 盈利
      if (type == 'buy') {
        // 多  0+(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).plus(profit);
        return accurateDecimal(typeNum, 2)
      } else {
        // 空  0-(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).minus(profit);
        return accurateDecimal(typeNum, 2)
      }
    },
    async handleSubmit() {
      const { buyInfo: { id }, stopProfit, stopLoss } = this;
      const res = await setOrder({
        id: id,
        profit: stopProfit.profit,
        loss: stopLoss.profit
      })
      if (res.code == 200) {
        this.$emit("onStop");
        this.handleReady();
      }
    }
  },
  watch: {
    "stopProfit.price"(newV: any) {
      if (!this.stopProfit.isPrice) return;
      this.handleStopPrice(newV, "profit");
    },
    "stopLoss.price"(newV, oldV) {
      if (!this.stopLoss.isPrice) return
      this.handleStopPrice(newV, "loss");
    }
  }
})
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
  background-color: #1F212E;
}

.buy_numer_info {


  &>div {
    width: 220px;
    padding-bottom: 14px;
  }
}

.stop_profit,
.stop_loss {
  margin: 0 auto;
  font-size: 14px;
  font-weight: bold;
  color: #B0B5C5;

  &>span {
    display: block;
    margin-bottom: 4px;
  }

  .profit_input {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &>div {
      max-width: calc(50% - 2px);
    }

    :deep(.v-field__input) {
      padding: 4px;
      min-height: 0;
      color: #fff;
      background-color: #161823;
      border-radius: 6px;
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
      }

      &.up {
        color: #66FF07;

        :deep(.v-field__input) {
          color: #66FF07;
        }

        &:hover {
          box-shadow: 0px 0px 4px #66FF07;
        }
      }

      &.down {
        color: #FF0000;

        :deep(.v-field__input) {
          color: #FF0000;
        }

        &:hover {
          box-shadow: 0px 0px 4px #FF0000;
        }
      }
    }
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