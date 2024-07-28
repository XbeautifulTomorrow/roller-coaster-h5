// 折线配置
const setLineData = () => {
  let series = [];
  series.push({
    type: "line",
    data: this.chartData.map(function (item) {
      return item.price;
    }),
    smooth: true,
    sampling: "lttb",
    symbol: "none",
    showSymbol: false,
    showLegendSymbol: false,
    animationDurationUpdate: 500, // 数据更新的动画时长
    animationEasingUpdate: "cubicInOut", // 数据更新的缓动效果
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
      symbol: "none", // 标记线两端的标记类型
      lineStyle: {
        color: this.isDrop ? "#ff4949" : "#72f238",
      },
      data: [
        {
          name: this.chartData[this.chartData.length - 1].price,
          yAxis: this.chartData[this.chartData.length - 1].price,
        },
      ],
      label: {
        height: 20,
        lineHeight: 1,
        formatter: this.chartData[this.chartData.length - 1].price,
        backgroundColor: this.isDrop ? "#ff4949" : "#72f238",
        borderRadius: 2,
        padding: [0, 4, 0, 4],
      },
    },
  });

  let xAxis = this.chartData.map((item) => {
    return item.localDateTime;
  });

  this.setOptions(xAxis, series);
};
// K线配置
const setCandlestickData = () => {
  let series = [];
  series.push({
    type: "candlestick",
    data: this.chartData.map(function (item) {
      return [item.open, item.close, item.high, item.low];
    }),
    smooth: true,
    sampling: "lttb",
    symbol: "none",
    showSymbol: false,
    showLegendSymbol: false,
    animationDurationUpdate: 500, // 数据更新的动画时长
    animationEasingUpdate: "cubicInOut", // 数据更新的缓动效果
    animationDelayUpdate: 0, // 数据更新的动画延迟时间
    universalTransition: true,
    itemStyle: {
      color: "#C63E41",
      color0: "#5CBC34",
    },
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
      symbol: "none", // 标记线两端的标记类型
      lineStyle: {
        color: this.isDrop ? "#ff4949" : "#72f238",
      },
      data: [
        {
          name: this.chartData[this.chartData.length - 1].open,
          yAxis: this.chartData[this.chartData.length - 1].open,
        },
      ],
      label: {
        height: 20,
        lineHeight: 1,
        formatter: this.chartData[this.chartData.length - 1].open,
        backgroundColor: this.isDrop ? "#ff4949" : "#72f238",
        borderRadius: 2,
        padding: [0, 4, 0, 4],
      },
    },
  });

  let xAxis = this.chartData.map((item) => {
    return item.bucket;
  });

  this.setOptions(xAxis, series);
};

// 设置图表数据
const setOptions = (xAxis, series) => {
  this.lineChartData = {
    color: ["#FFB018"],
    xAxis: {
      type: "category",
      data: xAxis,
      boundaryGap: false,
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
        formatter: function (value, index) {
          const date = new Date(value);
          return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        },
      },
      axisPointer: {
        show: true,
        color: "#393E51",
        label: {
          formatter: function (params) {
            return timeForStr(params.value, "MM/dd HH:mm:ss");
          },
          backgroundColor: "#303545",
        },
      },
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 10,
      top: 10,
      containLabel: true,
    },
    yAxis: {
      position: "right",
      min: function (value) {
        return accurateDecimal(value.min, 2);
      },
      max: function (value) {
        return accurateDecimal(value.max, 2);
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
    dataZoom: [
      {
        type: "inside",
        filterMode: "filter",
        start: 98,
        end: 100,
      },
    ],
    series: series,
  };
};