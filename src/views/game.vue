<template>
  <div class="check_in_wrapper" @click="handleAll()">
    <div class="toolbar_panel">
      <div class="game_info">
        <div :class="['price_box', isDrop ? 'drop' : 'up']">
          <v-img :width="16" cover v-if="isDrop" :src="drop"></v-img>
          <v-img :width="16" cover v-else :src="up"></v-img>
          <span>{{ Number(currentPrice).toLocaleString() }}</span>
        </div>
        <div class="close_time">
          <v-img :width="14" cover src="@/assets/images/svg/game/remind.svg"></v-img>
          <span>{{ `ROUND ENDS IN:10:10:10` }}</span>
        </div>
      </div>
      <div class="chart_type" @click.stop="showType = !showType;">
        <span>{{ currentType }}</span>
        <v-icon icon="mdi-chevron-down" size="14"></v-icon>
      </div>
      <div class="chart_type_items" v-show="showType">
        <div :class="['type_item', sseType == item.val && 'active']" v-for="(item, index) in typeDrop" :key="index"
          @click.stop="handleType(item)">
          {{ item.text }}
        </div>
      </div>
    </div>
    <LineChart :chartData="lineChartData"></LineChart>
    <div class="buying_panel">
      <div class="buy_types">
        <div :class="['buy_type_item', buyType == 'MANUAL' && 'active']" @click="handlebuyType('MANUAL')">MANUAL</div>
        <div :class="['buy_type_item', buyType == 'AUTO' && 'active']" @click="handlebuyType('AUTO')">AUTO</div>
      </div>
      <div class="manual_box">
        <div class="buy_type_box">
          <div :class="['buy_type_slider', buyStatus == 'sell' && 'down']"></div>
          <div :class="['buy_type_item', buyStatus == 'buy' && 'up_active']" @click="buyStatus = 'buy'">
            <v-img :width="16" v-if="buyStatus == 'buy'" cover :src="up"></v-img>
            <v-img :width="16" v-else cover src="@/assets/images/svg/game/type_white.svg"></v-img>
            <span>UP</span>
          </div>
          <div :class="['buy_type_item', buyStatus == 'sell' && 'down_active']" @click="buyStatus = 'sell'">
            <v-img :width="16" v-if="buyStatus == 'sell'" cover :src="drop"></v-img>
            <v-img :width="16" class="type_down" v-else cover src="@/assets/images/svg/game/type_white.svg"></v-img>
            <span>DOWN</span>
          </div>
        </div>
        <div class="buy_numer_info">
          <div class="buy_price">
            <span>BUY</span>
            <div class="buy_input">
              <v-img :width="24" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
              <v-text-field label="" v-model="buyNum" bg-color="rgba(0,0,0,0)" type="number" color="#fff" variant="solo"
                hide-details="auto"></v-text-field>
              <div class="multiples_btn" @click="handleMinus()">1/2</div>
              <div class="multiples_btn" @click="handlePlus()">x2</div>
            </div>
          </div>
          <div class="buy_multiples">
            <span>PAYOUT MULTIPLIER</span>
            <div class="multiples_box">
              <div class="buy_input">
                <span class="multiples">x</span>
                <v-text-field label="" v-model="buyMultiplier" type="number" bg-color="rgba(0,0,0,0)" color="#fff"
                  variant="solo" hide-details="auto"></v-text-field>
              </div>
              <div class="bust_price">
                <div>Bust Price:</div>
                <div class="bust_val">{{ EbustPrice }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="multiples_slider_box">
        <v-slider v-model="buyMultiplier" :min="1" :max="1000" :step="0.01" hide-details="auto" thumb-size="14"
          track-fill-color="rgba(0,0,0,0)" thumb-color="#fff" track-size="12"></v-slider>
        <div class="multiples_point">
          <div class="start">
            <span>x1 · </span>
            <span style="color: #0eff00;font-weight: bold;">Safe</span>
          </div>
          <div class="end">
            <span style="color: #f60e0e;font-weight: bold;">Wild</span>
            <span> · x1</span>
          </div>
        </div>
      </div>
      <div :class="['buy_btn', buyStatus == 'sell' && 'down']" @click="handleBuy('buy')">
        <span>PLACE BET</span>
      </div>
      <div class="other_box">
        <div class="other_item">
          <v-img :width="16" cover src="@/assets/images/svg/game/description.svg"></v-img>
          <span>How It Works</span>
        </div>
        <div class="other_item">
          <v-img :width="16" cover src="@/assets/images/svg/game/calculator.svg"></v-img>
          <span>ROI Calculator</span>
        </div>
      </div>
    </div>
    <div class="order_panel">
      <div class="order_type">
        <div class="order_type_item active">Active Bets</div>
        <div class="order_type_item">Closed Bets</div>
        <div class="order_type_item">Public Bets</div>
      </div>
      <div class="order_list">
        <div class="order_title">
          <div class="title_item">BET</div>
          <div class="title_item">WAGER</div>
          <div class="title_item">X</div>
          <div class="title_item">ENTRY PRICE</div>
          <div class="title_item">EBUST PRICE</div>
          <div class="title_item">P&L</div>
        </div>
        <div class="order_data">
          <div class="order_data_item" v-for="(item, index) in orderData" :key="index">
            <div class="data_item_info">
              <div class="info_data">
                <v-img :width="16" cover :src="item.side == 'sell' ? drop : up"></v-img>
              </div>
              <div class="info_data">
                <span>{{ unitConversion(item.amount) }}</span>
                <v-img :width="14" cover src="@/assets/images/svg/check_in/gm_coin.svg"></v-img>
              </div>
              <div class="info_data">{{ `X ${item.multiplier}` }}</div>
              <div class="info_data">{{ item.price }}</div>
              <div class="info_data">{{ item.exitPrice }}</div>
              <div :class="['info_data', item.income >= 0 ? 'up' : 'drop']">
                {{ `${Number(item.income) >= 0 ? '+' : '-'}` + unitConversion(item.income || 0) }}
              </div>
            </div>
            <div class="data_item_operating">
              <div class="operating_btn" @click="handleCloseOrder(item)">CASH OUT</div>
              <div class="config_btn">
                <v-img :width="14" class="drop" cover src="@/assets/images/svg/game/config_white.svg"></v-img>
                <v-img :width="12" class="up" cover src="@/assets/images/svg/game/config_white.svg"></v-img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { EventSourcePolyfill } from "event-source-polyfill";
import LineChart from "@/components/charts/LineChart.vue";
import config from "@/services/env";
import { defineComponent } from 'vue';
import up from "@/assets/images/svg/game/up.svg";
import drop from "@/assets/images/svg/game/drop.svg";
import { accurateDecimal, unitConversion, timeForStr } from "@/utils";
import { addOrder, getOrderData, closeOrder } from "@/services/api/order.js";
import { useMessageStore } from "@/store/message.js";
import bigNumber from 'bignumber.js';

interface orderInfo {
  "id": number, // ID
  "userName": string, // 用户昵称
  "userId": number, // 用户ID
  "amount": number, // 购买数量
  "coinName": string, //币种:RCP/RCT,
  "price": number, // 价格
  "multiplier": number, // 倍数
  "exitPrice": number, // 退出价格
  "income": number, // 收益
  "roi": string, // 盈亏
  "createTime": string, // 创建时间
  "updateTime": string, // 更新时间
  "strikeOut": number,  // 退出状态
  "side": string // 买入类型
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      sseType: "ms500",
      eventSource: null as any,
      currentPrice: 1000 as number | any,
      isDrop: false,
      up,
      drop,
      chartData: [] as Array<any>,
      lineChartData: {} as any,
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
      buyNum: 1000 as number | any, // 购买数量
      buyMultiplier: 1 as number | any, // 倍数
      orderData: [] as Array<orderInfo>,
      finished: false,
      page: 1,
      size: 10
    };
  },
  components: {
    LineChart
  },
  computed: {
    // 长连接类型
    currentType() {
      const { typeDrop } = this;
      const current = typeDrop.find((item: any) => item.val == this.sseType);
      return current?.text;
    },
    // 当前爆仓价格
    EbustPrice() {
      const { currentPrice, buyStatus, buyMultiplier } = this;
      // 倍率
      const multiple = new bigNumber(1).dividedBy(buyMultiplier).minus(0.00068);
      if (buyStatus == "buy") {
        // 多 开仓价1000， 倍数100，当前价格
        // 当前价格<=1000*(1-(1 / 100 - 0.00068))  时 爆仓
        const price = new bigNumber(1).minus(multiple).multipliedBy(currentPrice);
        return accurateDecimal(price, 2)
      } else {
        // 空 开仓价1000， 倍数100，当前价格
        //当前价格>=1000*(1+(1 / 100 - 0.00068)) 时爆仓

        const price = new bigNumber(1).plus(multiple).multipliedBy(currentPrice);
        return accurateDecimal(price, 2)
      }
    },
  },
  created() {
    this.createSSE();
    this.fetchOrderData();
  },
  methods: {
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
          headerParams["certificate"] = localStorage.getItem("certificate")
        }

        // 初始化创建SSE
        this.eventSource = new EventSourcePolyfill(
          `${url}coaster-server-sse/sse/createConnect` + `?time=${this.sseType}`,
          {
            // 设置重连时间
            heartbeatTimeout: 5000,
            // 添加token
            headers: headerParams,
          }
        );

        this.connectSSE();
      } else {
        console.log("Your browser does not support SSE~");
      }
    },
    connectSSE() {
      // 连接
      this.eventSource.onopen = (event: any) => {
        // 公共数据
        this.eventSource.addEventListener("COMMON_DATA", (e: any) => {
          try {
            const chart = JSON.parse(e.data);
            if (this.chartData.length <= 0) {
              this.chartData = chart;
              this.chartData.reverse();
              this.currentPrice = this.chartData[this.chartData.length - 1].price;
            } else {
              this.chartData.push(...chart);
              let last = null as any
              if (chart.length > 0) {
                last = chart[0];
              }
              if (Number(last.price) > Number(this.currentPrice)) {
                this.isDrop = false;
              } else {
                this.isDrop = true;
              }

              this.currentPrice = last.price;
              this.chartData.shift();
            }
          } catch (error) {
          }

          let series = [];
          series.push({
            type: "line",
            data: this.chartData.map(function (item) {
              return item.price;
            }),
            smooth: true,
            sampling: 'lttb',
            symbol: "none",
            showSymbol: false,
            showLegendSymbol: false,
            animation: true,
            animationDurationUpdate: 300, // 数据更新的动画时长
            animationEasingUpdate: 'cubicInOut', // 数据更新的缓动效果
            animationDelayUpdate: 0, // 数据更新的动画延迟时间
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(255, 176, 24, 0.2)", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(255, 176, 24, 0)", // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            markLine: {
              animation: false,
              symbol: 'none', // 标记线两端的标记类型
              lineStyle: {
                color: this.isDrop ? '#ff4949' : '#72f238',
              },
              data: [
                {
                  name: this.chartData[this.chartData.length - 1].price,
                  yAxis: this.chartData[this.chartData.length - 1].price
                }
              ],
              label: {
                height: 20,
                lineHeight: 1,
                formatter: this.chartData[this.chartData.length - 1].price,
                backgroundColor: this.isDrop ? '#ff4949' : '#72f238',
                borderRadius: 2,
                padding: [0, 4, 0, 4]
              }
            }
          });

          let xAxis = this.chartData.map((item) => {
            return item.localDateTime;
          });

          this.setOptions(xAxis, series);
        });


        this.eventSource.addEventListener("OPEN_PRIZE", (e: any) => {
          this.fetchOrderData();
        })
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
        } else {
          console.log("error", event);
        }
      };
    },
    // 全局关闭下拉
    handleAll() {
      this.showType = false;
    },
    // 更改折线图类型
    handleType(event: any) {
      this.sseType = event.val;
      this.showType = false;
    },
    // 购买数量增加
    handlePlus() {
      this.buyNum = accurateDecimal(this.buyNum * 2, 2);
    },
    // 购买数量减少
    handleMinus() {
      this.buyNum = accurateDecimal(this.buyNum / 2, 2);
    },
    // 购买
    async handleBuy(type: string) {
      const params = {
        coinName: "RCP",
        multiplier: this.buyMultiplier,
        amount: this.buyNum,
        carOrderTypeEnum: type
      };
      const res = await addOrder(params);
      if (res.code == 200) {

        const { setMessageText } = useMessageStore();
        setMessageText("Bet placed");
      }
    },
    // 获取订单列表
    async fetchOrderData(type = 1, isSearch = true) {
      if (this.finished) return;
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }
      const res = await getOrderData({
        pageIndex: _page,
        pageSize: this.size
      })

      if (res.code == 200) {
        const pages = Math.ceil(res.data.total / res.data.size);
        if (res.data.page >= pages) {
          this.finished = true;
        }

        if (type == 1) {
          this.orderData = res.data.records;
        } else {
          this.orderData.push.apply(this.orderData, res.data.records);
        }
      }
    },
    // 平仓
    async handleCloseOrder(event: orderInfo) {
      const res = await closeOrder({ id: event.id });
      if (res.code == 200) {
        this.fetchOrderData(2, false);
        const { setMessageText } = useMessageStore();
        setMessageText("Bet placed");
      }
    },
    // 加载更多
    nextQuery() {
      this.page++;
      this.fetchOrderData(2, false);
    },
    // 设置购买类型
    handlebuyType(event: any) {
      this.buyType = event;
    },
    // 设置图表数据
    setOptions(xAxis: any, series: any) {

      this.lineChartData = {
        color: ["#FFB018"],
        xAxis: {
          type: "category",
          data: xAxis,
          boundaryGap: false,
          axisTick: {
            show: true,
            inside: true
          },
          axisLine: {
            lineStyle: {
              color: "#D4E2F1",
            },
          },
          axisLabel: {
            color: "#c4bfbd",
            formatter: function (value: string, index: any) {
              const date = new Date(value);
              return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
          },
          axisPointer: {
            show: true,
            color: "#393E51",
            label: {
              formatter: function (params: any) {
                return timeForStr(params.value, "MM/dd HH:mm:ss");
              },
              backgroundColor: "#303545"
            },
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true,
        },
        yAxis: {
          position: "right",
          min: function (value: any) {
            return accurateDecimal(value.min - 20, 2);
          },
          max: function (value: any) {
            return accurateDecimal(value.max + 20, 2);
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#D4E2F1",
            },
          },
          axisLabel: {
            color: "#c4bfbd"
          },
          axisPointer: {
            show: true,
            color: "#393E51",
            label: {
              backgroundColor: "#303545"
            },
          },
          splitLine: {
            lineStyle: { color: "rgba(255,255,255,0.1)" },
          }, //网格线配置
          splitArea: { show: false }, //去掉网格颜色
        },
        dataZoom: [
          {
            type: 'inside',
            filterMode: 'filter',
            start: 98,
            end: 100
          }
        ],
        series: series,
      };
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener('scroll', function () {
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
        this.eventSource.close();
        this.connectSSE();
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.check_in_wrapper {
  padding: 8px 8px 16px;
}

.toolbar_panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
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
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 12px;
  line-height: 1;
  color: #B0B5C5;
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
  font-size: 16px;
  color: #fff;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart_type_items {
  position: absolute;
  right: 0;
  top: 44px;
  background: rgba(203, 215, 255, 0.03);
  width: 60px;
  border-radius: 4px;
  z-index: 10;

  .type_item {
    font-size: 14px;
    color: #fff;
    text-align: left;
    line-height: 1;
    padding: 8px;

    &.active {
      color: #ffb018;
    }
  }
}

.chart_box {
  width: 100%;
  height: 100%;
}

.buying_panel {
  padding-top: 8px;
}

.buy_types {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .buy_type_item+.buy_type_item {
    margin-left: 8px;
  }

  .buy_type_item {
    background-color: #323444;
    border-radius: 6px;
    color: #EA980A;
    text-align: center;
    font-size: 14px;
    color: #fff;
    line-height: 1;
    padding: 4px 16px;
    box-sizing: border-box;
    flex: 1;

    &.active {
      text-shadow: 1px 1px 10px rgba(255, 222, 5, 0.6);
      color: #EA980A;
    }
  }
}

.manual_box {
  padding-top: 8px;
}

.buy_type_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  background-color: #161823;
  border-radius: 4px;
  padding: 4px;

  .buy_type_item+.buy_type_item {
    margin-left: 8px;
  }

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

    .v-img {
      flex: none;
      margin-right: 8px;
      filter: grayscale(50%);
    }

    .type_down {
      transform: rotateX(180deg);
    }

    &.up_active {
      color: #85F353;
    }

    &.down_active {
      color: #FF4949;
    }
  }

  .buy_type_slider {
    position: absolute;
    background-color: rgba(133, 243, 83, 0.4);
    transition: all 0.3s;
    border-radius: 4px;
    left: 4px;
    width: calc(50% - 8px);
    height: calc(100% - 8px);
    z-index: 1;

    &.down {
      background-color: #41272b;
      left: calc(50% + 4px);
      transition: all 0.3s;
    }
  }
}

.buy_numer_info {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &>div {
    flex: 1;
  }

  &>div+div {
    margin-left: 8px;
  }
}

.buy_price,
.buy_multiples {
  font-size: 14px;
  font-weight: bold;
  color: #B0B5C5;



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
      padding: 0;
      min-height: 0;
      color: #fff;
    }

    .multiples_btn {
      background-color: #323444;
      border-radius: 4px;
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #B0B5C5;
      padding: 2px 4px;
      line-height: 1;
    }

    .multiples_btn+.multiples_btn {
      margin-left: 4px;
    }

    .multiples {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #B0B5C5;
      padding: 0 8px;
    }


  }

  .multiples_box {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &>div:nth-child(1) {
      flex: 1;
    }

    &>div+div {
      margin-left: 8px;
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

.multiples_slider_box {
  padding-top: 8px;
  overflow: hidden;

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
  border-radius: 4px;
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
    color: #66FF07;
  }

  &.drop {
    background-color: rgba(234, 69, 31, 0.2);
    color: #E60B0B;
  }
}

.other_box {
  display: flex;
  align-items: center;
  padding-top: 8px;

  .other_item {
    font-weight: bold;
    font-size: 14px;
    color: #B0B5C5;
    display: flex;
    align-items: center;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }

  .other_item+.other_item {
    margin-left: 8px;
  }
}

.order_panel {
  padding-top: 8px;
}

.order_type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #242531;
  border-radius: 4px;
  overflow: hidden;

  .order_type_item {
    flex: 1;
    text-align: center;
    line-height: 1;
    font-weight: 700;
    font-size: 14px;
    color: #B0B5C5;
    padding: 6px 0;

    &.active {
      background-color: #323444;
      color: #EA980A;
    }
  }
}

.order_list {
  padding-top: 8px;
  overflow-x: scroll;
}

.order_title {
  width: 430px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #B0B5C5;

  .title_item {
    flex: 1;
    white-space: nowrap;
    text-align: center;
  }

  .title_item:nth-child(1) {
    min-width: 30px;
  }

  .title_item:nth-child(2) {
    min-width: 80px;
  }

  .title_item:nth-child(3) {
    min-width: 60px;
  }

  .title_item:nth-child(4) {
    min-width: 100px;
  }

  .title_item:nth-child(5) {
    min-width: 100px;
  }

  .title_item:nth-child(6) {
    min-width: 60px;
  }
}

.order_data {
  width: 430px;

  .order_data_item:nth-child(2n-1) {
    background-color: #2d303e;
  }
}

.order_data_item {
  padding: 4px 0;

  .data_item_info {
    display: flex;
    align-items: center;

    .info_data {
      flex: 1;
      white-space: nowrap;
      color: #fff;
      font-weight: bold;
      font-size: 12px;
      text-align: center;
      line-height: 1;
    }

    .info_data:nth-child(1) {
      min-width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;

      .v-img {
        flex: none;
      }
    }

    .info_data:nth-child(2) {
      min-width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;

      .v-img {
        flex: none;
        margin-left: 4px;
      }
    }

    .info_data:nth-child(3) {
      min-width: 60px;
    }

    .info_data:nth-child(4) {
      min-width: 100px;
    }

    .info_data:nth-child(5) {
      min-width: 100px;
    }

    .info_data:nth-child(6) {
      min-width: 60px;

      &.drop {
        color: #ff4949;
      }

      &.up {
        color: #72f238;
      }
    }
  }

  .data_item_operating {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 4px;

    .operating_btn {
      width: 90%;
      background-color: rgba(122, 255, 0, 0.1843137254901961);
      border-radius: 4px;
      padding: 4px;
      color: #10A200;
      font-size: 12px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
    }

    .config_btn {
      width: 22px;
      height: 22px;
      position: relative;
      margin-right: 4px;

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
}
</style>