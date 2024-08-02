<template>
  <div>
    <v-app-bar
      elevation="2"
      style="padding: 0 8px"
      app
      fixed
      dark
      color="#1f212e"
      density="compact"
    >
      <template v-slot:prepend>
        <div class="back" v-if="!isTab" @click="goBack()">
          <v-img :width="30" cover src="@/assets/images/svg/back.svg"></v-img>
        </div>
        <div class="energy_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <div class="energy_item rcp">
            <div class="energy_val">
              {{ Number(userInfo?.rcpAmount || 0).toLocaleString() }}
            </div>
            <div class="plus_btn" @click="toRecharge()">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
        <div class="energy_box">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_roller.png"
          ></v-img>
          <div class="energy_item rct">
            <div class="energy_val">
              {{ Number(userInfo?.rctAmount || 0).toLocaleString() }}
            </div>
            <div class="plus_btn" @click="toSwap()">
              <v-icon color="#000" size="20" icon="mdi-plus"></v-icon>
            </div>
          </div>
        </div>
      </template>
      <template v-slot:append>
        <div class="user_info">
          <div class="user_level">
            <v-img
              :width="24"
              :src="levelImages[userInfo.level as keyof typeof levelImages]"
            ></v-img>
          </div>
          <div class="user_name">{{ userInfo.userName }}</div>
        </div>
      </template>
    </v-app-bar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useUserStore } from "@/store/user.js";
import { getUserInfo } from "@/services/api/user";

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

export default defineComponent({
  data() {
    return {
      showMenu: false,
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
      isTab: true,
      NavList: ["/", "/earn", "/frens", "/wallet"],
    };
  },
  created() {
    if (this.isLogin) {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
    }
  },
  computed: {
    isLogin() {
      const { isLogin } = useUserStore();
      return isLogin;
    },
    userInfo() {
      const { userInfo } = useUserStore();
      return userInfo;
    },
  },
  methods: {
    getUserInfo: getUserInfo,

    goBack() {
      this.$router.go(-1); // 返回上一页
    },
    toMain() {
      this.$router.push("/activity");
    },
    toRecharge() {
      const { setShowRecharge } = useUserStore();
      setShowRecharge(true);
    },
    toSwap() {
      this.$router.push("/swap");
    },
  },
  watch: {
    isLogin(val) {
      if (val) {
        const userStore = useUserStore();
        userStore.fetchUserInfo();
      }
    },
    "$route.path"(val) {
      const userStore = useUserStore();
      userStore.fetchUserInfo();
      this.isTab = this.NavList.includes(val);
    },
  },
});
</script>
<style lang="scss" scoped>
.back {
  margin-right: 8px;
}

.energy_box {
  display: flex;
  align-items: center;
  background-color: #000;
  border-radius: 30px;
  margin-right: 8px;

  .energy_item {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #fff;

    &.rcp {
      min-width: 120px;
    }
    &.rct {
      min-width: 80px;
    }
    .energy_val {
      font-size: 12px;
      font-weight: bold;
      padding: 0 4px;
    }
  }

  .plus_btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(#ffc81a 0%, #ffe71a 3%, #d9a315 100%);
    border: 1px solid #000;
    border-radius: 4px;
  }
}

.avatar {
  border: 4px solid #ffad2e;
  border-radius: 50%;
}

.user_info {
  display: flex;
  align-items: center;

  .user_name {
    width: 30px;
    font-size: 12px;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.user_level {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2px;

  .v-img {
    flex: none;
  }
}
</style>