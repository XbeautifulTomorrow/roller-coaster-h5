<template>
  <div class="check_in_wrapper" @click="handleAll()">
    <div class="toolbar_panel">
      <div class="game_info">
        <div :class="['price_box', isDrop ? 'drop' : 'up']">
          <v-img
            :width="16"
            cover
            v-if="isDrop"
            src="@/assets/images/svg/game/drop.svg"
          ></v-img>
          <v-img
            :width="16"
            cover
            v-else
            src="@/assets/images/svg/game/up.svg"
          ></v-img>
          <span>
            {{
              Number(accurateDecimal(currentPrice, 2, true)).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 }
              )
            }}
          </span>
        </div>
        <div class="close_time">
          <v-img
            :width="14"
            cover
            src="@/assets/images/svg/game/remind.svg"
          ></v-img>
          <countDown
            v-slot="timeObj"
            @onEnd="getNextDayMidnight()"
            :time="nextDayTime"
          >
            <span>
              {{ `ROUND ENDS IN:${timeObj.hh}:${timeObj.mm}:${timeObj.ss}` }}
            </span>
          </countDown>
        </div>
      </div>
      <div class="chart_type" v-if="false" @click.stop="showType = !showType">
        <span>{{ currentType }}</span>
        <v-icon icon="mdi-chevron-down" size="14"></v-icon>
      </div>
      <div class="chart_type_items" v-show="showType">
        <div
          :class="['type_item', sseType == item.val && 'active']"
          v-for="(item, index) in typeDrop"
          :key="index"
          @click.stop="handleType(item)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="chart_box">
      <div class="chart_mask"></div>
      <LineChart
        v-if="sseType == 'ms500'"
        :chartData="chartData"
        :isDrop="isDrop"
      ></LineChart>
      <CandlestickChart
        v-else
        :chartData="chartData"
        :isDrop="isDrop"
      ></CandlestickChart>
    </div>
    <div class="other_box">
      <div class="other_item" @click="handleRules()">
        <v-img
          :width="16"
          cover
          src="@/assets/images/svg/game/description.svg"
        ></v-img>
        <span>How It Works</span>
      </div>
      <div class="other_item" @click="handleCalculator()">
        <v-img
          :width="16"
          cover
          src="@/assets/images/svg/game/calculator.svg"
        ></v-img>
        <span>ROI Calculator</span>
      </div>
    </div>
    <div class="order_panel">
      <div class="order_type">
        <div
          :class="['order_type_item', orderType == 0 ? 'active' : '']"
          @click="handleOrderStatus(0)"
        >
          Active Orders
        </div>
        <div
          :class="['order_type_item', orderType == 1 ? 'active' : '']"
          @click="handleOrderStatus(1)"
        >
          Closed Orders
        </div>
        <div
          :class="['order_type_item', orderType == 2 ? 'active' : '']"
          @click="handleOrderStatus(2)"
        >
          Public Orders
        </div>
      </div>
      <transition-group name="list" tag="ul">
        <li class="list-item" v-for="item in orderData" :key="item.id">
          <div class="order_types" v-if="orderType != 2">
            <v-img
              :width="24"
              cover
              v-if="item.side == 'sell'"
              src="@/assets/images/svg/game/drop.svg"
            ></v-img>
            <v-img
              :width="24"
              cover
              v-else
              src="@/assets/images/svg/game/up.svg"
            ></v-img>
          </div>
          <div class="order_user" v-else>
            <v-img
              :width="30"
              cover
              :src="levelImages[Number(item.lv) as keyof typeof levelImages]"
            ></v-img>
            <div class="user_name">{{ item.userName }}</div>
          </div>
          <div class="order_data">
            <div class="order_data_info">
              <div class="title">AMOUNT</div>
              <div class="val amount">
                <v-img
                  :width="14"
                  cover
                  v-if="item.side == 'sell' && orderType == 2"
                  src="@/assets/images/svg/game/drop.svg"
                ></v-img>
                <v-img
                  :width="14"
                  cover
                  v-if="item.side == 'buy' && orderType == 2"
                  src="@/assets/images/svg/game/up.svg"
                ></v-img>
                <div>{{ unitConversion(item.amount) }}</div>

                <v-img
                  :width="14"
                  cover
                  v-if="item.coinName == 'RCP'"
                  src="@/assets/images/game/icon_rcp.png"
                ></v-img>
                <v-img
                  :width="14"
                  cover
                  v-else
                  src="@/assets/images/game/icon_roller.png"
                ></v-img>
              </div>
            </div>
            <div class="order_data_info">
              <div class="title">X</div>
              <div class="val">
                {{ `x${Number(item.multiplier).toLocaleString()}` }}
              </div>
            </div>
            <div class="order_data_info">
              <div class="title">ENTRY PRICE</div>
              <div class="val">
                {{
                  Number(item.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
            </div>
            <div class="order_data_info" v-if="orderType == 0">
              <div class="title">BUST PRICE</div>
              <div class="val">
                {{
                  Number(item.ebustPrice || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
            </div>
            <div class="order_data_info" v-if="orderType != 0">
              <div class="title">EXIT PRICE</div>
              <div class="val">
                {{
                  Number(item.exitPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
            </div>
            <div class="order_data_info">
              <div class="title">P&L</div>
              <div :class="['val', item.income >= 0 ? 'up' : 'drop']">
                {{
                  `${Number(item.income) >= 0 ? "+" : ""}` +
                  formatIncome(item.income)
                }}
              </div>
            </div>
            <div class="order_data_info">
              <div class="title">ROI</div>
              <div :class="['val', item.roi >= 0 ? 'up' : 'drop']">
                {{ `${Number(item.roi) >= 0 ? "+" : ""}${item.roi || 0}%` }}
              </div>
            </div>
            <div
              class="operating_btn"
              v-if="orderType == 0"
              @click="handleCloseOrder(item)"
            >
              MARKET CLOSE
            </div>
          </div>
          <div
            class="order_btn"
            @click="handleConfig(item)"
            v-if="orderType == 0"
          >
            <v-img
              :width="20"
              class="drop"
              v-if="item.loss"
              cover
              src="@/assets/images/svg/game/config_red.svg"
            ></v-img>
            <v-img
              :width="20"
              class="drop"
              v-else
              cover
              src="@/assets/images/svg/game/config_white.svg"
            ></v-img>
            <v-img
              :width="16"
              class="up"
              v-if="item.profit"
              cover
              src="@/assets/images/svg/game/config_green.svg"
            ></v-img>
            <v-img
              :width="16"
              class="up"
              v-else
              cover
              src="@/assets/images/svg/game/config_white.svg"
            ></v-img>
          </div>
        </li>
        <li v-if="!(orderData.length > 0)">
          <div class="no_data">
            <v-img
              :width="48"
              cover
              src="@/assets/images/svg/game/no_data.svg"
            ></v-img>
            <span>No Orders Found</span>
          </div>
        </li>
      </transition-group>
    </div>
    <div class="buying_panel fixed">
      <div class="buy_types">
        <div :class="['buy_type_slider', buyType == 'AUTO' && 'auto']"></div>
        <div
          :class="['buy_type_item', buyType == 'MANUAL' && 'active']"
          @click="handlebuyType('MANUAL')"
        >
          MANUAL
        </div>
        <div
          :class="['buy_type_item', buyType == 'AUTO' && 'active']"
          @click="handlebuyType('AUTO')"
        >
          AUTO
        </div>
      </div>
      <div class="manual_box fixed">
        <div class="buy_numer_info fixed">
          <div class="buy_price fixed">
            <div class="buy_input fixed">
              <v-img
                :width="24"
                cover
                v-if="coinName == 'RCP'"
                src="@/assets/images/game/icon_rcp.png"
              ></v-img>
              <v-img
                :width="24"
                cover
                v-else
                src="@/assets/images/game/icon_roller.png"
              ></v-img>
              <v-text-field
                label=""
                v-model="buyNum"
                bg-color="rgba(0,0,0,0)"
                color="#fff"
                variant="plain"
                hide-details="auto"
                @input="handleInput"
                @focus="currentInput = 1"
              ></v-text-field>
              <div class="multiples_btn fixed" @click="handleMinus()">1/2</div>
              <div class="multiples_btn fixed" @click="handlePlus()">x2</div>
            </div>
          </div>
          <div class="buy_type_box">
            <div
              :class="[
                'buy_type_slider',
                'fixed',
                buyStatus == 'sell' && 'down',
              ]"
            ></div>
            <div
              :class="[
                'buy_type_item',
                'fixed',
                buyStatus == 'buy' && 'up_active',
              ]"
              @click="buyStatus = 'buy'"
            >
              <v-img
                :width="10"
                v-if="buyStatus == 'buy'"
                cover
                src="@/assets/images/svg/game/up.svg"
              ></v-img>
              <v-img
                :width="10"
                v-else
                cover
                src="@/assets/images/svg/game/type_white.svg"
              ></v-img>
              <span>UP</span>
            </div>
            <div
              :class="[
                'buy_type_item',
                'fixed',
                buyStatus == 'sell' && 'down_active',
              ]"
              @click="buyStatus = 'sell'"
            >
              <v-img
                :width="10"
                v-if="buyStatus == 'sell'"
                cover
                src="@/assets/images/svg/game/drop.svg"
              ></v-img>
              <v-img
                :width="10"
                class="type_down"
                v-else
                cover
                src="@/assets/images/svg/game/type_white.svg"
              ></v-img>
              <span>DOWN</span>
            </div>
          </div>
          <div class="buy_multiples fixed">
            <span>PAYOUT MULTIPLIER</span>
            <div class="multiples_box">
              <div class="multiples_panel">
                <div class="plus_btn" @click="multipleMinus()">
                  <v-icon color="#000" size="20" icon="mdi-minus"></v-icon>
                </div>
                <div class="buy_input fixed">
                  <span class="multiples">x</span>
                  <v-text-field
                    label=""
                    v-model="buyMultiplier"
                    bg-color="rgba(0,0,0,0)"
                    color="#fff"
                    variant="plain"
                    hide-details="auto"
                    @input="handleInput"
                    @focus="
                      currentInput = 2;
                      isSlider = false;
                    "
                  ></v-text-field>
                </div>
                <div class="plus_btn" @click="multiplePlus()">
                  <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
                </div>
              </div>
              <div class="bust_price">
                <div>Bust Price:</div>
                <div class="bust_val">
                  {{
                    EbustPrice != "-"
                      ? Number(EbustPrice).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })
                      : EbustPrice
                  }}
                </div>
              </div>
            </div>
          </div>
          <div class="btn_box">
            <v-btn
              :class="['buy_btn', buyStatus == 'sell' && 'down']"
              @click="handleBuy()"
              width="100%"
              height="40"
              rounded="lg"
              size="small"
              :disabled="!isBuy"
            >
              <span class="finished">PLACE ORDER</span>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
    <v-dialog
      v-model="showAuto"
      class="dialog_panel"
      width="auto"
      transition="dialog-bottom-transition"
    >
      <div class="dialog_box">
        <div class="dialog_title">AUTO ORDER</div>
        <div class="close_btn" @click="handleReady()">
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/game/close.svg"
          ></v-img>
        </div>
        <div class="buying_panel">
          <div class="manual_box">
            <div class="buy_type_panel">
              <div class="buy_type_title">WILL THE PRICE GO UP OR DOWN?</div>
              <div class="buy_type_box">
                <div
                  :class="['buy_type_slider', buyStatus == 'sell' && 'down']"
                ></div>
                <div
                  :class="['buy_type_item', buyStatus == 'buy' && 'up_active']"
                  @click="buyStatus = 'buy'"
                >
                  <v-img
                    :width="16"
                    v-if="buyStatus == 'buy'"
                    cover
                    src="@/assets/images/svg/game/up.svg"
                  ></v-img>
                  <v-img
                    :width="16"
                    v-else
                    cover
                    src="@/assets/images/svg/game/type_white.svg"
                  ></v-img>
                  <span>UP</span>
                </div>
                <div
                  :class="[
                    'buy_type_item',
                    buyStatus == 'sell' && 'down_active',
                  ]"
                  @click="buyStatus = 'sell'"
                >
                  <v-img
                    :width="16"
                    v-if="buyStatus == 'sell'"
                    cover
                    src="@/assets/images/svg/game/drop.svg"
                  ></v-img>
                  <v-img
                    :width="16"
                    class="type_down"
                    v-else
                    cover
                    src="@/assets/images/svg/game/type_white.svg"
                  ></v-img>
                  <span>DOWN</span>
                </div>
              </div>
            </div>
            <div class="buy_numer_info">
              <div class="buy_price">
                <div>BUY</div>
                <div class="buy_input">
                  <v-img
                    :width="24"
                    cover
                    v-if="coinName == 'RCP'"
                    src="@/assets/images/game/icon_rcp.png"
                  ></v-img>
                  <v-img
                    :width="24"
                    cover
                    v-else
                    src="@/assets/images/game/icon_roller.png"
                  ></v-img>
                  <v-text-field
                    label=""
                    v-model="buyNum"
                    bg-color="rgba(0,0,0,0)"
                    color="#fff"
                    variant="plain"
                    hide-details="auto"
                    @input="handleInput"
                    @focus="currentInput = 1"
                  ></v-text-field>
                  <div class="multiples_btn" @click="handleMinus()">1/2</div>
                  <div class="multiples_btn" @click="handlePlus()">x2</div>
                </div>
              </div>
              <div class="buy_multiples">
                <span>PAYOUT MULTIPLIER</span>
                <div class="multiples_box">
                  <div class="buy_input">
                    <span class="multiples">x</span>
                    <v-text-field
                      label=""
                      v-model="buyMultiplier"
                      bg-color="rgba(0,0,0,0)"
                      color="#fff"
                      variant="plain"
                      hide-details="auto"
                      @input="handleInput"
                      @focus="
                        currentInput = 2;
                        isSlider = false;
                      "
                    ></v-text-field>
                  </div>
                  <div class="bust_price">
                    <div>Bust Price:</div>
                    <div class="bust_val">
                      {{
                        EbustPrice != "-"
                          ? Number(EbustPrice).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })
                          : EbustPrice
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="multiples_slider_box">
            <v-slider
              v-model="multipleNum"
              :min="1"
              :max="1000"
              :step="1"
              hide-details="auto"
              thumb-size="14"
              track-fill-color="rgba(0,0,0,0)"
              thumb-color="#fff"
              @update:focused="isSlider = true"
              track-size="12"
            ></v-slider>
            <div class="multiples_point">
              <div class="start">
                <span>x1 · </span>
                <span style="color: #0eff00; font-weight: bold">Safe</span>
              </div>
              <div class="end">
                <span style="color: #f60e0e; font-weight: bold">Wild</span>
                <span> · x1000</span>
              </div>
            </div>
          </div>
          <div class="stop_profit">
            <div>TAKE PROFIT AT PRICE/PROFIT</div>
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
                  currentInput = 3;
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
                    currentInput = 4;
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
            <div>CLOSE BET AT PRICE/LOSS</div>
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
                  currentInput = 5;
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
                    currentInput = 6;
                  "
                  placeholder="Profit"
                ></v-text-field>
              </div>
              <div class="error_text" v-if="stopLoss.isError">
                Trigger price is too close to current price
              </div>
            </div>
          </div>
          <v-btn
            :class="['buy_btn', buyStatus == 'sell' && 'down']"
            @click="handleBuy()"
            width="100%"
            height="32"
            rounded="lg"
            size="small"
            :disabled="!isBuy"
          >
            <span class="finished">PLACE ORDER</span>
          </v-btn>
        </div>
      </div>
    </v-dialog>
    <v-dialog v-model="showSwitch" width="auto" persistent>
      <div class="switch_box">
        <div class="switch_text">
          <span v-if="switchType == 1">
            Congratulations, you have unlocked access to the Advanced Room.
          </span>
          <span v-else>
            Unfortunately, your balance is not available to play at the Advanced
            Room.
          </span>
        </div>
        <v-btn class="enter_btn" @click="handleSwitchClose()">
          <span class="finished" v-if="switchType == 1">ENTER</span>
          <span class="finished" v-else>BACK TO BASIC</span>
        </v-btn>
      </div>
    </v-dialog>
    <Toast ref="toast" />
    <stopAmount @onStop="fetchOrderData"></stopAmount>
    <tipRules></tipRules>
    <profitCalculator></profitCalculator>
  </div>
</template>

<script lang="ts">
import { EventSourcePolyfill } from "event-source-polyfill";
import LineChart from "@/components/charts/LineChart.vue";
import CandlestickChart from "@/components/charts/CandlestickChart.vue";
import countDown from "@/components/countDown/index.vue";
import config from "@/services/env";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { accurateDecimal, unitConversion, isEmpty } from "@/utils";
import {
  addOrder,
  getOrderData,
  closeOrder,
  getOrderAll,
} from "@/services/api/order.js";
import bigNumber from "bignumber.js";
import stopAmount from "@/components/stopAmount/index.vue";
import tipRules from "@/components/rules/index.vue";
import profitCalculator from "@/components/calculator/index.vue";
import { useGameStore } from "@/store/game";
// import { useMessageStore } from "@/store/message.js";
import Toast from "@/components/toast/index.vue";

interface orderInfo {
  id: number; // ID
  userName: string; // 用户昵称
  userId: number; // 用户ID
  amount: number; // 购买数量
  coinName: string; //币种:RCP/RCT,
  price: number; // 价格
  multiplier: number; // 倍数
  exitPrice: number; // 退出价格
  income: number; // 收益，前端计算
  roi: number; // 盈亏
  createTime: string; // 创建时间
  updateTime: string; // 更新时间
  strikeOut: number; // 退出状态
  side: string; // 买入类型
  ebustPrice: number; // 爆仓价格，前端计算
  profit: number; // 止盈
  loss: number; // 止损
  level: number; // 等级
  [x: string]: string | number | any;
}

interface ToastMessage {
  tipsType: number; // 提示类型 1：买入 2：爆仓 3：收益 4：亏损
  side: string; // 买入类型
  amount: number; // 购买数量
  price: number; // 价格
  multiplier: number; // 倍数
  exitPrice?: number; // 退出价格
  income?: number; // 收益
  ebustPrice?: number; // 爆仓价格，前端计算
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      sseType: "ms500",
      nextDayTime: "",
      eventSource: null as any,
      coinName: "RCP",
      currentPrice: 1000 as number | any,
      isDrop: false,
      chartData: [] as Array<any>,
      showType: false,
      typeDrop: [
        { text: "Tick", val: "ms500" },
        { text: "5s", val: "s5" },
        { text: "15s", val: "s15" },
        { text: "30s", val: "s30" },
        { text: "1m", val: "m1" },
        { text: "5m", val: "m5" },
        { text: "15m", val: "m15" },
        { text: "30m", val: "m30" },
        { text: "1h", val: "h1" },
        { text: "2h", val: "h2" },
        { text: "4h", val: "h4" },
        { text: "6h", val: "h6" },
        { text: "12h", val: "h12" },
        { text: "1d", val: "d1" },
      ],
      buyType: "MANUAL",
      buyStatus: "buy", // 买/多 buy  卖/空 sell
      currentInput: 1, // 当前Input
      buyNum: "1,000" as number | any, // 购买数量
      buyMultiplier: "1,000" as number | any, // 倍数
      multipleNum: 1000 as number | any, // 倍数
      isSlider: false, // 是否滑动
      stopProfit: {
        isPrice: true, // 是否价格
        price: "" as string | any, // 价格
        profit: "" as string | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止盈
      stopLoss: {
        isPrice: true, // 是否价格
        price: "" as string | any, // 价格
        profit: "" as string | any, // 收益
        isError: false, // 阈值是否正确
      }, // 止损
      orderData: [] as Array<orderInfo>,
      finished: false,
      orderType: 0 as number, // 0:进行中 1:已结束 2:其他玩家
      orderTimer: null as number | any,
      page: 1,
      size: 10,
      showAuto: false,
      switchType: 2, // 1：升级 2：降级
      showSwitch: false, // 转场弹窗
    };
  },
  components: {
    LineChart,
    CandlestickChart,
    stopAmount,
    tipRules,
    profitCalculator,
    Toast,
    countDown,
  },
  computed: {
    // 用户信息
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    // 是否初始化
    isInit: {
      get() {
        const { isInit } = useGameStore();
        return isInit;
      },
      set(val: any) {
        const { setIsInit } = useGameStore();
        setIsInit(val);
      },
    },
    // 长连接类型
    currentType() {
      const { typeDrop } = this;
      const current = typeDrop.find((item: any) => item.val == this.sseType);
      return current?.text;
    },
    // 当前爆仓价格
    EbustPrice() {
      const { currentPrice, buyStatus, buyMultiplier, removeTxt } = this;

      if (isEmpty(currentPrice) || isEmpty(buyMultiplier)) return "-";

      return this.handleEbust(
        currentPrice,
        buyStatus,
        removeTxt(buyMultiplier)
      );
    },
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
    // 当前房间
    gameLevel() {
      const { gameLevel } = useGameStore();
      return gameLevel;
    },

    // 判断是否可购买
    isBuy() {
      const { buyType, buyNum, buyMultiplier, stopProfit, stopLoss } = this;
      let isBuy = true;

      // 检查 buyNum 和 buyMultiplier 是否存在
      if (isEmpty(buyNum) || isEmpty(buyMultiplier)) {
        isBuy = false;
      }

      if (buyType === "AUTO") {
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
      }

      return isBuy;
    },
    showRules: {
      get() {
        const { showRules } = useGameStore();
        return showRules;
      },
      set(val: boolean) {
        const { setShowRules } = useGameStore();
        setShowRules(val);
      },
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
  },
  created() {
    this.createSSE();
    this.getNextDayMidnight();
    this.fetchOrderData();

    if (this.gameLevel == "BASIC") {
      this.buyNum = "10";
      this.coinName = "RCP";
    }

    if (this.gameLevel == "ADVANCED") {
      this.buyNum = "1,000";
      this.coinName = "RCP";
    }

    if (this.gameLevel == "LEGENDARY") {
      this.buyNum = "100";
      this.coinName = "RCT";
    }
  },
  methods: {
    showToast(event: ToastMessage) {
      if (this.$refs.toast) {
        // 检查 $refs.toast 是否存在
        (this.$refs.toast as any).showToast(event); // 明确类型
      } else {
        console.error("Toast reference not found");
      }
    },
    accurateDecimal: accurateDecimal,
    unitConversion: unitConversion,
    createSSE() {
      if (window.EventSource) {
        // 根据环境的不同，变更url
        const url = config.api;

        let headerParams: any = {
          "Content-Type": "text/event-tream",
        };

        // 加载TOKEN
        if (localStorage.getItem("certificate")) {
          headerParams["certificate"] = localStorage.getItem("certificate");
        }

        // 初始化创建SSE
        this.eventSource = new EventSourcePolyfill(
          `${url}coaster-server-sse/sse/createConnect` +
            `?time=${this.sseType}&numberSessionsEnum=${this.gameLevel}`,
          {
            // 设置重连时间
            heartbeatTimeout: 10000,
            // 添加token
            headers: headerParams,
          }
        );

        // 公共数据
        this.eventSource.addEventListener("COMMON_DATA", (e: any) => {
          try {
            const chart = JSON.parse(e.data);
            if (this.sseType == "ms500") {
              // 折线数据
              this.handleSSELine(chart);
            } else {
              // K线数据
              this.handleSSECandlestick(chart);
            }
          } catch (error) {
            console.log(e);
            console.log(error);
          }
        });

        // 结算订单
        this.eventSource.addEventListener("USER_CLOSE_PRIZE", (e: any) => {
          try {
            const bustOrder = JSON.parse(e.data);

            const isBust =
              new bigNumber(bustOrder.amount)
                .plus(bustOrder.income)
                .toNumber() == 0;

            if (isBust) {
              this.showToast({ ...bustOrder, tipsType: 2 });
            } else {
              this.showToast({ ...bustOrder, tipsType: 3 });
            }

            if (this.orderType == 0) {
              const index = this.orderData.findIndex(
                (item: any) => item.id == bustOrder.id
              );

              if (index > -1) {
                this.orderData.splice(index, 1);
              }
            } else if (this.orderType == 1) {
              // roi 转化
              bustOrder.roi = accurateDecimal(
                new bigNumber(bustOrder.roi).multipliedBy(100).toNumber(),
                2,
                true
              );

              this.orderData.unshift(bustOrder);
            }
          } catch (error) {
            console.log(e);
            console.log(error);
          }
        });

        this.eventSource.addEventListener("CLOSE_PRIZE", (e: any) => {
          try {
            const closeData = JSON.parse(e.data);

            // 添加气泡数据
            const { setSellData } = useGameStore();
            setSellData(closeData);

            if (this.orderType != 2) return;

            // 将新数据添加到列表开头
            for (let i = 0; i < closeData.length; i++) {
              closeData[i].roi = accurateDecimal(
                new bigNumber(closeData[i].roi).multipliedBy(100).toNumber(),
                2,
                true
              );

              setTimeout(() => {
                this.orderData.unshift(closeData[i]);
              }, 1000 / 60);
            }

            this.$forceUpdate();

            // 控制列表长度不超过50个项
            if (this.orderData.length > 50) {
              this.orderData.splice(50); // 只保留前10个项
            }
          } catch (error) {
            console.log(e);
            console.log(error);
          }
        });

        // 设置连接操作
        this.connectSSE();
      } else {
        console.log("Your browser does not support SSE~");
      }
    },
    // 打开SEE连接
    connectSSE() {
      // 连接
      this.eventSource.onopen = (event: any) => {
        console.log("SSE connection succeeded");
      };

      this.eventSource.onerror = (event: any) => {
        let headerParams: any = {
          "Content-Type": "text/event-stream",
        };

        // 加载TOKEN
        if (localStorage.getItem("certificate")) {
          headerParams["certificate"] = localStorage.getItem("certificate");
        }

        if (event.readyState == EventSource.CLOSED) {
          console.log("SSE connection closed");
        } else if (this.eventSource.readyState == EventSource.CONNECTING) {
          console.log("SSE reconnect");
          //重新设置token
          this.eventSource.headers = headerParams;
          this.eventSource.close();
          this.eventSource = null;
          this.createSSE();
        } else {
          console.log("error", event);
        }
      };
    },
    // 处理SSE数据 折线
    handleSSELine(event: Array<any> | Object | any) {
      if (!(event.length > 0)) return; // 没有数据

      if (event.length > 10) {
        this.chartData = event;
        this.chartData.reverse(); // 数据改为正序
        this.currentPrice = this.chartData[this.chartData.length - 1].price;
        this.isInit = false;
      } else {
        this.chartData.shift();
        this.chartData.push(...event);
        let last = null as any;

        if (event.length > 0) {
          last = event[0];
        }

        if (Number(last.price) > Number(this.currentPrice)) {
          this.isDrop = false;
        } else {
          this.isDrop = true;
        }

        this.currentPrice = last.price;
      }
    },
    // 处理SSE数据 K线
    handleSSECandlestick(event: Array<any> | Object | any) {
      if (event.length > 10) {
        this.chartData = event;
        this.chartData.reverse(); // 数据改为正序
        this.currentPrice = this.chartData[this.chartData.length - 1].open;
        this.isInit = false;
      } else {
        const lastData = this.chartData[this.chartData.length - 1];
        if (lastData.bucket == event.bucket) {
          this.chartData[this.chartData.length - 1] = event;
        } else {
          this.chartData.push(event);
        }

        if (Number(event.open) > Number(this.currentPrice)) {
          this.isDrop = false;
        } else {
          this.isDrop = true;
        }

        this.currentPrice = event.open;
      }
    },
    // 全局关闭下拉
    handleAll() {
      this.showType = false;
    },
    // 关闭弹窗
    handleReady() {
      this.showAuto = false;
    },
    // 设置购买类型
    handlebuyType(event: any) {
      this.buyType = event;

      if (event == "AUTO") {
        this.showAuto = true;
      }
    },
    // 更改折线图类型
    handleType(event: any) {
      this.sseType = event.val;
      this.showType = false;
    },
    handleInput(event: any) {
      let {
          target: { _value },
        } = event,
        isDecimal = false;

      if (isEmpty(_value)) return;

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
        this.buyNum = parts[0];
      } else if (this.currentInput == 2) {
        this.buyMultiplier = Number(value) >= 1000 ? "1,000" : parts[0];
      } else if (this.currentInput == 3) {
        if (isDecimal) {
          parts[1] = parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1];
          this.stopProfit.price = parts.join(".");
        } else {
          this.stopProfit.price = parts.join(".");
        }
      } else if (this.currentInput == 4) {
        this.stopProfit.profit = parts[0];
      } else if (this.currentInput == 5) {
        if (isDecimal) {
          parts[1] = parts[1].length > 2 ? parts[1].substring(0, 2) : parts[1];
          this.stopLoss.price = parts.join(".");
        } else {
          this.stopLoss.price = parts.join(".");
        }
      } else if (this.currentInput == 6) {
        this.stopLoss.profit = parts[0];
      }
    },
    // 购买数量增加
    handlePlus() {
      const { buyNum, removeTxt } = this;
      this.buyNum = Number(
        Math.floor(Number(removeTxt(buyNum)) * 2)
      ).toLocaleString();
    },
    // 购买数量减少
    handleMinus() {
      const { buyNum, removeTxt } = this;
      this.buyNum = Number(
        Math.floor(Number(removeTxt(buyNum)) / 2)
      ).toLocaleString();
    },
    // 倍数增加
    multiplePlus() {
      const { buyMultiplier, removeTxt } = this;
      const multipleArray = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      const multiple = Number(removeTxt(buyMultiplier));
      const multipleId = multipleArray.findIndex((e) => e >= multiple);
      console.log(multipleId);

      if (multipleId > -1) {
        const multipleV =
          multipleId < multipleArray.length - 1
            ? multipleArray[multipleId + 1]
            : multipleArray[multipleArray.length - 1];
        this.buyMultiplier = Number(multipleV).toLocaleString();
      }
    },
    // 倍数减少
    multipleMinus() {
      const { buyMultiplier, removeTxt } = this;
      const multipleArray = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
      const multiple = Number(removeTxt(buyMultiplier));
      const multipleId = multipleArray.findIndex((e) => e >= multiple);

      if (multipleId > -1) {
        const multipleV =
          multipleId > 0 ? multipleArray[multipleId - 1] : multipleArray[0];
        this.buyMultiplier = Number(multipleV).toLocaleString();
      }
    },
    // 买入
    async handleBuy() {
      const {
        removeTxt,
        userInfo: { rcpAmount, rctAmount },
      } = this;

      const buyV = Number(removeTxt(this.buyNum));

      if (this.coinName == "RCP") {
        if (buyV > rcpAmount) {
          const { setShowRecharge } = useUserStore();
          setShowRecharge(true);
          return;
        }
      } else {
        if (buyV > rctAmount) {
          const { setShowRecharge } = useUserStore();
          setShowRecharge(true);
          return;
        }
      }

      let params: any = {
        coinName: this.coinName,
        multiplier: removeTxt(this.buyMultiplier),
        amount: removeTxt(this.buyNum),
        carOrderTypeEnum: this.buyStatus,
        numberSessionsEnum: this.gameLevel,
      };

      if (this.buyType == "AUTO") {
        if (!isEmpty(this.stopProfit.price)) {
          params.profit = this.removeTxt(this.stopProfit.profit);
        }

        if (!isEmpty(this.stopLoss.price)) {
          params.loss = this.removeTxt(this.stopLoss.profit);
        }
      }

      const res = await addOrder(params);

      if (res.code == 200) {
        this.showToast({ ...res.data, tipsType: 1 });

        if (this.orderType == 0) {
          this.orderData.unshift(res.data);
          for (let i = 0; i < this.orderData.length; i++) {
            const element = this.orderData[i];
            element.ebustPrice = this.handleEbust(
              element.price,
              element.side,
              element.multiplier
            );

            element.roi = accurateDecimal(
              new bigNumber(element.roi).multipliedBy(100).toNumber(),
              2,
              true
            );

            this.orderData[i] = element;
          }
        }

        // 更新余额
        const user = useUserStore();
        user.fetchUserInfo();

        this.showAuto = false;

        this.stopProfit = {
          isPrice: true, // 是否价格
          price: "", // 价格
          profit: "", // 收益
          isError: false, // 阈值是否正确
        }; // 止盈

        this.stopLoss = {
          isPrice: true, // 是否价格
          price: "", // 价格
          profit: "", // 收益
          isError: false, // 阈值是否正确
        }; // 止损
      } else {
        const errorData = res[res.length - 1];
        if (errorData.code == 20002) {
          let _value = errorData.message.replace(/[^\d.]/g, "");
          const buyV = new bigNumber(_value).dividedBy(1000).toNumber();
          this.buyNum = Number(buyV).toLocaleString();
          this.buyMultiplier = "1,000";
        }
      }
    },
    // 切换订单类型
    handleOrderStatus(event: any) {
      if (this.orderTimer) {
        clearTimeout(this.orderTimer);
        this.orderTimer = null;
      }

      this.orderData = [];
      this.orderTimer = setTimeout(() => {
        this.orderType = event;

        if (event != 2) {
          this.fetchOrderData();
        } else {
          this.fetchOrderAll();
        }
      }, 10);
    },
    // 获取氛围组
    async fetchOrderAll() {
      const { orderType } = this;

      const status = orderType;
      const res = await getOrderAll({});
      if (res.code == 200) {
        // 如果太卡，数据返回时，检查当前订单类型
        if (this.orderType != status) return;
        this.orderData = res.data;

        for (let i = 0; i < this.orderData.length; i++) {
          const element = this.orderData[i];

          element.roi = accurateDecimal(
            new bigNumber(element.roi).multipliedBy(100).toNumber(),
            2,
            true
          );

          this.orderData[i] = element;
        }
      }
    },
    // 获取订单列表
    async fetchOrderData(type = 1, isSearch = true) {
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const { size, orderType } = this;
      const params = {
        pageIndex: _page,
        pageSize: size,
        status: orderType,
      };

      const res = await getOrderData(params);

      if (res.code == 200) {
        // 如果太卡，数据返回时，检查当前订单类型
        if (this.orderType != params.status) return;
        const pages = Math.ceil(res.data.total / res.data.size);
        if (res.data.page >= pages) {
          this.finished = true;
        }

        if (type == 1) {
          this.orderData = res.data.records;
        } else {
          this.orderData.push.apply(this.orderData, res.data.records);
        }

        // 计算爆仓价格
        for (let i = 0; i < this.orderData.length; i++) {
          const element = this.orderData[i];
          element.ebustPrice = this.handleEbust(
            element.price,
            element.side,
            element.multiplier
          );

          if (this.orderType == 1) {
            element.roi = accurateDecimal(
              new bigNumber(element.roi).multipliedBy(100).toNumber(),
              2,
              true
            );
          }

          this.orderData[i] = element;
        }

        this.$forceUpdate();
      }
    },
    // 加载更多
    nextQuery() {
      if (this.orderType == 2) return;

      this.page++;
      this.fetchOrderData(2, false);
    },
    // 平仓
    async handleCloseOrder(event: orderInfo) {
      const res = await closeOrder({ id: event.id });
      if (res.code == 200) {
        this.fetchOrderData();
        // 更新余额
        const user = useUserStore();
        user.fetchUserInfo();
      }
    },
    // 设置止盈止损
    handleConfig(event: orderInfo) {
      const { setShowStop, setBuyInfo } = useGameStore();
      setBuyInfo(event);
      setShowStop(true);
    },
    /**
     * 计算爆仓价格。
     * @param {string} price - 买入价格。
     * @param {string} type - 类型，'buy':多/'sell':空
     * @param {string} multiple - 杠杆倍数。
     * @returns {string} - 爆仓价格，保留两位小数的字符串形式。
     */
    handleEbust(
      price: string | number,
      type: string,
      multiple: string | number
    ) {
      // 倍率
      const multiples = new bigNumber(1)
        .dividedBy(multiple || 0)
        .minus(0.00068)
        .toNumber();

      if (type == "buy") {
        // 多 开仓价1000， 倍数100，当前价格
        // 当前价格<=1000*(1-(1 / 100 - 0.00068))  时 爆仓
        const bustPrice = new bigNumber(1).minus(multiples).multipliedBy(price);
        return accurateDecimal(bustPrice, 2);
      } else {
        // 空 开仓价1000， 倍数100，当前价格
        //当前价格>=1000*(1+(1 / 100 - 0.00068)) 时爆仓

        const bustPrice = new bigNumber(1).plus(multiples).multipliedBy(price);
        return accurateDecimal(bustPrice, 2, true);
      }
    },
    /**
     * 动态计算收益
     * @param {string} type - 类型，'buy':多/'sell':空
     * @param {number} buyPrice - 买入价格。
     * @param {number} sellPrice - 卖出价格。
     * @param {number} buyNum - 买入数量。
     * @param {number} multiple - 杠杆倍数。
     * @param {number} isFee - 是否有服务费
     * @returns {number} 返回计算后的利润，保留两位小数。
     */
    getProfit(
      type: string,
      buyPrice: string | number,
      sellPrice: string | number,
      buyNum: string | number,
      multiple: string | number,
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
      const { currentPrice, buyNum, buyMultiplier, removeTxt } = this;

      let profitNum = profit;

      if (isFee) {
        profitNum = Number(new bigNumber(profit || 0).multipliedBy(1.05));
      }
      // 卖出价格 = 收益 / (杠杆倍数 * 买入数量) * 买入价 + 买入价
      const multiplierNum = new bigNumber(
        removeTxt(buyMultiplier)
      ).multipliedBy(removeTxt(buyNum));
      const sellPrice = new bigNumber(profitNum || 0)
        .dividedBy(multiplierNum)
        .multipliedBy(currentPrice)
        .plus(currentPrice)
        .toNumber();

      return Number(accurateDecimal(sellPrice, 2, true)).toLocaleString(
        undefined,
        { minimumFractionDigits: 2 }
      );
    },
    // 计算止盈止损价格
    handleStopProfit(num: any, type: string) {
      const { removeTxt } = this;
      const buyNumber = Number(removeTxt(this.buyNum));

      if (type == "profit") {
        const profit = this.getProfit(
          this.buyStatus,
          this.currentPrice,
          num,
          buyNumber,
          removeTxt(this.buyMultiplier),
          true
        );

        this.stopProfit.profit =
          num && profit > 0 ? Number(profit).toLocaleString() : "";
      } else {
        const profit = this.getProfit(
          this.buyStatus,
          this.currentPrice,
          num,
          buyNumber,
          removeTxt(this.buyMultiplier),
          false
        );
        const loss = profit < 0 ? Math.abs(profit) : "";

        if (loss) {
          this.stopLoss.profit =
            num && Number(loss) > buyNumber
              ? buyNumber.toLocaleString()
              : Number(loss).toLocaleString();
        } else {
          this.stopLoss.profit = "";
        }
      }
    },
    // 计算盈亏比例
    handleProfitRatio(amount: number, income: number) {
      if (amount == 0 || isNaN(amount) || isNaN(income)) {
        return 0;
      }

      const ratio = new bigNumber(income).dividedBy(amount).multipliedBy(100);
      return accurateDecimal(ratio, 2, true);
    },
    verifyProfit() {
      const {
        stopProfit: { price, profit },
        buyNum,
        removeTxt,
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(removeTxt(buyNum))
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
        buyNum,
        removeTxt,
      } = this;

      if (price || profit) {
        const threshold = new bigNumber(removeTxt(buyNum))
          .multipliedBy(0.1)
          .toNumber();

        if (
          Number(removeTxt(profit)) > threshold &&
          Number(removeTxt(profit)) < Number(removeTxt(buyNum))
        ) {
          this.stopLoss.isError = false;
        } else {
          this.stopLoss.isError = true;
        }
      } else {
        this.stopLoss.isError = false;
      }
    },
    // 弹出规则
    handleRules() {
      this.showRules = true;
    },
    // 弹出计算器
    handleCalculator() {
      const { setInitPrice } = useGameStore();
      setInitPrice(this.currentPrice);
      this.showCalculator = true;
    },
    // 关闭切换
    handleSwitchClose() {
      this.showSwitch = false;
      const { setGameLevel } = useGameStore();
      if (this.switchType == 1) {
        setGameLevel("ADVANCED");
      } else {
        setGameLevel("BASIC");
      }
    },
    // 格式化收益
    formatIncome(income: number) {
      if (Math.abs(income || 0) < 1000) {
        return Math.floor(income);
      } else {
        return unitConversion(Math.floor(income) || 0);
      }
    },
    // 删除指定字符串
    removeTxt(event: string, type = ",") {
      return String(event).replace(new RegExp(type, "g"), "");
    },
    // 获取明天的午夜时间
    getNextDayMidnight() {
      const { currentTime } = useUserStore();

      var nextDay = new Date(currentTime);
      nextDay.setDate(nextDay.getDate() + 1); // 增加一天
      nextDay.setHours(0, 0, 0, 0); // 将时间设置为午夜（0点）
      this.nextDayTime = nextDay.toUTCString();
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    });
  },
  watch: {
    sseType(newV, oldV) {
      if (newV != oldV) {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        this.chartData = [];
        this.isInit = false;
        this.createSSE();
      }
    },
    userInfo(newV) {
      if (!newV) return;

      if (this.gameLevel == "BASIC") {
        const { rcpAmount } = newV;
        if (Number(rcpAmount) > 100000) {
          this.switchType = 1;
          this.showSwitch = true;
        }
      } else if (this.gameLevel == "ADVANCED") {
        const { rcpAmount } = newV;
        if (Number(rcpAmount) < 10000) {
          this.switchType = 2;
          this.showSwitch = true;
        }
      }
    },
    gameLevel(newV, oldV) {
      if (newV != oldV) {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        if (this.gameLevel == "BASIC") {
          this.buyNum = "10";
          this.coinName = "RCP";
        }

        if (this.gameLevel == "ADVANCED") {
          this.buyNum = "1,000";
          this.coinName = "RCP";
        }

        if (this.gameLevel == "LEGENDARY") {
          this.buyNum = "100";
          this.coinName = "RCT";
        }

        this.chartData = [];
        this.isInit = false;
        this.createSSE();
      }
    },
    currentPrice(newV, oldV) {
      if (this.orderType == 0) {
        for (let i = 0; i < this.orderData.length; i++) {
          const element = this.orderData[i];
          element.income = this.getProfit(
            element.side,
            element.price,
            newV,
            element.amount,
            element.multiplier,
            true
          );
          element.roi = this.handleProfitRatio(element.amount, element.income);
          this.orderData[i] = element;
        }
      }

      if (this.buyType == "AUTO") {
        if (!this.buyMultiplier || !this.buyNum) return;

        const { removeTxt } = this;

        if (this.stopProfit.isPrice) {
          // 价格为准止盈
          if (this.stopProfit.price) {
            this.handleStopProfit(removeTxt(this.stopProfit.price), "profit");
            this.verifyProfit();
          }
        } else {
          if (this.stopProfit.profit) {
            this.stopProfit.price = this.getSellPrice(
              removeTxt(this.stopProfit.profit),
              true
            );
            this.verifyProfit();
          } else {
            if (this.stopProfit.price) {
              this.stopProfit.price = null;
              this.verifyProfit();
            }
          }
        }

        if (this.stopLoss.isPrice) {
          // 价格为准止损
          if (this.stopLoss.price) {
            this.handleStopProfit(removeTxt(this.stopLoss.price), "loss");
            this.verifyLoss();
          }
        } else {
          if (this.stopLoss.profit) {
            if (
              Number(removeTxt(this.stopLoss.profit)) > 0 &&
              Number(removeTxt(this.stopLoss.profit)) <=
                Number(this.removeTxt(this.buyNum))
            ) {
              this.stopLoss.price = this.getSellPrice(
                -Number(removeTxt(this.stopLoss.profit)),
                false
              );
            } else {
              this.stopLoss.price = "";
            }

            this.verifyLoss();
          } else {
            if (this.stopLoss.price) {
              this.stopLoss.price = null;
            }
          }
        }
      }

      this.$forceUpdate();
    },
    multipleNum(newV, oldV) {
      if (this.isSlider) {
        this.buyMultiplier = Number(newV).toLocaleString();
      }
    },
    buyMultiplier(newV, oldV) {
      if (!this.isSlider) {
        this.multipleNum = this.removeTxt(newV);
      }
    },
    "stopProfit.price"(newV: any) {
      if (!this.stopProfit.isPrice) return;
      this.handleStopProfit(newV, "profit");
      this.verifyProfit();
    },
    "stopProfit.profit"(newV: any) {
      if (this.stopProfit.isPrice) return;

      this.stopProfit.price = this.getSellPrice(this.removeTxt(newV), true);

      this.verifyProfit();
    },
    "stopLoss.price"(newV, oldV) {
      if (!this.stopLoss.isPrice) return;
      this.handleStopProfit(newV, "loss");

      this.verifyLoss();
    },
    "stopLoss.profit"(newV: any) {
      if (this.stopLoss.isPrice) return;
      if (
        Number(this.removeTxt(newV)) > 0 &&
        Number(this.removeTxt(newV)) <= Number(this.removeTxt(this.buyNum))
      ) {
        this.stopLoss.price = this.getSellPrice(
          -Number(this.removeTxt(newV)),
          false
        );
      } else {
        this.stopLoss.price = "";
      }

      this.verifyLoss();
    },
    showAuto(newV) {
      if (!newV) {
        this.buyType = "MANUAL";
      }
    },
  },
  beforeUnmount() {
    if (!this.eventSource) return;
    this.eventSource.close();
    this.eventSource = null;
  },
});
</script>
<style lang="scss" scoped>
.check_in_wrapper {
  padding: 8px 0 150px;
}

.toolbar_panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px;
  position: relative;

  .game_info {
    display: flex;
    align-items: center;
  }
}

.price_box {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  padding: 2px 16px;
  border-radius: 16px;

  &.drop {
    color: #ff4949;
    background-color: rgba(234, 69, 31, 0.2);
  }

  &.up {
    color: #72f238;
    background-color: rgba(122, 255, 0, 0.2);
  }

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.close_time {
  padding: 0 8px;
  font-family: "Arial Negreta", "Arial Normal", "Arial", sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 12px;
  line-height: 1;
  color: #b0b5c5;
  display: flex;
  align-items: center;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.chart_type {
  min-width: 60px;
  background: rgba(203, 215, 255, 0.03);
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  color: #b0b5c5;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart_type_items {
  position: absolute;
  right: 8px;
  top: 44px;
  background: #242735;
  width: 60px;
  border-radius: 4px;
  z-index: 10;

  .type_item {
    font-size: 14px;
    color: #b0b5c5;
    text-align: left;
    line-height: 1;
    padding: 4px 8px;

    &.active {
      color: #ffb018;
    }
  }
}

.chart_box {
  position: relative;

  .chart_mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    width: 10px;
    background: #1f212e;
    z-index: 200;
  }
}

.buying_panel {
  width: 100%;
  padding: 16px;

  &.fixed {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0;
  }
}

.buy_types {
  width: 200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: #161823;
  border-radius: 4px 4px 0 0;
  padding: 4px;
  box-sizing: border-box;

  .buy_type_item {
    border-radius: 6px;
    color: #ea980a;
    text-align: center;
    font-size: 14px;
    color: #fff;
    line-height: 1;
    padding: 6px 8px;
    box-sizing: border-box;
    flex: 1;
    z-index: 2;

    &.active {
      color: #ea980a;
    }
  }

  .buy_type_slider {
    position: absolute;
    background-color: #353744;
    transition: all 0.3s;
    border-radius: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    z-index: 1;

    &.auto {
      left: 50%;
      transition: all 0.3s;
    }
  }
}

.manual_box {
  &.fixed {
    padding: 8px 8px 16px;
    background-color: #2e303e;
    padding-bottom: 8px;
  }
}

.buy_type_panel {
  font-size: 14px;
  color: #b0b5c5;
  font-weight: bold;

  .buy_type_title {
    margin-bottom: 4px;
  }
}
.buy_type_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: #161823;
  border-radius: 4px;
  padding: 4px;

  .buy_type_item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    color: #fff;
    padding: 4px;
    border-radius: 4px;
    z-index: 2;

    &.fixed {
      min-width: calc(50% - 2px);
      font-size: 12px;
      padding: 2px;

      .v-img {
        margin-right: 4px;
      }
    }

    .v-img {
      flex: none;
      margin-right: 8px;
      filter: grayscale(50%);
    }

    .type_down {
      transform: rotateX(180deg);
    }

    &.up_active {
      color: #85f353;
    }

    &.down_active {
      color: #ff4949;
    }
  }

  .buy_type_slider {
    position: absolute;
    background-color: rgba(133, 243, 83, 0.4);
    transition: all 0.3s;
    border-radius: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    z-index: 1;

    &.down {
      background-color: #41272b;
      left: 50%;
      transition: all 0.3s;
    }
  }
}

.buy_numer_info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  flex-wrap: wrap;

  & > div {
    flex: 1;
    width: 100%;
    margin-bottom: 14px;
  }

  &.fixed {
    flex-direction: row;
  }

  &.fixed > div {
    flex: 1;
    min-width: 0;
    max-width: none;
    margin-bottom: 4px;

    &.buy_price,
    &.buy_multiples {
      min-width: 60%;
      margin-right: 8px;
    }
  }
}

.buy_price,
.buy_multiples {
  font-size: 14px;
  font-weight: bold;
  color: #b0b5c5;

  & > div + div {
    margin-top: 4px;
  }

  .buy_input {
    background-color: #161823;
    border-radius: 6px;
    color: #fff;
    display: flex;
    align-items: center;
    padding: 4px;

    & > div + div {
      margin-left: 4px;
    }

    .v-img {
      flex: none;
    }

    &.fixed {
      :deep(.v-field__input) {
        line-height: 1;
      }
    }

    :deep(.v-field__input) {
      padding: 0;
      min-height: 0;
      line-height: 2;
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

    .multiples_btn {
      background-color: #323444;
      border-radius: 4px;
      font-weight: 700;
      font-style: normal;
      font-size: 16px;
      color: #b0b5c5;
      padding: 6px 8px;
      line-height: 1;
      width: 50px;
      text-align: center;

      &.fixed {
        padding: 4px;
        width: 40px;
      }
    }

    .multiples {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #b0b5c5;
      padding: 0 8px;
    }
  }

  .multiples_box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > div:nth-child(1) {
      flex: 1;
    }

    & > div + div {
      margin-left: 8px;
    }
  }

  .multiples_panel {
    display: flex;
    align-items: center;
    justify-content: space-between;

    & > div {
      flex: 1;
    }

    & > .buy_input {
      border-radius: 0;
    }

    .plus_btn {
      max-width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      border: 1px solid #000;
      border-radius: 4px;
    }
  }

  .bust_price {
    font-size: 14px;
    font-weight: 400;
    line-height: 1;

    .bust_val {
      color: #fff;
    }
  }
}

.stop_profit,
.stop_loss {
  font-size: 14px;
  font-weight: bold;
  color: #b0b5c5;
  padding-bottom: 14px;

  & > div + div {
    margin-top: 4px;
  }
}

.profit_input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  & > div {
    max-width: calc(50% - 2px);
    flex: 1;
  }

  :deep(.v-field__input) {
    padding: 4px 8px;
    min-height: 0;
    line-height: 2;
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
    padding: 4px 8px;

    span {
      font-size: 20px;
      padding-right: 4px;
      font-weight: bold;
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

.multiples_slider_box {
  padding-bottom: 14px;

  :deep(.v-slider-track__background) {
    background: linear-gradient(90deg, #0eff00 0%, #e68007 46%, #f60e0e 100%);
    opacity: 1;
  }
}

.multiples_point {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  font-size: 14px;
  color: #fff;
}

.buy_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  font-size: 16px;
  color: #000;
  background-color: #85f353;
  border-radius: 4px !important;
  margin-top: 8px;

  &.down {
    background-color: #ff6969;
  }
}

.buy_item_btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  padding: 8px 0;
  border-radius: 4px;

  .v-img {
    flex: none;
    margin: 0 4px;
  }

  &.up {
    background-color: #223425;
    color: #66ff07;
  }

  &.drop {
    background-color: rgba(234, 69, 31, 0.2);
    color: #e60b0b;
  }
}

.other_box {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;

  .other_item {
    font-weight: bold;
    font-size: 14px;
    color: #b0b5c5;
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .other_item + .other_item {
    margin-left: 8px;
  }
}

.order_panel {
  padding: 8px 0 0;
}

.order_type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #242531;
  border-radius: 4px 4px 0 0;
  margin: 0 8px 0;
  overflow: hidden;

  .order_type_item {
    flex: 1;
    text-align: center;
    line-height: 1;
    font-weight: 700;
    font-size: 14px;
    color: #b0b5c5;
    padding: 6px 0;

    &.active {
      background-color: #323444;
      color: #ea980a;
    }
  }
}

.list-item {
  opacity: 1;
  transition: opacity 0.5s, transform 0.5s ease;
}

.list-enter-active,
.list-leave-active {
  transition: transform 0.5s ease;
}

.list-enter,
.list-leave-to {
  position: absolute;
}

.list-enter {
  transform: translateY(-100%);
}

.list-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.list-item:nth-child(2n-1) {
  background-color: #323444;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #1f212e;

  .order_types {
    margin-right: 8px;
  }

  .order_user {
    .user_name {
      width: 30px;
      font-size: 12px;
      color: #ffffff;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      margin-right: 8px;
    }
  }

  .order_data {
    flex: 1;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .order_data_info {
    min-width: 30%;
    padding: 4px 0;
    flex: 1;

    .title {
      font-size: 12px;
      color: #b0b5c5;
    }

    .val {
      color: #fff;
      font-weight: bold;
      font-size: 12px;
      line-height: 1;

      &.amount {
        display: flex;
        align-items: center;

        & > div + div {
          margin-left: 4px;
        }
        .v-img {
          flex: none;
        }
      }

      &.drop {
        color: #ff4949;
      }

      &.up {
        color: #72f238;
      }
    }
  }

  .operating_btn {
    flex: 1;
    background-color: rgba(255, 232, 26, 1);
    border: none;
    border-radius: 4px;
    box-shadow: 0px 4px 4px 0px rgba(242, 9, 9, 0.15) inset;
    font-weight: 700;
    font-size: 14px;
    color: #000000;
    padding: 6px 0;
    line-height: 1;
    text-align: center;
  }

  .order_btn {
    width: 28px;
    height: 28px;
    position: relative;
    margin-left: 8px;

    .drop {
      position: absolute;
      bottom: 0;
      left: 0;
    }

    .up {
      position: absolute;
      top: 0;
      right: 0;
    }
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}

.dialog_panel {
  :deep(.v-overlay__content) {
    margin: 0 !important;
    max-width: max-content !important;
    bottom: 0;
  }
}

.dialog_box {
  width: 100vw;
  background-color: #1f212e;
  border-radius: 4px 4px 0 0;

  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  font-size: 20px;
  line-height: 1.2;

  .dialog_title {
    color: #fdefd6;
    font-size: 20px;
    font-weight: bold;
    padding: 16px 0 0;
    color: #b0b5c5;
  }

  .close_btn {
    position: absolute;
    top: 16px;
    right: 16px;
    color: #b0b5c5;
  }
}

.dialog_order_panel {
  :deep(.v-overlay__content) {
    margin: 0 !important;
    max-width: max-content !important;
  }

  .order_box {
    background-color: #161823;
    margin: 0 16px;
    padding: 8px;
    border-radius: 8px;
  }

  .status_box {
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 8px;
    }
  }

  .status_info {
    .status_text {
      font-size: 16px;
      color: white;
      font-weight: bold;
    }

    .status_description {
      font-weight: 400;
      font-style: normal;
      font-size: 12px;
      color: #8c90a0;
    }
  }
}

.no_data {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 16px;
  color: #b0b5c5;
  font-weight: bold;
  background-color: #2d303e;

  .v-img {
    flex: none;
    margin: 0 auto;
    margin-bottom: 16px;
  }
}

.switch_box {
  background-color: #1f212e;
  box-shadow: 0px 5px 5px 0px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  padding: 16px 8px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;

  .switch_text {
    margin-bottom: 24px;
  }

  & > .v-btn {
    font-size: 14px;
    border-radius: 8px;
    color: #fff;
    margin-top: 12px;
  }

  .enter_btn {
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