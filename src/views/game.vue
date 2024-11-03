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
      <transition-group
        id="orderList"
        ref="orderList"
        name="list"
        tag="ul"
        v-if="orderData.length > 0"
      >
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
                  src="@/assets/images/game/icon_usdt.png"
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
                {{
                  `${Number(item.roi) >= 0 ? "+" : ""}${formatRatio(item.roi)}%`
                }}
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
      </transition-group>
      <div class="no_data" id="orderList" v-else>
        <v-img
          :width="48"
          cover
          src="@/assets/images/svg/game/no_data.svg"
        ></v-img>
        <span>No Orders Found</span>
      </div>
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
          <div class="buy_price fixed" id="buyNum">
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
                src="@/assets/images/game/icon_usdt.png"
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
          <div class="buy_type_box" id="buyStatus">
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
              <div class="multiples_panel" id="buyMultiplier">
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
              id="placeOrder"
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
      <div class="guide_wrapper" v-if="showGuide && guideIndex < 4">
        <div class="guide_box">
          <div class="guide_next" @click="handleGuideNext()">Next</div>
          <div class="guide_operating"></div>
          <div
            :class="['guide_text', guideConfig[guideIndex].hintAlign]"
            :style="{
              top: `${guideLocation}px`,
              left: guideConfig[guideIndex].hintAlign == 'left' ? '8px' : '',
              right: guideConfig[guideIndex].hintAlign == 'right' ? '8px' : '',
            }"
          >
            {{ guideConfig[guideIndex].hintText }}
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
                    src="@/assets/images/game/icon_usdt.png"
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
            <div>CLOSE ORDER AT PRICE/LOSS</div>
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
    <advertiseTask
      v-if="showAdvertise"
      :showAdvertise="showAdvertise"
      @showTask="showAdvertise = $event"
    ></advertiseTask>
    <doubleBenefit
      v-if="showDouble"
      :showDouble="showDouble"
      :doubleInfo="doubleInfo"
      @showDouble="showDouble = $event"
    ></doubleBenefit>
    <div
      v-if="showGuide"
      :class="['guide_mask', guideIndex == 4 ? 'guide_fit' : '']"
    >
      <div class="guide_box" v-if="guideIndex == 4">
        <div class="guide_operating">
          <div class="guide_operating_item" @click="handleGuideNext(false)">
            Show Again
          </div>
          <div class="guide_operating_item auto" @click="handleGuideClose()">
            GOT IT
          </div>
        </div>
        <div
          :class="['guide_text', guideConfig[guideIndex].hintAlign]"
          :style="{
            top: `${guideLocation}px`,
            left: guideConfig[guideIndex].hintAlign == 'left' ? '8px' : '',
            right: guideConfig[guideIndex].hintAlign == 'right' ? '8px' : '',
          }"
        >
          {{ guideConfig[guideIndex].hintText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EventSourcePolyfill } from "event-source-polyfill";
import LineChart from "@/components/charts/LineChart.vue";
import CandlestickChart from "@/components/charts/CandlestickChart.vue";
import countDown from "@/components/countDown/index.vue";
import advertiseTask from "@/components/modals/advertise.vue";
import doubleBenefit from "@/components/modals/doubleBenefit.vue";
import config from "@/services/env";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import {
  accurateDecimal,
  unitConversion,
  isEmpty,
  deepClone,
  getLocalStore,
  setLocalStore,
} from "@/utils";

import {
  addOrder,
  getOrderData,
  closeOrder,
  getOrderAll,
} from "@/services/api/order.js";

import { getUserInfo } from "@/services/api/user.js";
import bigNumber from "bignumber.js";
import stopAmount from "@/components/stopAmount/index.vue";
import tipRules from "@/components/rules/index.vue";
import profitCalculator from "@/components/calculator/index.vue";
import { useGameStore, guide } from "@/store/game";
// import { useMessageStore } from "@/store/message.js";
import Toast from "@/components/toast/index.vue";

interface orderInfo {
  id: number; // ID
  userName: string; // 用户昵称
  userId: number; // 用户ID
  amount: number; // 购买数量
  coinName: string; //币种:RCP/USDT,
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
      page: 1,
      size: 10,
      showAuto: false,
      switchType: 2, // 1：升级 2：降级
      showSwitch: false, // 转场弹窗
      timer: null as any,

      showAdvertise: false, // 广告任务
      showDouble: false, // 双倍领取
      doubleInfo: {} as orderInfo,

      showGuide: false, // 新手引导
      guideIndex: 0, // 新手引导索引
      guideLocation: 0,
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
    advertiseTask,
    doubleBenefit,
  },
  computed: {
    // 用户信息
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    guideConfig() {
      const { guideConfig } = useGameStore();
      return guideConfig;
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
      if (getLocalStore("basicInfo")) {
        const saveInfo = JSON.parse(getLocalStore("basicInfo"));
        this.buyNum = Number(saveInfo.amount).toLocaleString();
        this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
      } else {
        this.buyNum = "100";
      }

      this.coinName = "RCP";
    } else if (this.gameLevel == "ADVANCED") {
      if (getLocalStore("advancedInfo")) {
        const saveInfo = JSON.parse(getLocalStore("advancedInfo"));
        this.buyNum = Number(saveInfo.amount).toLocaleString();
        this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
      } else {
        this.buyNum = "1,000";
      }

      this.coinName = "RCP";
    } else {
      if (getLocalStore("legendaryInfo")) {
        const saveInfo = JSON.parse(getLocalStore("legendaryInfo"));
        this.buyNum = Number(saveInfo.amount).toLocaleString();
        this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
      } else {
        this.buyNum = "0.1";
      }

      this.coinName = "USDT";
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
              if (
                this.gameLevel == "BASIC" &&
                !this.showAdvertise &&
                this.orderData.length <= 1
              ) {
                this.doubleInfo = bustOrder;
                this.doubleInfo.income = Math.floor(bustOrder.income);
                if (5000 >= bustOrder.income && bustOrder.income >= 200) {
                  var randomNum = Math.floor(Math.random() * 100) + 1;
                  if (randomNum <= 40) {
                    this.showDouble = true;
                  }
                }
              }
            }

            if (this.orderType == 0) {
              const index = this.orderData.findIndex(
                (item: any) => item.id == bustOrder.id
              );

              if (index > -1) {
                this.orderData.splice(index, 1);
              }
            } else if (this.orderType == 1) {
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
            setSellData(deepClone(closeData));

            if (this.orderType != 2) return;

            // 将新数据添加到列表开头
            for (let i = 0; i < closeData.length; i++) {
              const isRepeat = this.orderData.some((item: any) => {
                return item.id == closeData[i].id;
              });

              if (isRepeat) continue;

              setTimeout(() => {
                if (this.orderType != 2) return;
                this.orderData.unshift(closeData[i]);

                // 控制列表长度不超过50个项
                if (this.orderData.length > 50) {
                  this.orderData = this.orderData.splice(0, 50); // 只保留前50个项
                }
              }, 1000 / 60);
            }

            this.$forceUpdate();
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
        userInfo: { rcpAmount, usdtAmount },
      } = this;

      const buyV = Number(removeTxt(this.buyNum));

      if (this.coinName == "RCP") {
        if (buyV > rcpAmount) {
          const { setShowRecharge } = useUserStore();
          setShowRecharge(true);
          return;
        }
      } else {
        if (buyV > usdtAmount) {
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

        const saveInfo = {
          multiplier: params.multiplier,
          amount: params.amount,
        };

        if (this.gameLevel == "BASIC") {
          setLocalStore("basicInfo", JSON.stringify(saveInfo));
        } else if (this.gameLevel == "ADVANCED") {
          setLocalStore("advancedInfo", JSON.stringify(saveInfo));
        } else {
          setLocalStore("legendaryInfo", JSON.stringify(saveInfo));
        }

        if (this.orderType == 0) {
          this.orderData.unshift(res.data);
          for (let i = 0; i < this.orderData.length; i++) {
            const element = this.orderData[i];
            element.ebustPrice = this.handleEbust(
              element.price,
              element.side,
              element.multiplier
            );

            this.orderData[i] = element;
          }
          this.handleOrderLocation();
        } else {
          this.orderType = 0;
          this.orderData = [];
          this.fetchOrderData();
          this.handleOrderLocation();
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

          if (this.coinName == "USDT") {
            const buyV = new bigNumber(_value).dividedBy(100).toNumber();

            this.buyNum = Number(buyV).toLocaleString();
            this.buyMultiplier = "100";
          } else {
            const buyV = new bigNumber(_value).dividedBy(1000).toNumber();
            this.buyNum = Number(buyV).toLocaleString();
            this.buyMultiplier = "1,000";
          }
        }
      }
    },
    // 切换订单类型
    handleOrderStatus(event: any) {
      this.orderData = [];
      this.orderType = event;
      this.$forceUpdate();

      if (event != 2) {
        this.fetchOrderData();
      } else {
        this.fetchOrderAll();
      }
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

        this.$forceUpdate();
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
        if (this.page >= pages) {
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

          this.orderData[i] = element;
        }

        this.$forceUpdate();
      }
    },
    // 加载更多
    nextQuery() {
      if (this.orderType == 2) return;

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page++;
        this.fetchOrderData(2, false);
      }, 300);
    },
    // 平仓
    async handleCloseOrder(event: orderInfo) {
      const res = await closeOrder({ id: event.id });
      if (res.code == 200) {
        this.fetchOrderData();
        this.handleUpdateBalance();
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
        return typeNum;
      } else {
        // 空  0-(卖出价 - 买入价)/买入价*杠杆*本金
        const typeNum = new bigNumber(0).minus(profit).toNumber();
        return typeNum;
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
        const profit = Math.floor(
          this.getProfit(
            this.buyStatus,
            this.currentPrice,
            num,
            buyNumber,
            removeTxt(this.buyMultiplier),
            true
          )
        );

        this.stopProfit.profit =
          num && profit > 0 ? Number(profit).toLocaleString() : "";
      } else {
        const profit = Math.floor(
          this.getProfit(
            this.buyStatus,
            this.currentPrice,
            num,
            buyNumber,
            removeTxt(this.buyMultiplier),
            false
          )
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
      if (!amount || !income) {
        return 0;
      }

      const ratio = new bigNumber(income).dividedBy(amount).toNumber();

      return ratio;
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
      const type = this.coinName == "RCP" ? 1 : 2;

      if (type == 1) {
        if (Math.abs(income || 0) < 1000) {
          return Math.floor(income);
        } else {
          return unitConversion(Math.floor(income) || 0);
        }
      } else {
        if (Math.abs(income || 0) < 1000) {
          return accurateDecimal(income, 2);
        } else {
          return unitConversion(accurateDecimal(income, 2) || 0);
        }
      }
    },
    handleScroll() {
      const _this = this;
      if (
        window.innerHeight + window.scrollY + 10 >=
        document.body.offsetHeight
      ) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    },
    // 格式化百分比
    formatRatio(num: string | number | any) {
      if (!num) {
        return "0.00";
      }

      const ratio = new bigNumber(num || 0).multipliedBy(100).toNumber();
      return accurateDecimal(ratio, 2, true);
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
    // 切换至订单位置
    handleOrderLocation() {
      const element = document.getElementById("orderList");

      if (element) {
        const elementTop =
          element.getBoundingClientRect().top + window.scrollY - 300; // 获取元素的顶部位置
        window.scrollTo({ top: elementTop, behavior: "smooth" }); // 滚动到该位置
      }
    },
    // 更新余额
    async handleUpdateBalance() {
      const res = await getUserInfo({});
      if (res.code == 200) {
        let info = res.data;
        info.rcpAmount = Math.floor(this.userInfo.rcpAmount);
        info.usdtAmount = accurateDecimal(this.userInfo.usdtAmount, 2);

        const { setUserInfo } = useUserStore();
        setUserInfo(info);

        if (this.gameLevel != "BASIC") return;

        // 如果余额低于800
        if (
          !this.showDouble &&
          this.orderData.length < 1 &&
          Number(info.rcpAmount) <= 800
        ) {
          this.showAdvertise = true;
        }
      }
    },
    // 处理新手引导下一步
    handleGuideNext(event = true) {
      const { guideConfig, guideIndex } = this;
      const element = document.getElementById(guideConfig[guideIndex].eventId);

      if (element) {
        element.classList.remove("guide_highlight");

        if (event) {
          this.guideIndex++;
        } else {
          this.guideIndex = 0;
        }

        this.guideLocation = this.getElementPosition(
          this.guideConfig[this.guideIndex]
        );
      }
    },
    // 处理关闭引导
    handleGuideClose() {
      this.showGuide = false;
      setLocalStore("guide", "2");
      const { guideConfig, guideIndex } = this;
      const element = document.getElementById(guideConfig[guideIndex].eventId);
      if (element) {
        element.classList.remove("guide_highlight");
      }
    },
    // 获取指定元素位置
    getElementPosition(event: guide) {
      const element = document.getElementById(event.eventId);
      if (element) {
        let location = null as number | any;
        if (this.guideIndex == 4) {
          const nodes = element.childNodes[0] as any;
          if (nodes.localName == "li") {
            nodes.classList.add("guide_highlight");

            const rect = nodes.getBoundingClientRect();
            location = rect.top + window.scrollY;
            location += 90;
          } else {
            element.classList.add("guide_highlight");

            const rect = element.getBoundingClientRect();
            location = rect.top + window.scrollY;
            location += 110;
          }
        } else {
          element.classList.add("guide_highlight");

          const rect = element.getBoundingClientRect();
          location = rect.top + window.scrollY;
        }

        if (event.hintLocation == "top") {
          location -= 50;
        } else {
          location += 50;
        }
        return location;
      }
      return -1;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);

    if (!getLocalStore("guide")) {
      this.showGuide = true;
      this.guideLocation = this.getElementPosition(
        this.guideConfig[this.guideIndex]
      );
    }
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
          if (getLocalStore("basicInfo")) {
            const saveInfo = JSON.parse(getLocalStore("basicInfo"));
            this.buyNum = Number(saveInfo.amount).toLocaleString();
            this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
          } else {
            this.buyNum = "100";
            this.coinName = "RCP";
          }
        } else if (this.gameLevel == "ADVANCED") {
          if (getLocalStore("advancedInfo")) {
            const saveInfo = JSON.parse(getLocalStore("advancedInfo"));
            this.buyNum = Number(saveInfo.amount).toLocaleString();
            this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
          } else {
            this.buyNum = "1,000";
            this.coinName = "RCP";
          }
        } else {
          if (getLocalStore("legendaryInfo")) {
            const saveInfo = JSON.parse(getLocalStore("legendaryInfo"));
            this.buyNum = Number(saveInfo.amount).toLocaleString();
            this.buyMultiplier = Number(saveInfo.multiplier).toLocaleString();
          } else {
            this.buyNum = "0.1";
            this.coinName = "USDT";
          }
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
    window.removeEventListener("scroll", this.handleScroll);

    if (!this.eventSource) return;
    this.eventSource.close();
    this.eventSource = null;
  },
});
</script>
<style lang="scss" scoped>
@import url("./css/game.scss");
</style>