<template>
  <v-dialog v-model="show" width="auto">
    <div class="dialog_box">
      <v-img :width="300" cover src="@/assets/images/earn/congrats.png"></v-img>
      <div class="reward_text">
        <span>You get a huge bonus. Watch Ads to double the reward.</span>
      </div>
      <div class="reward_btns" @click="handleReady()">
        <div class="btn">
          <span>
            {{ `Claim ${Number(doubleInfo.income).toLocaleString()}` }}
          </span>
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
        </div>
        <div class="btn ad" @click="toAdController()">
          <v-img
            :width="24"
            class="ad_icon"
            cover
            src="@/assets/images/svg/earn/icon_ad.svg"
          ></v-img>
          <span>
            {{ `Claim ${Number(doubleInfo.income * 2).toLocaleString()}` }}
          </span>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getdoubleBenefit } from "@/services/api/order";

interface showPromiseResult {
  done: boolean; // true if user watch till the end, otherwise false
  description: string; // event description
  state: "load" | "render" | "playing" | "destroy"; // banner state
  error: boolean; // true if event was emitted due to error, otherwise false
}

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

export default defineComponent({
  props: {
    showDouble: {
      type: Boolean,
      default: false,
    },
    doubleInfo: {
      type: Object,
      default: {} as orderInfo,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  created() {
    this.show = this.showDouble;
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    handleReady() {
      this.show = false;
      this.$emit("showDouble", false);
    },
    toAdController() {
      // 看广告
      const AdController = (window as any).Adsgram.init({
        blockId: "4689",
      });

      // 显示广告横幅
      AdController.show()
        .then(async (result: showPromiseResult) => {
          // user watch ad till the end
          if (result.done) {
            this.handleDouble(true);
          }
          // your code to reward user
        })
        .catch((result: showPromiseResult) => {
          // user skipped video or get error during playing ad
          console.log(result);
          // do nothing or whatever you want
          this.handleDouble(false);
        });
    },
    // 领取双倍奖励（如果看完广告
    async handleDouble(isAd: boolean) {
      const res = await getdoubleBenefit({
        isWatchAd: isAd,
        carOrderId: this.doubleInfo.id,
      });

      if (res.code === 200) {
        // 更新余额
        const user = useUserStore();
        user.fetchUserInfo();
      }

      this.$emit("showDouble", false);
    },
  },
  watch: {
    show(val) {
      if (val) return;
      this.$emit("showDouble", false);
    },
  },
});
</script>
<style lang="scss" scoped>
.dialog_box {
  width: 100%;
  background-color: #000;
  border-radius: 16px;
  padding: 24px 16px 16px;
  color: #fff;
  font-size: 20px;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward_text {
  padding: 16px 0 0;
  font-weight: 700;
  font-size: 16px;
  color: #b0b5c5;
  text-align: center;
}

.reward_btns {
  width: 100%;
  padding-top: 16px;
  & > .btn + .btn {
    margin-top: 8px;
  }

  .btn {
    margin: 0 auto;
    width: 90%;
    border-radius: 10px;
    border: 2px solid #c9c9c9;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    font-size: 20px;
    font-weight: bold;
    position: relative;
    cursor: pointer;

    .v-img {
      flex: none;
      margin-left: 4px;
    }

    &.ad {
      border-color: #f1bb01;
      color: #f1bb01;
    }

    .ad_icon {
      position: absolute;
      left: 8px;
    }
  }
}
</style>