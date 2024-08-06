<template>
  <v-dialog v-model="showRecharge" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="recharge_title">SHOP</div>
        <div class="close_btn" @click="showRecharge = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="title_text">
          <v-img
            :width="20"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <span>FREE $RCP</span>
        </div>
        <div class="product_items">
          <div
            class="product_item"
            v-for="(item, index) in productList"
            :key="index"
            @click="handleBuy(item)"
          >
            <div class="reward_box">
              {{ `${unitConversion(item.rcpAmount, 0, false)} $RCP  ` }}
            </div>
            <div class="amount_img">
              <v-img
                width="70"
                v-if="index == 0"
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_1.png"
              ></v-img>
              <v-img
                width="70"
                v-else-if="index == 1"
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_2.png"
              ></v-img>
              <v-img
                width="70"
                v-else-if="index == 2"
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_3.png"
              ></v-img>
              <v-img
                width="70"
                v-else-if="index == 3"
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_4.png"
              ></v-img>
              <v-img
                width="70"
                v-else-if="index == 4"
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_5.png"
              ></v-img>
              <v-img
                width="70"
                v-else
                class="reward_img"
                cover
                src="@/assets/images/recharge/token_6.png"
              ></v-img>
            </div>
            <div class="buy_info">
              <v-img
                width="70"
                cover
                src="@/assets/images/svg/btn_bg.svg"
              ></v-img>
              <div class="price_val">{{ `$${item.rctAmount / 100}` }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getProductList } from "@/services/api/user.js";
import { unitConversion } from "@/utils";

// 等级图标
import Level_1 from "@/assets/images/main/level_1.png";
import Level_2 from "@/assets/images/main/level_2.png";
import Level_3 from "@/assets/images/main/level_3.png";
import Level_4 from "@/assets/images/main/level_4.png";
import Level_5 from "@/assets/images/main/level_5.png";
import Level_6 from "@/assets/images/main/level_6.png";
import Level_7 from "@/assets/images/main/level_7.png";
import Level_8 from "@/assets/images/main/level_8.png";
import Level_9 from "@/assets/images/main/level_9.png";
import Level_10 from "@/assets/images/main/level_10.png";
import Level_11 from "@/assets/images/main/level_11.png";
import Level_12 from "@/assets/images/main/level_12.png";
import Level_13 from "@/assets/images/main/level_13.png";
import Level_14 from "@/assets/images/main/level_14.png";
import Level_15 from "@/assets/images/main/level_15.png";
import Level_16 from "@/assets/images/main/level_16.png";
import Level_17 from "@/assets/images/main/level_17.png";
import Level_18 from "@/assets/images/main/level_18.png";
import Level_19 from "@/assets/images/main/level_19.png";
import Level_20 from "@/assets/images/main/level_20.png";
import Level_21 from "@/assets/images/main/level_21.png";
import Level_22 from "@/assets/images/main/level_22.png";
import Level_23 from "@/assets/images/main/level_23.png";
import Level_24 from "@/assets/images/main/level_24.png";
import Level_25 from "@/assets/images/main/level_25.png";
import Level_26 from "@/assets/images/main/level_26.png";
import Level_27 from "@/assets/images/main/level_27.png";

interface productInfo {
  productId: number; //产品ID
  energyAmount: number; //能量数量
  gmcAmount: number; //GMC数量
  price: number; //产品价格
  priceCoin: string; //价格币种
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      productList: [] as Array<productInfo>,
      tonConnect: null as any,
      levelImages: {
        1: Level_1,
        2: Level_2,
        3: Level_3,
        4: Level_4,
        5: Level_5,
        6: Level_6,
        7: Level_7,
        8: Level_8,
        9: Level_9,
        10: Level_10,
        11: Level_11,
        12: Level_12,
        13: Level_13,
        14: Level_14,
        15: Level_15,
        16: Level_16,
        17: Level_17,
        18: Level_18,
        19: Level_19,
        20: Level_20,
        21: Level_21,
        22: Level_22,
        23: Level_23,
        24: Level_24,
        25: Level_25,
        26: Level_26,
        27: Level_27,
      },
    };
  },
  computed: {
    showRecharge: {
      get() {
        const { showRecharge } = useUserStore();
        return showRecharge;
      },
      set(val: boolean) {
        const { setShowRecharge } = useUserStore();
        setShowRecharge(val);
      },
    },
  },
  created() {
    this.fetchProductList();
  },
  methods: {
    unitConversion: unitConversion,
    handleReady() {
      this.showRecharge = false;
    },
    async fetchProductList() {
      const res = await getProductList({ page: 1, limit: 10 });
      if (res.code === 200) {
        this.productList = res.data.records;
      }
    },
    // 邀请
    toFrens() {
      this.handleReady();
      this.$router.push("/frens");
    },
    // 处理购买
    async handleBuy(event: productInfo) {
      const { setProductId } = useUserStore();

      // 打开确认弹窗
      setProductId(event.productId);
      this.handleReady();
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
}

.dialog_box {
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  text-align: center;
  font-size: 20px;
  line-height: 1.2;
}

.recharge_title {
  width: 60%;
  color: #fdefd6;
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(
    180deg,
    rgba(210, 70, 49, 1) -3%,
    rgba(212, 72, 52, 1) 100%
  );
  padding: 8px 24px;
  border-radius: 24px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  margin: 0 auto;
  margin-top: -30px;
}

.close_btn {
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, #f0d3b3 0%, #f2d0ac 100%);
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3),
    0px 5px 5px 0px rgba(255, 255, 255, 0.3) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -10px;
  right: 24px;

  .v-img {
    flex: none;
  }
}

.recharge_panel {
  width: 100%;
  margin-top: -16px;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(66, 20, 79, 1);
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 1);
  border-radius: 20px;
  padding: 16px;
}

.title_text {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    180deg,
    rgba(235, 170, 133, 1) 0%,
    rgba(191, 112, 118, 1) 100%
  );
  font-size: 14px;
  border-radius: 8px;
  padding: 8px 0;
  margin: 8px 0;
  text-shadow: 1px 1px 5px rgba(66, 20, 79, 1);
  box-shadow: 0px 5px 2px 0px rgba(230, 217, 217, 0.6) inset;

  .v-img {
    flex: none;
    margin-right: 4px;
  }
}

.product_items {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;

  & > .product_item + .product_item {
    margin-left: 12px;
  }

  & > .product_item:nth-child(2n + 1) {
    margin-left: 0;
  }

  & > .product_item:nth-child(n + 3) {
    margin-top: 8px;
  }
}

.product_item {
  max-width: 50%;
  min-width: 40%;
  flex: 1;
  background: linear-gradient(
    180deg,
    rgba(235, 170, 133, 1) 0%,
    rgba(191, 112, 118, 1) 100%
  );
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
  position: relative;
  padding: 12px 0;

  .v-img {
    flex: none;
  }

  .buy_info {
    margin-top: 8px;
    font-size: 16px;
    position: relative;

    .price_val {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-shadow: 1px 1px 5px rgba(197, 27, 24, 1);
      font-weight: bold;
      color: #ffedd6;
    }
  }

  .reward_box {
    font-size: 12px;
    font-weight: bold;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.9);
  }

  .amount_img {
    display: flex;
    align-items: flex-end;
    width: 70px;
    height: 80px;

    .v-img {
      flex: none;
    }
  }
}

.finished {
  text-transform: none;
  letter-spacing: 0;
}
</style>