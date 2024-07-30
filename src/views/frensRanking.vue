<template>
  <div class="frens_ranking_wrapper">
    <div class="frens_ranking_base">
      <v-img
        :width="60"
        cover
        src="@/assets/images/svg/earn/invite.svg"
      ></v-img>
      <div class="title">Party Kings</div>
      <div class="description">Invite more frens to get here</div>
      <div class="invite_btns">
        <v-btn
          class="invite_btn"
          color="#49B6F6"
          height="32"
          width="220"
          @click="inviteToTelegram()"
          variant="flat"
          size="small"
        >
          <v-img
            :width="24"
            style="margin-right: 4px"
            cover
            src="@/assets/images/svg/frens/linvite_user.svg"
          ></v-img>
          <span style="font-size: 20px; text-transform: capitalize; color: #000"
            >Invite Friend</span
          >
        </v-btn>
        <v-btn
          style="margin-left: 12px"
          class="invite_btn"
          color="#49B6F6"
          height="32"
          @click="copyInvite()"
          variant="flat"
          size="small"
        >
          <v-icon icon="mdi-content-copy" size="20" color="#000"></v-icon>
        </v-btn>
      </div>
    </div>
    <div class="ranking_list">
      <div
        class="ranking_list_item"
        v-for="(item, index) in frensRankingList"
        :key="index"
      >
        <div class="ranking_num">
          <v-img
            :width="36"
            v-if="index == 0"
            src="@/assets/images/svg/game/leaderboard_0.svg"
          ></v-img>
          <v-img
            :width="36"
            v-else-if="index == 1"
            src="@/assets/images/svg/game/leaderboard_1.svg"
          ></v-img>
          <v-img
            :width="36"
            v-else-if="index == 2"
            src="@/assets/images/svg/game/leaderboard_2.svg"
          ></v-img>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="user_info">
          <div class="user_level">
            <v-img
              :width="40"
              :src="levelImages[item.level as keyof typeof levelImages]"
            ></v-img>
          </div>
          <div class="user_box">
            <div class="user_name">{{ item.userName }}</div>
            <div class="frens_relevant">
              <div class="frens_num">{{ `${item.totalNumber} Frens` }}</div>
              <div class="frens_prize">
                <span>{{
                  `+ ${Number(item.rcpAmount).toLocaleString()}`
                }}</span>
                <v-img
                  :width="16"
                  cover
                  src="@/assets/images/game/icon_rcp.png"
                ></v-img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { shareOnTelegram, onCopy } from "@/utils";
import { getInviteRankingList } from "@/services/api/user.js";

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

interface frensRankingInfo {
  userId: number; //用户ID
  userName: string | any; //用户名
  avatar: string | any; //头像
  totalNumber: number; //总邀请用户数
  rcpAmount: number; //rcp数量
  [x: string]: string | number | any;
}

export default defineComponent({
  data() {
    return {
      frensRankingTotal: 0,
      frensRankingList: [] as Array<frensRankingInfo>,
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
      page: 1,
      size: 10,
      finished: false,
    };
  },
  computed: {
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  created() {
    this.fetchInviteUserList();
  },
  methods: {
    // 获取邀请用户列表
    async fetchInviteUserList(type = 1, isSearch = true) {
      let _page = this.page;
      if (isSearch) {
        this.finished = false;
        this.page = 1;
        _page = 1;
      }

      const res = await getInviteRankingList({
        page: _page,
        size: this.size,
      });
      if (res.code == 200) {
        this.frensRankingTotal = res.data.total;

        if (
          res.data.current >= res.data.pages &&
          this.page * this.size >= 300
        ) {
          this.finished = true;
        }

        if (type == 1) {
          this.frensRankingList = res.data.records;
        } else {
          this.frensRankingList.push.apply(
            this.frensRankingList,
            res.data.records
          );
        }

        this.$nextTick(() => {
          (window as any).LetterAvatar.transform();
        });
      }
    },
    // 加载更多
    nextQuery() {
      this.page++;
      this.fetchInviteUserList(2, false);
    },
    // 邀请
    inviteToTelegram() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`;
      }
      shareOnTelegram(inviteUrl);
    },
    // 复制链接
    copyInvite() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theGMCoinBot/GMCoin?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/gm_coin_test_bot/checking?startapp=${inviteCode}`;
      }
      onCopy(inviteUrl);
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener("scroll", function () {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    });
  },
});
</script>
<style lang="scss" scoped>
.frens_ranking_wrapper {
  padding: 8px;
}

.frens_ranking_base {
  display: flex;
  align-items: center;
  flex-direction: column;

  .title {
    font-weight: bold;
    color: #fdefd6;
    font-size: 24px;
  }

  .description {
    color: #fdefd6;
    font-size: 18px;
  }

  .invite_btns {
    padding-top: 4px;
  }

  .invite_btn {
    background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
    color: #000;
  }
}

.ranking_list {
  padding-top: 16px;

  & > .ranking_list_item + .ranking_list_item {
    margin-top: 8px;
  }
}

.ranking_list_item {
  background-color: rgba(249, 249, 249, 0.25);
  border-radius: 16px;
  padding: 8px;
  display: flex;
  align-items: center;

  .ranking_num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-right: 8px;

    font-weight: bold;
    font-style: normal;
    font-size: 20px;
    color: #fdefd6;

    .v-img {
      flex: none;
    }
  }

  .user_info {
    flex: 1;
    display: flex;
    align-items: center;

    & > .v-img {
      flex: none;
      margin-right: 8px;
    }
  }

  .user_box {
    flex: 1;
  }

  .user_name {
    font-weight: bold;
    font-size: 18px;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .frens_relevant {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .frens_num {
      font-size: 16px;
      color: #fdefd6;
    }

    .frens_prize {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: bold;
      color: #fbb11b;

      .v-img {
        margin-left: 4px;
      }
    }
  }
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}

.user_level {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;

  .v-img {
    flex: none;
  }
}
</style>