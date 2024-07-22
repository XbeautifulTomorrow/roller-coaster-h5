<template>
  <div class="check_in_wrapper" @click="handleAll()">
    <div class="toolbar_panel">
      <div class="game_info">
        <div :class="['price_box', isDrop ? 'drop' : 'up']">
          <v-img :width="16" cover :src="isDrop ? drop : up"></v-img>
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
                <div class="bust_val">1000</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="multiples_slider_box">
        <v-slider v-model="buyMultiplier" :max="1000" :step="0.01" hide-details="auto" thumb-size="14"
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
      <div class="buy_btns">
        <div class="buy_item_btn up">
          <span>PLACE BET </span>
          <v-img :width="12" cover :src="up"></v-img>
          <span> UP</span>
        </div>
        <div class="buy_item_btn drop">
          <span>PLACE BET</span>
          <v-img :width="12" cover :src="drop"></v-img>
          <span>DOWN</span>
        </div>
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
import { accurateDecimal } from "@/utils";
import { addOrder, getOrderData } from "@/services/api/order.js";

export default defineComponent({
  data() {
    return {
      sseType: "ms500",
      eventSource: null as any,
      currentPrice: 1024 as number | any,
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
      myChart: null as any,
      buyType: "MANUAL",
      buyNum: 1000 as number | any, // 购买数量
      buyMultiplier: 1 as number | any, // 倍数
      finished: false,
      page: 1,
      size: 10
    };
  },
  components: {
    LineChart
  },
  computed: {
    currentType() {
      const { typeDrop } = this;
      const current = typeDrop.find((item: any) => item.val == this.sseType);
      return current?.text;
    }
  },
  created() {
    this.createSSE();
  },
  methods: {
    createSSE() {
      if (window.EventSource) {
        // 根据环境的不同，变更url
        const url =
          config.ENV == "prod" ? "https://sse.bitzing.io/" : config.api;

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
            } else {
              this.chartData.push(...chart);
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
            showLegendSymbol: false
          });

          let xAxis = this.chartData.map((item) => {
            return item.localDateTime;
          });

          this.setOptions(xAxis, series);
        });
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
      this.buyNum = Number(this.buyNum * 2).toFixed(2);
    },
    // 购买数量减少
    handleMinus() {
      this.buyNum = Number(this.buyNum / 2).toFixed(2);
    },
    // 购买
    async handleBuy() {
      const params = {
        buyType: this.buyType,
        buyNum: this.buyNum,
        buyMultiplier: this.buyMultiplier,
      };
      const res = await addOrder(params);
      if (res.code == 200) {

      }
    },
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

      }
    },
    // 设置购买类型
    handlebuyType(event: any) {
      this.buyType = event;
    },
    // 设置图表数据
    setOptions(xAxis: any, series: any) {

      this.lineChartData = {
        color: ["#00F380"],
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
          splitLine: {
            lineStyle: { color: "rgba(255,255,255,0.1)" },
          }, //网格线配置
          splitArea: { show: false }, //去掉网格颜色
        },
        dataZoom: [
          {
            type: 'inside',
            filterMode: 'filter',
            start: 95,
            end: 100
          }
        ],
        series: series,
      };
    },
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

.buy_btns {
  display: flex;
  padding-top: 8px;

  .buy_item_btn+.buy_item_btn {
    margin-left: 8px;
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
}

.order_title {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #B0B5C5;

  .title_item {
    flex: 1;
  }
}
</style>