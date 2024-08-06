<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script lang="ts">
import * as echarts from "echarts";
import "echarts/theme/macarons"; // echarts theme
import { accurateDecimal, timeForStr } from "@/utils";
import { useGameStore, orderInfo } from "@/store/game";
import { useUserStore } from "@/store/user";
import bigNumber from "bignumber.js";

import drop from "@/assets/images/svg/game/drop.svg";
import up from "@/assets/images/svg/game/up.svg";

interface LineData {
  localDateTime: string | number | any;
  price: string | number | any;
  [x: string]: number | string | any;
}

export default {
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "240px",
    },
    autoResize: {
      type: Boolean,
      default: true,
    },
    isDrop: {
      type: Boolean,
      default: true,
    },
    chartData: {
      type: Array<LineData>,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      chart: null as any,
      lastUpdateTime: Date.now(),
      markArray: [] as Array<number>,
      drop: drop,
      up: up,
    };
  },
  computed: {
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
    // 标记点
    markNum() {
      const { chartData } = this;
      if (chartData.length > 0) {
        return chartData[chartData.length - 1].price;
      }

      return 0;
    },
    // 气泡
    sellData() {
      const { sellData } = useGameStore();
      return sellData;
    },
    // 等级图片
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        if (!this.chart) return;
        if (this.isInit) {
          this.setOptions();
          return;
        }

        this.initOptions();
      },
    },
    sellData(newV) {
      if (!newV) {
        return;
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeUnmount() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
    },
    /**
     * 初始化图表配置
     * @param xAxis 横坐标
     * @param series 折线图数据
     */
    initOptions() {
      this.chart.clear();
      this.chart.showLoading();

      let series = [
        {
          type: "line",
          data: this.chartData.map((item) => item.price),
          smooth: true,
          symbol: "none",
          showSymbol: false,
          sampling: "lttb",
          showLegendSymbol: false,
          hoverAnimation: false,
          lineStyle: {
            normal: {
              width: 2,
            },
          },
          animationDuration: 0, // 初始动画持续时间
          animationEasing: "baunceIn", // 初始动画缓动函数
          // animationDurationUpdate: 500, // 更新动画持续时间
          // animationEasingUpdate: "linear", // 更新动画缓动函数
          animationDelayUpdate: 0, // 数据更新的动画延迟时间
          universalTransition: true,
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
                  color: "rgba(255, 176, 24, 0.1)",
                },
                {
                  offset: 1,
                  color: "rgba(255, 176, 24, 0)",
                },
              ],
              global: false,
            },
          },
        },
      ];

      let xAxis = this.chartData.map((item: any) => {
        return item.localDateTime;
      });

      const lineChart = {
        color: ["#FFB018"],
        xAxis: {
          type: "category",
          data: xAxis,
          boundaryGap: [false, 20],
          axisTick: {
            show: true,
            inside: true,
          },
          axisLine: {
            lineStyle: {
              color: "#b0b5c5",
            },
          },
          axisLabel: {
            color: "#b0b5c5",
            formatter: function (value: string, index: any) {
              const date = new Date(value);
              return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            },
          },
          axisPointer: {
            show: true,
            color: "#393E51",
            label: {
              formatter: function (params: any) {
                return timeForStr(params.value, "MM/dd HH:mm:ss");
              },
              backgroundColor: "#303545",
            },
          },
        },
        grid: {
          left: 0,
          right: 10,
          bottom: 10,
          top: 10,
          containLabel: true,
        },
        yAxis: {
          position: "right",
          min: function (value: any) {
            return accurateDecimal(value.min - 20, 2, true);
          },
          max: function (value: any) {
            return accurateDecimal(value.max + 20, 2, true);
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: "#D4E2F1",
            },
          },
          axisLabel: {
            color: "#b0b5c5",
            formatter: function (value: string) {
              return Number(value).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              });
            },
          },
          axisPointer: {
            show: true,
            color: "#393E51",
            label: {
              backgroundColor: "#303545",
            },
          },
          splitLine: {
            lineStyle: { color: "rgba(255,255,255,0.1)" },
          }, //网格线配置
          splitArea: { show: false }, //去掉网格颜色
        },
        dataZoom: [] as any[],
        series: series,
      };

      if (this.chartData.length > 1000) {
        lineChart.dataZoom = [
          {
            type: "inside",
            filterMode: "weakFilter",
            start: 98,
            end: 100,
            minSpan: 2,
            maxSpan: 20,
          },
        ];
      }

      this.chart.setOption(lineChart, true);
      this.isInit = true;
      this.chart.hideLoading();
    },
    setTooltip(evnet: orderInfo) {
      const lastPoint = this.chartData[this.chartData.length - 1];

      // 获取最后一个点的 x 轴和 y 轴坐标
      // const x = this.chart.convertToPixel("grid", [
      //   lastPoint.localDateTime,
      //   lastPoint.price,
      // ])[0];

      const y = this.chart.convertToPixel("grid", [
        lastPoint.localDateTime,
        lastPoint.price,
      ])[1];

      // 定义图形组件的配置项，模拟给定的 HTML 结构
      var customTooltip = {
        type: "group",
        left: 220, // x 位置调整
        top: y, // 向上偏移一点
        zindex: 10,
        children: [
          // 背景色矩形
          {
            type: "rect",
            left: -4,
            top: -4,
            shape: {
              width: 84,
              height: 48,
            },
            style: {
              fill: "rgba(51, 56, 73,1)", // 设置背景色
              lineJoin: "round",
            },
          },
          // 第一部分：用户信息和图标
          {
            type: "group",
            left: 0,
            top: 0,
            children: [
              // 用户图标
              {
                type: "image",
                style: {
                  image:
                    this.levelImages[
                      evnet.level as keyof typeof this.levelImages
                    ],
                  x: 0,
                  y: 0,
                  width: 16,
                  height: 16,
                },
              },
              // 用户名
              {
                type: "text",
                style: {
                  text: evnet.userName,
                  fill: "#fff",
                  x: 20,
                  y: 4,
                  fontSize: 10,
                },
              },
              // 图标
              {
                type: "image",
                style: {
                  image: evnet.side == "sell" ? drop : up,
                  x: 64,
                  y: 2,
                  width: 8,
                  height: 10,
                  opacity: 1, // 单独设置元素的不透明度
                },
              },
            ],
          },
          // 第二部分：P&L（盈亏）信息
          {
            type: "group",
            left: 0,
            top: 20,
            children: [
              {
                type: "text",
                style: {
                  text: "P&L",
                  fill: "#fff",
                  x: 0,
                  y: 0,
                  width: 22,
                  fontSize: 10,
                },
              },
              {
                type: "text",
                style: {
                  text: `${evnet.income > 0 ? "+" : "-"}$${accurateDecimal(
                    evnet.income,
                    2
                  )}`,
                  fill: evnet.income > 0 ? "#72f238" : "#ff4949",
                  x: 24,
                  y: 0,
                  fontSize: 10,
                },
              },
            ],
          },
          // 第三部分：ROI（投资回报率）信息
          {
            type: "group",
            left: 0,
            top: 32,
            children: [
              {
                type: "text",
                style: {
                  text: "ROI",
                  fill: "#fff",
                  x: 0,
                  y: 0,
                  width: 22,
                  fontSize: 10,
                },
              },
              {
                type: "text",
                style: {
                  text: `${new bigNumber(evnet.roi)
                    .multipliedBy(100)
                    .toNumber()}%`,
                  fill: evnet.income > 0 ? "#72f238" : "#ff4949",
                  x: 24,
                  y: 0,
                  fontSize: 10,
                },
              },
            ],
          },
        ],
      };

      return customTooltip;
    },
    /**
     * 更新图表数据
     * @param newV 数据
     */
    setOptions() {
      const currentTime = Date.now();
      const timeDifference = currentTime - this.lastUpdateTime;
      this.lastUpdateTime = currentTime;
      const animationDurationUpdate = Math.max(timeDifference, 500); // 动态设置动画持续时间
      // console.log(animationDurationUpdate);

      let tipData = null as any;
      if (this.sellData.length > 0) {
        tipData = this.setTooltip(
          this.sellData[this.sellData.length - 1] as any
        );
      }

      this.chart.setOption({
        graphic: [tipData],
        series: [
          {
            data: this.chartData.map(function (item: any) {
              return item.price;
            }),
            markLine: {
              animation: false,
              symbol: "none", // 标记线两端的标记类型
              lineStyle: {
                color: this.isDrop ? "#ff4949" : "#72f238",
              },
              data: [
                {
                  name: this.markNum,
                  yAxis: this.markNum,
                },
              ],
              label: {
                height: 20,
                lineHeight: 1,
                formatter: this.markNum,
                backgroundColor: this.isDrop ? "#ff4949" : "#72f238",
                borderRadius: 2,
                padding: [0, 4, 0, 4],
              },
            },
          },
        ],
        animationDurationUpdate: animationDurationUpdate,
        animationEasingUpdate: "baunceIn",
        xAxis: {
          data: this.chartData.map((item: any) => {
            return item.localDateTime;
          }),
        },
      });
    },
  },
};
</script>
