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
      <div class="user_Id">
        <span>{{ `ID:${userInfo.tgId}` }}</span>
        <div class="copy_btn" @click="copyLink()">
          <v-icon icon="mdi-content-copy" size="16" color="#b0b5c5"></v-icon>
        </div>
      </div>
    </div>
    <div class="level_box">
      <div class="level_slider">
        <div class="level_slider_bg"></div>
        <v-slider
          v-if="!upLoading"
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
      </div>
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
                v-if="levelData.coinName == 'RCP'"
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
                `Rewards: ${Number(levelData.rewardAmount).toLocaleString()}`
              }}
            </span>
            <v-img
              :width="16"
              v-if="levelData.coinName == 'RCP'"
              cover
              src="@/assets/images/game/icon_rcp.png"
            ></v-img>
            <v-img
              :width="16"
              v-else
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
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
                `Max $RCP Entry: ${Number(
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
                `Max $RCT Entry: ${Number(
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
    <v-btn
      color="'rgb(0,0,0,0)'"
      class="complete_btn"
      :loading="upLoading"
      height="40"
      density="compact"
      @click.stop="levelUp()"
      variant="text"
      :disabled="!userInfo.isUpgrade"
    >
      <div class="finished">
        <v-img
          :width="24"
          cover
          src="@/assets/images/svg/main/icon_award.svg"
        ></v-img>
        <span>Level Up</span>
        <div class="dot" v-if="userInfo.isUpgrade"></div>
      </div>
    </v-btn>
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
              :width="20"
              cover
              src="@/assets/images/game/icon_roller.png"
            ></v-img>
            <span class="coin_name">$RCT</span>
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
import { onCopy } from "@/utils";

import { getLevelDetails, levelUpgrade } from "@/services/api/user.js";

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
      upLoading: false,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
    levelImages() {
      const { levelImages } = useUserStore();
      return levelImages;
    },
    currentExp() {
      const {
        levelData: { rcpAmount, rctAmount, level },
      } = this;

      if (level < 15) {
        return rcpAmount;
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
    async levelUp() {
      this.upLoading = true;
      const res = await levelUpgrade({});

      this.upLoading = false;

      if (res.code == 200) {
        this.levelData.rcpAmount = 0;
        this.levelData.rctAmount = 0;
        setTimeout(() => {
          const userStore = useUserStore();
          userStore.fetchUserInfo();
          this.fetchLevelDetails();
        }, 100);
      }
    },
    toSwap() {
      this.$router.push("/swap");
    },
    toRecharge() {
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    copyLink() {
      const {
        userInfo: { tgId },
      } = this;

      onCopy(`${tgId}`);
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

  .user_Id {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 400;
    color: #8c8f9b;

    .v-img {
      flex: none;
      margin-left: 8px;
    }

    .copy_btn {
      padding: 0px 4px;
      color: #b0b5c5;
      margin-left: 4px;
    }
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

  .level_slider {
    width: 100%;
    height: 32px;
    position: relative;

    .level_slider_bg {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      height: 8px;
      width: calc(100% - 16px);
      margin: 0 8px;
      border-radius: 4px;
      background-color: #424242;
      box-sizing: border-box;
    }
  }
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

.complete_btn {
  min-width: 60%;
  background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
  border: 1px solid #000;
  border-radius: 4px;
  display: block;
  margin: 0 auto;
  margin-top: 16px;
}

.finished {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: none;
  letter-spacing: 0;
  font-size: 16px;
  font-weight: bold;
  position: relative;

  .v-img {
    flex: none;
    margin-right: 4px;
  }

  .dot {
    position: absolute;
    top: -4px;
    right: -12px;
    width: 10px;
    height: 10px;
    background-color: red;
    border: 2px solid #fff;
    border-radius: 50%;
    box-sizing: border-box;
  }
}

.v-btn--disabled {
  pointer-events: none;
  opacity: 1;
  background: #a4a4a4;
  color: #dbdbdb;

  .finished {
    filter: grayscale(100%);
  }
}
</style>