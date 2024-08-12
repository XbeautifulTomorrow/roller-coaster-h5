<template>
  <v-dialog
    v-model="showRules"
    width="auto"
    transition="dialog-bottom-transition"
    fullscreen
  >
    <div class="dialog_box">
      <div class="rules_title">HOW IT WORKS</div>
      <div class="rules_panel">
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/1.png"></v-img>
          <span>
            Welcome to Rollercoaster! The Rollercoaster price resets every 24
            hours at 00:00 UTC to $1,000
          </span>
        </div>
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/2.png"></v-img>
          <span>
            Order on the price going up if you think the price will rise. If the
            price goes up, you will generate profit.
          </span>
        </div>
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/3.png"></v-img>
          <span>
            Order on the price going down if you think the price will fall. If
            the price goes down, you will generate profit.
          </span>
        </div>
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/4.png"></v-img>
          <span>
            Pick a multiplier to maximise your order. Setting a higher
            multiplier increases the risk of your order.
          </span>
        </div>
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/5.png"></v-img>
          <span>
            Cashout at any time, profit or loss. Set profit or loss targets to
            automatically cashout your orders.
          </span>
        </div>
        <div class="rules_content_item">
          <v-img width="100%" cover src="@/assets/images/rules/6.png"></v-img>
          <span>
            Rollercoaster prices are generated using a provably fair algorithm.
            The house edge is 2.5%.
            <span
              style="color: #ea980a; font-weight: bold"
              @click="handleProvablyFair()"
            >
              Learn more here.
            </span>
          </span>
        </div>
      </div>
      <div class="rules_footer">
        <v-btn
          :class="['ready_btn', 'active']"
          width="160"
          height="32"
          rounded="lg"
          size="small"
          @click="handleReady()"
        >
          <span class="finished">GOT IT</span>
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useGameStore } from "@/store/game.js";

export default defineComponent({
  data() {
    return {};
  },
  computed: {
    showRules: {
      get() {
        const { showRules } = useGameStore();
        return showRules;
      },
      set(val: boolean) {
        const { setShowRules } = useGameStore();
        setShowRules(val);
      },
    },
  },
  methods: {
    handleReady() {
      this.showRules = false;
    },
    handleProvablyFair() {
      this.$router.push("/provablyFair");
      this.handleReady();
    },
  },
});
</script>
<style lang="scss" scoped>
:deep(.v-overlay__content) {
  margin: 0 !important;
  max-width: max-content !important;
  bottom: 0;
}

.dialog_box {
  width: 100%;
  overflow-y: scroll;
  height: 100vh;
  background-color: #000;
  border-radius: 16px 16px 0 0;
  padding: 16px;
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #fff;
  font-size: 20px;
  line-height: 1.2;

  .rules_title {
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
  }
}

.rules_panel {
  padding: 4px;
  border-radius: 4px;
  max-height: 80vh;
  overflow-y: scroll;
  font-size: 14px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  color: #b0b5c5;

  .rules_content_item {
    flex: 1;
    min-width: 40%;

    .v-img {
      display: block;
      margin-bottom: 8px;
      border-radius: 8px;
    }
  }

  .rules_content_item:nth-child(2n) {
    margin-left: 16px;
  }

  .rules_content_item:nth-child(n + 3) {
    margin-top: 16px;
  }
}

.rules_footer {
  margin-top: 8px;

  .ready_btn {
    background-color: rgba(255, 232, 26, 1);
    color: #c8c1c1;
    font-size: 16px;
    box-shadow: 0px 5px 5px 0px rgba(242, 9, 9, 0.15) inset;
  }

  .selected_box {
    padding-top: 8px;
    display: flex;
    align-items: center;
    font-size: 14px;

    .v-img {
      flex: none;
      margin-right: 4px;
    }
  }
}

.finished {
  text-transform: none;
  color: #000;
}
</style>