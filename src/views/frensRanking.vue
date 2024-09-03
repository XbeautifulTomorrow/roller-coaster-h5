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
                <span>{{ `+ ${formatIncome(item.rcpAmount, "RCP")}` }}</span>
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
import {
  shareOnTelegram,
  onCopy,
  unitConversion,
  accurateDecimal,
} from "@/utils";

import { getInviteRankingList } from "@/services/api/user.js";

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
      page: 1,
      size: 10,
      finished: false,
      timer: null as any,
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

        if (res.data.current >= res.data.pages) {
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
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.page++;
        this.fetchInviteUserList(2, false);
      }, 300);
    },
    // 邀请
    inviteToTelegram() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theRollerCoasterBot/RollerCoaster?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/test1gscbot/test1gsc?startapp=${inviteCode}`;
      }
      shareOnTelegram(inviteUrl);
    },
    // 复制链接
    copyInvite() {
      const { inviteCode } = this.userInfo;
      let inviteUrl = "";
      if (import.meta.env.MODE == "prod") {
        inviteUrl = `https://t.me/theRollerCoasterBot/RollerCoaster?startapp=${inviteCode}`;
      } else {
        inviteUrl = `https://t.me/test1gscbot/test1gsc?startapp=${inviteCode}`;
      }
      onCopy(inviteUrl);
    },
    // 格式化收益
    formatIncome(income: number, type: string) {
      if (type == "RCT") {
        return unitConversion(accurateDecimal(income, 2, true) || 0);
      } else {
        if (Math.abs(income || 0) < 1000) {
          return Math.floor(income);
        } else {
          return unitConversion(Math.floor(income) || 0);
        }
      }
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener("scroll", function () {
      if (
        window.innerHeight + window.scrollY + 10 >=
        document.body.offsetHeight
      ) {
        if (!_this.finished) {
          _this.nextQuery();
        }
      }
    });
  },
  beforeUnmount() {
    window.removeEventListener("scroll", () => {});
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