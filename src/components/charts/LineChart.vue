<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script lang="ts">
import * as echarts from "echarts";
import "echarts/theme/macarons"; // echarts theme
import { accurateDecimal, timeForStr } from "@/utils";
import { useGameStore } from "@/store/game";

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
      default: "300px",
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
      this.chart = echarts.init(this.$el);
    },
    /**
     * 初始化图表配置
     * @param xAxis 横坐标
     * @param series 折线图数据
     */
    initOptions() {
      this.chart.clear();
      this.chart.showLoading();

      let series = [];
      series.push({
        type: "line",
        data: this.chartData.map(function (item: any) {
          return item.price;
        }),
        smooth: true,
        symbol: "none",
        showSymbol: false,
        sampling: "lttb",
        showLegendSymbol: false,
        animationDuration: 100,
        animationEasing: "quadraticInOut",
        animationDurationUpdate: 500,
        animationEasingUpdate: "quadraticInOut",
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
                color: "rgba(255, 176, 24, 0.1)", // 0% 处的颜色
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
      });

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
              color: "#D4E2F1",
            },
          },
          axisLabel: {
            color: "#c4bfbd",
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
            return accurateDecimal(value.min - 5, 2);
          },
          max: function (value: any) {
            return accurateDecimal(value.max + 5, 2);
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
            color: "#c4bfbd",
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
    /**
     * 更新图表数据
     * @param newV 数据
     */
    setOptions() {
      this.chart.setOption(
        {
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
          xAxis: {
            data: this.chartData.map((item: any) => {
              return item.localDateTime;
            }),
          },
        },
        false,
        true
      );
    },
  },
};
</script>
