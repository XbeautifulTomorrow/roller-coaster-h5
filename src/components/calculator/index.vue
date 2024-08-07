<template>
  <v-dialog
    v-model="showCalculator"
    width="auto"
    transition="dialog-bottom-transition"
    fullscreen
  >
    <div class="dialog_box">
      <div class="calculator_title">ROI CALCULATOR</div>
      <div class="close_btn" @click="handleReady()">
        <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
      </div>
      <div class="calculator_description">
        Rollercoaster has 2.5% house edge and a 5% fee on profitable bets.
      </div>
      <div class="calculator_panel">
        <div class="calculator_params">
          <div class="params_item">
            <div class="params_item_title">ENTRY PRICE</div>
            <div class="buy_input">
              <v-text-field
                label=""
                v-model="currentPrice"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="currentInput = 1"
              ></v-text-field>
            </div>
          </div>
          <div class="params_item">
            <div class="params_item_title">WAGER</div>
            <div class="buy_input">
              <v-img
                :width="16"
                cover
                src="@/assets/images/game/icon_rcp.png"
              ></v-img>
              <v-text-field
                label=""
                v-model="buyNum"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="currentInput = 2"
              ></v-text-field>
            </div>
          </div>
          <div class="params_item">
            <div class="params_item_title">WILL THE PRICE GO UP OR DOWN?</div>
            <div class="params_type">
              <div
                :class="[
                  'params_type_item',
                  buyStatus == 'buy' ? buyStatus : '',
                ]"
                @click="buyStatus = 'buy'"
              >
                <v-img
                  :width="14"
                  v-if="buyStatus == 'buy'"
                  cover
                  :src="up"
                ></v-img>
                <v-img
                  :width="14"
                  v-else
                  cover
                  src="@/assets/images/svg/game/type_white.svg"
                ></v-img>
                <span>UP</span>
              </div>
              <div
                :class="[
                  'params_type_item',
                  buyStatus == 'sell' ? buyStatus : '',
                ]"
                @click="buyStatus = 'sell'"
              >
                <v-img
                  :width="14"
                  v-if="buyStatus == 'sell'"
                  cover
                  :src="drop"
                ></v-img>
                <v-img
                  :width="14"
                  class="type_down"
                  v-else
                  cover
                  src="@/assets/images/svg/game/type_white.svg"
                ></v-img>
                <span>DOWN</span>
              </div>
            </div>
          </div>
          <div class="params_item">
            <div class="params_item_title">PAYOUT MULTIPLIER</div>
            <div class="buy_input">
              <div class="multiple">x</div>
              <v-text-field
                label=""
                v-model="multiple"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="currentInput = 3"
              ></v-text-field>
            </div>
          </div>
          <div class="params_item">
            <div class="params_item_title">CUSTOM PRICE MOVE %</div>
            <div class="buy_input">
              <v-text-field
                label=""
                v-model="priceChange"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="currentInput = 4"
              ></v-text-field>
            </div>
          </div>
        </div>
        <div class="calculator_result">
          <div class="result_title">
            <div>PRICE MOVE</div>
            <div>ROI</div>
            <div>EXIT PRICE</div>
            <div>P&L</div>
          </div>
          <div class="result_data">
            <div
              :class="[
                'result_item',

                item.profitAmonut == '-'
                  ? ''
                  : item.profitAmonut == 0
                  ? ''
                  : item.profitAmonut > 0
                  ? 'profit'
                  : 'loss',
              ]"
              v-for="(item, index) in profitList"
              :key="index"
            >
              <div>{{ item.priceMove }}</div>
              <div>{{ item.roi }}</div>
              <div>{{ Number(item.exitPrice).toLocaleString() }}</div>
              <div>
                {{
                  item.profitAmonut == "-"
                    ? item.profitAmonut
                    : Number(item.profitAmonut).toLocaleString()
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/store/game.js";
import up from "@/assets/images/svg/game/up.svg";
import drop from "@/assets/images/svg/game/drop.svg";

import { accurateDecimal } from "@/utils";
import bigNumber from "bignumber.js";

interface profit {
  priceMove: string; // 变动数值
  roi: string; // 回报率
  exitPrice: number; // 卖出价格
  profitAmonut: number | string | any; // 收益金额
  [x: string]: number | string | any;
}

export default defineComponent({
  data() {
    return {
      up,
      drop,
      currentInput: 1, // 当前Input
      currentPrice: "1,000.00",
      buyStatus: "buy", // 买/多 buy  卖/空 sell
      buyNum: "1,000", // 下注数
      multiple: "1", // 倍数
      priceChange: null as number | any, // 价格变动
      priceMove: [
        -1, -0.5, -0.1, -0.05, -0.01, -0.005, -0.001, -0.0005, -0.0001, 0,
        0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10,
      ], // 需要计算的价格变动
    };
  },
  computed: {
    initPrice() {
      const { initPrice } = useGameStore();
      return initPrice;
    },
    // 当前房间
    gameLevel() {
      const { gameLevel } = useGameStore();
      return gameLevel;
    },
    showCalculator: {
      get() {
        const { showCalculator } = useGameStore();
        return showCalculator;
      },
      set(val: boolean) {
        const { setShowCalculator } = useGameStore();
        setShowCalculator(val);
      },
    },
    profitList() {
      const {
        currentPrice,
        buyStatus,
        buyNum,
        multiple,
        priceMove,
        priceChange,
        removeTxt,
      } = this;

      let moveArray = priceMove;

      // 自定义变动值
      if (priceChange) {
        moveArray = [new bigNumber(priceChange).dividedBy(100).toNumber()];
      }

      const profitArray = [] as Array<profit>;
      for (let i = 0; i < moveArray.length; i++) {
        const element = moveArray[i];

        // 变动比率
        const ratio = new bigNumber(element).multipliedBy(100).toNumber();

        // 变动价格
        const exitNum = this.calculateExitPrice(element);

        // 爆仓价格
        const ebustNum = this.handleEbust(
          removeTxt(currentPrice),
          buyStatus,
          removeTxt(multiple)
        );

        // 收益
        const profit = this.getProfit(
          buyStatus,
          removeTxt(currentPrice),
          exitNum,
          removeTxt(buyNum),
          removeTxt(multiple),
          false
        );

        // ROI
        const roiNum = accurateDecimal(
          new bigNumber(profit).dividedBy(removeTxt(buyNum)).toNumber(),
          4,
          true
        );

        let roi = roiNum < 0 && roiNum < -1 ? -1 : roiNum;

        if (buyStatus == "buy") {
          if (Number(ebustNum) >= Number(exitNum)) {
            roi = -1;
          }
        } else {
          if (Number(ebustNum) <= Number(exitNum)) {
            roi = -1;
          }
        }

        const params = {
          priceMove: `${ratio}%`,
          roi: roiNum
            ? `${accurateDecimal(
                new bigNumber(roi).multipliedBy(100).toNumber(),
                2,
                true
              )}%`
            : "-",
          exitPrice: exitNum,
          profitAmonut: profit
            ? profit > 0
              ? new bigNumber(profit).multipliedBy(0.95).toNumber()
              : roi == -1
              ? -Number(removeTxt(buyNum))
              : profit
            : "-",
        };

        if (isNaN(roiNum)) {
          params.roi = "-";
        }

        if (isNaN(profit)) {
          params.profitAmonut = "-";
        }

        if (!currentPrice && buyNum && multiple) {
          params.roi = "-100.00%";
          params.profitAmonut = -Number(removeTxt(buyNum));
        }

        profitArray.push(params);
      }

      return profitArray;
    },
  },
  methods: {
    handleReady() {
      this.showCalculator = false;
      this.currentInput = 1; // 当前Input
      this.currentPrice = "1,000.00";
      this.buyStatus = "buy"; // 买/多 buy  卖/空 sell
      this.buyNum = "1,000"; // 下注数
      this.multiple = "1"; // 倍数
      this.priceChange = null; // 价格变动
      const { setInitPrice } = useGameStore();
      setInitPrice(1000);
    },
    handleInput(event: any) {
      let {
          target: { _value },
        } = event,
        isDecimal = false;

      if (!_value) return;

      // 去除非数字字符
      let value = _value.replace(/[^-\d.]/g, "");
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
          this.currentPrice = parts.join(".");
        } else {
          this.currentPrice = parts.join(".");
        }
      } else if (this.currentInput == 2) {
        if (this.gameLevel != "LEGENDARY") {
          this.buyNum = parts[0];
        } else {
          if (isDecimal) {
            parts[1] =
              parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1];
            this.buyNum = parts.join(".");
          } else {
            this.buyNum = parts.join(".");
          }
        }
      } else if (this.currentInput == 3) {
        this.multiple = parts[0];
      } else if (this.currentInput == 4) {
        if (isDecimal) {
          parts[1] = parts[1].length > 4 ? parts[1].substring(0, 4) : parts[1];
          this.priceChange = parts.join(".");
        } else {
          this.priceChange = parts.join(".");
        }
      }
    },
    // 计算EXIT PRICE
    calculateExitPrice(event: number) {
      const { currentPrice, removeTxt } = this;
      const exitNum = new bigNumber(removeTxt(currentPrice))
        .multipliedBy(1 + event)
        .toNumber();

      return exitNum ? accurateDecimal(exitNum, 2, true) : 0;
    },
    /**
     * 计算爆仓价格。
     * @param {number} price - 买入价格。
     * @param {string} type - 类型，'buy':多/'sell':空
     * @param {number} multiple - 杠杆倍数。
     * @returns {string} - 爆仓价格，保留两位小数的字符串形式。
     */
    handleEbust(price: string, type: string, multiple: string) {
      // 倍率
      const multiples = new bigNumber(1).dividedBy(multiple).minus(0.00068);
      if (type == "buy") {
        // 多 开仓价1000， 倍数100，当前价格
        // 当前价格<=1000*(1-(1 / 100 - 0.00068))  时 爆仓
        const bustPrice = new bigNumber(1)
          .minus(multiples)
          .multipliedBy(price || 0);
        return accurateDecimal(bustPrice, 2);
      } else {
        // 空 开仓价1000， 倍数100，当前价格
        //当前价格>=1000*(1+(1 / 100 - 0.00068)) 时爆仓

        const bustPrice = new bigNumber(1)
          .plus(multiples)
          .multipliedBy(price || 0);
        return accurateDecimal(bustPrice, 2);
      }
    },
    /**
     * 动态计算收益
     * @param {string} type - 类型，'buy':多/'sell':空
     * @param {string} buyPrice - 买入价格。
     * @param {string} sellPrice - 卖出价格。
     * @param {string} buyNum - 买入数量。
     * @param {string} multiple - 杠杆倍数。
     * @param {string} isFee - 是否有服务费
     * @returns {number} 返回计算后的利润，保留两位小数。
     */
    getProfit(
      type: string,
      buyPrice: string,
      sellPrice: string,
      buyNum: string,
      multiple: string,
      isFee: boolean
    ) {
      const diffNum = new bigNumber(sellPrice).minus(buyPrice); // 差值
      let profit = diffNum
        .dividedBy(buyPrice)
        .multipliedBy(multiple)
        .multipliedBy(buyNum); // 盈利

      if (isFee) {
        profit = profit.multipliedBy(0.95); // 有服务费
      }

      if (type == "buy") {
        // 多  0+(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).plus(profit).toNumber();
        return accurateDecimal(typeNum, 2);
      } else {
        // 空  0-(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).minus(profit).toNumber();
        return accurateDecimal(typeNum, 2);
      }
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return event.replace(new RegExp(type, "g"), "");
    },
  },
  watch: {
    initPrice(newV) {
      if (!newV) return;
      this.currentPrice = Number(newV).toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    },
  },
});
</script>
<style lang="scss" scoped>
.dialog_box {
  width: 100%;
  height: 100vh;
  overflow-y: scroll;
  background-color: #000;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  color: #fff;
  font-size: 20px;
  line-height: 1.2;

  .calculator_title {
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 8px;
  }

  .calculator_description {
    font-size: 14px;
    color: #b0b5c5;
    text-align: center;
    margin-bottom: 16px;
  }
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
  top: 16px;
  right: 16px;

  .v-img {
    flex: none;
  }
}

.calculator_panel {
  border-radius: 4px;
  font-size: 14px;
  text-align: left;
  color: #b0b5c5;
}

.calculator_params {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  .params_item {
    flex: 1;
    min-width: 40%;
    max-width: calc(50% - 4px);

    .params_item_title {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #b0b5c5;
      padding-bottom: 4px;
    }
  }

  .params_item:nth-child(3) {
    margin: 16px 0;
    min-width: 100%;
  }
}

.buy_input {
  background-color: #161823;
  border-radius: 6px;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 4px;

  .v-img {
    flex: none;
  }

  :deep(.v-field__input) {
    padding: 0 8px;
    min-height: 0;
    line-height: 1.5;
    color: #fff;
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

  .multiple {
    padding-left: 4px;
    font-size: 14px;
    color: #b0b5c5;
  }
}

.params_type {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .params_type_item {
    flex: 1;
    max-width: calc(50% - 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    line-height: 1;
    padding: 8px 0;
    border-radius: 4px;
    background-color: #272b39;
    box-sizing: border-box;

    .v-img {
      flex: none;
      margin-right: 8px;
    }

    .type_down {
      transform: rotateX(180deg);
    }

    &.buy {
      background-color: #223425;
      color: #66ff07;
    }

    &.sell {
      background-color: rgba(234, 69, 31, 0.2);
      color: #e60b0b;
    }
  }
}

.finished {
  text-transform: none;
  color: #000;
}

.calculator_result {
  padding-top: 16px;

  & > div + div {
    margin-top: 2px;
  }

  .result_data {
    & > div + div {
      margin-top: 2px;
    }
  }

  .result_title,
  .result_item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > div {
      flex: 1;
      max-width: calc(25% - 2px);
      font-size: 12px;
      text-align: center;
      background-color: #272b39;
      padding: 4px 0;
    }
  }

  .result_item {
    color: white;

    &.profit {
      color: #7aff00;
    }

    &.loss {
      color: #ff0404;
    }
  }
}
</style>