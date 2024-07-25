<template>
  <div class="nav_wrapper">
    <v-bottom-navigation
      app
      fixed
      grow
      v-model="activeItem"
      bg-color="#000"
      :active="activeNav"
      rounded="lg"
      class="nav_panel"
    >
      <v-btn
        value="play"
        :to="{ path: '/' }"
        density="compact"
        slim
        min-width="0"
      >
        <v-img
          :width="30"
          :class="['nav_img', activeItem == 'play' && 'active']"
          cover
          src="@/assets/images/svg/tabr/play.svg"
        ></v-img>
        <span :class="['btn_text', activeItem == 'play' && 'active']"
          >Play</span
        >
      </v-btn>
      <v-btn
        value="earn"
        :to="{ name: 'Earn' }"
        density="compact"
        slim
        min-width="0"
      >
        <v-img
          :width="30"
          :class="['nav_img', activeItem == 'earn' && 'active']"
          cover
          src="@/assets/images/svg/tabr/earn.svg"
        ></v-img>
        <span :class="['btn_text', activeItem == 'earn' && 'active']"
          >Earn</span
        >
      </v-btn>
      <v-btn
        value="frens"
        :to="{ name: 'Frens' }"
        density="compact"
        slim
        min-width="0"
      >
        <v-img
          :width="30"
          :class="['nav_img', activeItem == 'frens' && 'active']"
          cover
          src="@/assets/images/svg/tabr/frens.svg"
        ></v-img>
        <span :class="['btn_text', activeItem == 'frens' && 'active']"
          >Frens</span
        >
      </v-btn>
      <v-btn
        value="wallet"
        :to="{ name: 'Mine' }"
        density="compact"
        slim
        min-width="0"
      >
        <v-img
          :width="30"
          :class="['nav_img', activeItem == 'wallet' && 'active']"
          cover
          src="@/assets/images/svg/tabr/wallet.svg"
        ></v-img>
        <span :class="['btn_text', activeItem == 'wallet' && 'active']"
          >Wallet</span
        >
      </v-btn>
      <v-btn
        value="airdrop"
        :to="{ name: 'Airdrop' }"
        density="compact"
        slim
        min-width="0"
      >
        <v-img
          :width="30"
          cover
          src="@/assets/images/svg/tabr/airdrop.svg"
        ></v-img>
        <span :class="['btn_text', activeItem == 'airdrop' && 'active']"
          >Airdrop</span
        >
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// 没有导航按钮的页面
const notNav = [] as Array<string>;

export default defineComponent({
  data() {
    return {
      activeItem: "play",
      activeNav: true,
    };
  },
  methods: {},
  watch: {
    "$route.path"(val: string) {
      if (notNav.includes(val)) {
        this.activeNav = true;
      } else {
        this.activeNav = true;
      }
    },
  },
});
</script>

<style scoped lang="scss">
.v-btn {
  letter-spacing: normal;
}

.nav_img {
  filter: grayscale(100%);

  &.active {
    filter: none;
  }
}

.btn_text {
  padding-top: 4px;
  color: #a2a2a2;
  font-weight: 400;

  &.active {
    color: #ea980a;
    font-weight: bold;
  }
}
</style>