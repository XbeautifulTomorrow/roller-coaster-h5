<template>
  <div class="activity_wrapper">
    <div class="activity_item new_bie" @click="startGame('BASIC')">
      <v-img
        class="game_img"
        :width="200"
        cover
        src="@/assets/images/activity/new_bie.png"
      ></v-img>
      <div class="item_name">BASIC</div>
      <div class="game_info">
        <div class="info_left">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <span>{{ `${1} - ${Number(10000).toLocaleString()}` }}</span>
        </div>
        <div class="info_right">
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/activity/user.svg"
          ></v-img>
          <span>11111</span>
        </div>
      </div>
    </div>
    <div class="activity_item advanced" @click="startGame('ADVANCED')">
      <v-img
        class="game_img"
        :width="250"
        cover
        src="@/assets/images/activity/advanced.png"
      ></v-img>
      <div class="item_name">ADVANCED</div>
      <div class="game_info">
        <div class="info_left">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <span>{{
            `${Number(10000).toLocaleString()} - ${Number(
              100000000
            ).toLocaleString()}`
          }}</span>
        </div>
        <div class="info_right">
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/activity/user.svg"
          ></v-img>
          <span>11111</span>
        </div>
      </div>
    </div>
    <div class="activity_item legendary" @click="startGame('LEGENDARY')">
      <v-img
        class="game_img"
        :width="220"
        cover
        src="@/assets/images/activity/legendary.png"
      ></v-img>
      <div class="item_name">LEGENDARY</div>
      <div class="game_info">
        <div class="info_left">
          <v-img
            :width="24"
            cover
            src="@/assets/images/game/icon_rcp.png"
          ></v-img>
          <span>{{ `${1} - ${Number(1000000).toLocaleString()}` }}</span>
        </div>
        <div class="info_right">
          <v-img
            :width="16"
            cover
            src="@/assets/images/svg/activity/user.svg"
          ></v-img>
          <span>11111</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/store/game";

export default defineComponent({
  data() {
    return {};
  },
  methods: {
    startGame(event: any) {
      console.log(event);
      const { setGameLevel } = useGameStore();
      setGameLevel(event);
      // 开始游戏
      this.$router.push("/game");
    },
  },
});
</script>
<style lang="scss" scoped>
.activity_wrapper {
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .activity_item + .activity_item {
    margin-top: 40px;
  }
}

.activity_item {
  width: 300px;
  height: 180px;
  margin-top: 20px;
  border-radius: 16px;
  box-shadow: 0px 6px 6px 0px rgba(255, 255, 255, 0.35) inset;
  position: relative;
  font-size: 54px;
  font-weight: bold;
  line-height: 1;

  &.new_bie {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 1) 0%,
      rgba(102, 176, 83, 1) 100%
    );

    .game_img {
      width: 200px;
      height: auto;
      max-height: none;
      position: absolute;
      bottom: 0;
      flex: none;
    }

    .item_name {
      width: 100%;
      position: absolute;
      top: 0;
      right: 0;
      text-align: right;
      color: #fff;
      padding-top: 8px;
      margin-right: 8px;
      box-sizing: border-box;
    }
  }

  &.advanced {
    background: linear-gradient(
      234deg,
      rgba(254, 199, 80, 1) 3%,
      rgba(253, 112, 19, 1) 95%
    );
    border: none;
    border-radius: 20px;

    .item_name {
      width: 100%;
      position: absolute;
      top: 0;
      right: 0;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      padding-top: 16px;
      box-sizing: border-box;
    }

    .game_img {
      width: 300px;
      height: auto;
      max-height: none;
      position: absolute;
      right: -36px;
      bottom: 4px;
      flex: none;
    }
  }

  &.legendary {
    background: linear-gradient(
      180deg,
      rgba(193, 132, 255, 1) 0%,
      rgba(136, 50, 213, 1) 100%
    );
    border: none;
    border-radius: 20px;

    .item_name {
      width: 100%;
      position: absolute;
      bottom: 40px;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      box-sizing: border-box;
      z-index: 1;
    }

    .game_img {
      width: 300px;
      height: auto;
      max-height: none;
      position: absolute;
      right: 0;
      bottom: 0;
      flex: none;
      z-index: 2;
    }

    .game_info {
      z-index: 3;
    }
  }

  .game_info {
    position: absolute;
    width: 100%;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 0 0 16px 16px;
    padding: 4px 8px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .info_left,
  .info_right {
    display: flex;
    align-items: center;
    font-weight: 700;
    font-size: 16px;
    color: rgba(198, 198, 198, 0.6);

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}
</style>