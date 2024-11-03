<template>
  <v-dialog v-model="show" width="auto">
    <div class="dialog_box">
      <v-img :width="160" cover src="@/assets/images/earn/gift.png"></v-img>
      <div class="reward_text">
        <span>Oops. $RCP is running out, get 2,000 $RCP for free!</span>
      </div>
      <div class="bonus_box">
        <v-img
          :width="36"
          cover
          src="@/assets/images/game/icon_rcp.png"
        ></v-img>
        <span>+ 2,000</span>
      </div>
      <v-btn height="36px" class="advertise_btn" @click="toAdController()">
        <div class="advertise_text">
          <v-img
            :width="24"
            cover
            src="@/assets/images/svg/game/icon_advertise.svg"
          ></v-img>
          <span>GET FREE $RCP</span>
        </div>
      </v-btn>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getAdvertiseReward } from "@/services/api/task";

interface showPromiseResult {
  done: boolean; // true if user watch till the end, otherwise false
  description: string; // event description
  state: "load" | "render" | "playing" | "destroy"; // banner state
  error: boolean; // true if event was emitted due to error, otherwise false
}

export default defineComponent({
  props: {
    showAdvertise: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  created() {
    this.show = this.showAdvertise;
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
    },
    toAdController() {
      // 看广告
      const AdController = (window as any).Adsgram.init({
        blockId: "4688",
      });

      // 显示广告横幅
      AdController.show()
        .then(async (result: showPromiseResult) => {
          // user watch ad till the end
          if (result.done) {
            this.handleReward(true);
          }
          // your code to reward user
        })
        .catch((result: showPromiseResult) => {
          // user skipped video or get error during playing ad
          console.log(result);
          // do nothing or whatever you want
          this.handleReward(false);
        });
    },
    // 领取奖励（如果看完广告
    async handleReward(isAd: boolean) {
      const res = await getAdvertiseReward({ isWatchAd: isAd });
      if (res.code === 200) {
        // 好像不用做啥
      }

      this.$emit("showTask", false);
    },
  },
  watch: {
    show(val) {
      if (val) return;
      this.$emit("showTask", false);
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

.bonus_box {
  display: flex;
  align-items: center;
  padding: 16px 0;
  font-size: 32px;
  font-weight: bold;
  color: #fbb11b;

  .v-img {
    flex: none;
    margin-right: 8px;
  }
}

.advertise_btn {
  padding: 0 24px;
  border-radius: 6px;
  background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
  color: #000;
  font-weight: 700;
  font-size: 20px;
}

.advertise_text {
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0;
  text-transform: none;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}
</style>