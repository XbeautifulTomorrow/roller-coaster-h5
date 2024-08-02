<template>
  <div class="mine_wrapper">
    <div class="user_info">
      <div class="user_level">
        <v-img
          :width="80"
          :src="levelImages[userInfo.level as keyof typeof levelImages]"
        ></v-img>
      </div>
      <div class="nick_name">{{ userInfo.userName }}</div>
      <div class="user_name"></div>
    </div>
    <div class="level_box">
      <v-slider
        v-model="currentExp"
        :min="1"
        :max="levelData.upgradeAmount"
        :step="1"
        hide-details="auto"
        thumb-size="0"
        thumb-color="#fff"
        track-size="8"
        readonly
        track-fill-color="#e5a480"
      ></v-slider>
      <div class="level_panel">
        <div class="level_info">
          <div class="current_level">{{ levelData.name }}</div>
          <div class="level_exp">
            <div class="level_label">Next Level：</div>
            <div class="exp_info">
              <span class="current_exp">
                {{ Number(currentExp).toLocaleString() }}
              </span>
              <span class="interval">/</span>
              <span class="limit_exp">
                {{ Number(levelData.upgradeAmount).toLocaleString() }}
              </span>
              <v-img
                :width="12"
                v-if="levelData.level < 16"
                cover
                src="@/assets/images/game/icon_rcp.png"
              ></v-img>
              <v-img
                :width="12"
                v-else
                cover
                src="@/assets/images/game/icon_roller.png"
              ></v-img>
            </div>
          </div>
        </div>
        <div class="level_other">
          <div class="other_item">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/main/icon_award.svg"
            ></v-img>
            <span>
              {{
                `Rewards: ${Number(levelData.rewardAmount).toLocaleString()} ${
                  levelData.coinName
                }`
              }}
            </span>
          </div>
          <div class="other_item">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/main/new_level.svg"
            ></v-img>
            <span>New Level: </span>
            <div class="new_level">
              <v-img
                :width="16"
                cover
                :src="levelImages[levelData.nextLevel as keyof typeof levelImages]"
              ></v-img>
              <span>{{ levelData.nextLevelName }}</span>
            </div>
          </div>
          <div class="other_item">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/main/new_level.svg"
            ></v-img>
            <span>
              {{
                `Max PRC Entry: ${Number(
                  levelData.rcpMaxAmount
                ).toLocaleString()}`
              }}
            </span>
            <v-img
              :width="16"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
          </div>
          <div class="other_item">
            <v-img
              :width="24"
              cover
              src="@/assets/images/svg/main/new_level.svg"
            ></v-img>
            <span>
              {{
                `Max PRT Entry: ${Number(
                  levelData.rctMaxAmount
                ).toLocaleString()}`
              }}
            </span>
            <v-img
              :width="16"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
          </div>
        </div>
      </div>
    </div>
    <div class="wallet_panel">
      <div class="wallet_title">Wallet</div>
      <div class="wallet_operating">
        <div class="operating_item">
          <div class="coin_box">
            <v-img
              :width="20"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
            <span class="coin_name">$RCP</span>
          </div>
          <div class="amount">
            {{ Number(userInfo.rcpAmount).toLocaleString() }}
          </div>
          <div class="btn" @click="toRecharge()">
            <v-img
              :width="16"
              cover
              src="@/assets/images/svg/main/icon_shop.svg"
            ></v-img>
            <span>BUY</span>
          </div>
        </div>
        <div class="operating_item">
          <div class="coin_box">
            <v-img
              :width="16"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
            <span class="coin_name">$ROLLER</span>
          </div>
          <div class="amount">
            {{ Number(userInfo.rctAmount).toLocaleString() }}
          </div>
          <div class="btn" @click="handleSend()">
            <v-img
              :width="14"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
            <span>TIP</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wallet_buttons">
      <div class="button swap" @click="toSwap()">SWAP</div>
      <div class="button withdraw">
        <span>WITHDRAW</span>
        <span class="soon">Soon</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import bigNumber from "bignumber.js";

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

import { getLevelDetails } from "@/services/api/user.js";

interface levelInfo {
  id: number; //等级ID
  level: number; //等级
  name: string; //等级名称
  rcpAmount: number; //RCP经验数量
  rctAmount: number; //RCT经验数量
  coinName: string; //下一等级代币名称
  upgradeAmount: number; //下一等级升级所需数量
  rcpMaxAmount: number; //RCP限红
  rctMaxAmount: number; //RCT限红
  rewardAmount: number; //下一等级奖励数量
  nextLevelName: string; //下一等级名称
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      levelData: {} as levelInfo,
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
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    currentExp() {
      const {
        levelData: { rcpAmount, rctAmount, level },
      } = this;

      if (level < 16) {
        const expNum = new bigNumber(rctAmount)
          .multipliedBy(10000)
          .plus(rcpAmount);

        return Number(expNum);
      }

      return rctAmount;
    },
  },
  created() {
    this.fetchLevelDetails();
  },
  methods: {
    async fetchLevelDetails() {
      const res = await getLevelDetails({});
      if (res.code === 200) {
        this.levelData = res.data;
      }
    },
    toSwap() {
      this.$router.push("/swap");
    },
    toRecharge() {
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    handleSend() {
      const { setShowSend } = useUserStore();
      setShowSend(true);
    },
  },
});
</script>
<style lang="scss" scoped>
.user_info {
  padding-top: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;

  font-weight: 700;
  font-style: normal;
  font-size: 20px;
  color: #b0b5c5;

  .v-img {
    flex: none;
  }

  .nick_name {
    padding-top: 8px;
  }
}

.user_level {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  .v-img {
    flex: none;
  }
}

.level_box {
  margin-top: 16px;
}

.level_panel {
  margin: 0 8px;
  background-color: #2a2f40;
  padding: 4px 8px 16px;
  border-radius: 8px;
}

.level_info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #b0b5c5;

  .current_level {
    font-size: 12px;
    color: #dbe2e5;
    font-weight: bold;
  }
  .level_exp {
    display: flex;
    align-items: center;
  }
  .exp_info {
    display: flex;
    align-items: center;

    .v-img {
      margin-left: 4px;
      flex: none;
    }
  }
  .level_label {
    color: #b0b5c5;
  }

  .current_exp {
    color: #fff;
  }
}

.level_other {
  padding-top: 8px;
  & > .other_item + .other_item {
    margin-top: 4px;
  }

  .other_item {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 14px;
    color: #b0b5c5;

    .v-img {
      flex: none;
      margin: 0 4px;
    }

    .new_level {
      display: flex;
      align-items: center;
    }
  }
}

.wallet_panel {
  padding: 40px 8px 0;

  .wallet_title {
    font-weight: 700;
    font-style: normal;
    font-size: 20px;
    color: #b0b5c5;
    padding-bottom: 8px;
  }

  .wallet_operating {
    background-color: #2a2f40;
    border-radius: 10px;
    overflow: hidden;
  }
  .operating_item + .operating_item {
    border-top: 1px solid #444b62;
  }
  .operating_item {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;

    & > * {
      flex: 1;
    }

    .coin_box {
      display: flex;
      align-items: center;
      font-weight: 700;
      font-style: normal;
      font-size: 16px;
      color: #dbe2e5;

      .v-img {
        flex: none;
        margin-right: 8px;
      }
    }

    .amount {
      font-weight: 700;
      font-style: normal;
      font-size: 14px;
      color: #dbe2e5;
      padding: 0 8px;
    }

    .btn {
      max-width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;

      .v-img {
        flex: none;
        margin-right: 4px;
      }
    }
  }
}

.wallet_buttons {
  padding: 20px 8px 0;

  & > div + div {
    margin-top: 20px;
  }

  .button {
    padding: 10px 0;
    text-align: center;
    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    border-radius: 8px;

    &.swap {
      background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
      color: #000;
    }

    &.withdraw {
      position: relative;
      background-color: #a4a4a4;
      color: #dbdbdb;

      .soon {
        position: absolute;
        top: -10px;
        right: -4px;
        padding: 2px 8px;
        font-size: 14px;
        font-weight: normal;
        color: #000;
        background-color: rgba(247, 218, 25, 1);
        border-radius: 20px;
      }
    }
  }
}
</style>