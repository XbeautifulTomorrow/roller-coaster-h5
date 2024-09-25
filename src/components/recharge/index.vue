<template>
  <v-dialog v-model="showRecharge" width="100%">
    <div class="dialog_box">
      <div class="recharge_panel">
        <div class="recharge_title">SHOP</div>
        <div class="close_btn" @click="showRecharge = false">
          <v-img :width="16" cover src="@/assets/images/svg/icon_x.svg"></v-img>
        </div>
        <div class="recharge_tabs">
          <div
            :class="['recharge_tab', rechargeType == 0 ? 'active' : '']"
            @click="rechargeType = 0"
          >
            <v-img
              :width="50"
              cover
              src="@/assets/images/recharge/token_6.png"
            ></v-img>
            <div>$RCP</div>
          </div>
          <div
            :class="['recharge_tab', rechargeType == 1 ? 'active' : '']"
            @click="rechargeType = 1"
          >
            <v-img
              :width="50"
              cover
              src="@/assets/images/game/icon_usdt.png"
            ></v-img>
            <div>USDT</div>
          </div>
        </div>
        <div v-if="rechargeType == 0" class="title_text" @click="toEarn()">
          <v-img
            :width="20"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <span>FREE $RCP</span>
        </div>
        <div v-if="rechargeType == 0" class="product_items">
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
              <div class="price_val">{{ `$${item.price}` }}</div>
            </div>
          </div>
        </div>
        <buyTokens v-if="rechargeType == 1"></buyTokens>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getProductList } from "@/services/api/user.js";
import { unitConversion } from "@/utils";
import buyTokens from "@/components/recharge/buyTokens.vue";

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
      gmtJettons:
        "0:b113a994b5024a16719f69139328eb759596c38a25f59028b146fecdc3621dfe", // USDT
      tonConnect: null as any,
      rechargeType: 0,
    };
  },
  components: {
    buyTokens,
  },
  computed: {
    walletAddr() {
      const { walletAddr } = useUserStore();
      return walletAddr;
    },
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
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
    // 获取余额
    async fetchBalance() {
      const { walletAddr, gmtJettons } = this;

      let fetchUrl = `https://tonapi.io/v2/accounts/${encodeURIComponent(
        walletAddr
      )}`;

      fetchUrl += `/jettons/${encodeURIComponent(gmtJettons)}`;

      axios
        .get(fetchUrl)
        .then((res: any) => {
          if (res.status == 200) {
            const { wallet_address } = res.data;
            const { setJettonAddr } = useUserStore();
            setJettonAddr(wallet_address.address);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    async fetchProductList() {
      const res = await getProductList({ page: 1, limit: 10 });
      if (res.code === 200) {
        this.productList = res.data.records;
      }
    },
    // 任务
    toEarn() {
      this.handleReady();
      this.$router.push("/earn");
    },
    // 末尾补零
    formatZeroFill(event: any) {
      let str = "1";

      for (let i = 0; i < event; i++) {
        str += "0";
      }

      return str;
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
  max-width: max-content !important;
}

.dialog_box {
  width: 100vw;
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
  min-height: 500px;
  margin-top: -16px;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(66, 20, 79, 1);
  box-shadow: 0px 0px 4px rgba(21, 12, 7, 1);
  border-radius: 20px;
  padding: 16px;
}

.recharge_tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0 0px;

  .recharge_tab + .recharge_tab {
    margin-left: 8px;
  }

  .recharge_tab {
    flex: 1;
    height: 78px;
    background-color: rgba(137, 104, 85, 1);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    border-radius: 4px;
    font-weight: 700;
    font-size: 14px;
    color: #b9b9b9;

    &.active {
      background: linear-gradient(
        180deg,
        rgba(255, 200, 26, 1) 58%,
        rgba(255, 231, 26, 1) 97%,
        rgba(217, 163, 21, 1) 133%
      );
      color: #000;
    }

    .v-img {
      flex: none;
    }
  }
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
  border-radius: 8px;
  padding: 8px 0;
  margin: 8px 0;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.9);
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
  max-height: 400px;
  overflow-y: scroll;

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
    font-size: 16px;
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