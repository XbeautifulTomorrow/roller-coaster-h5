import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { validateToken, telegramLogin } from "@/services/api/user";
import { setLocalStore, setSessionStore, getSessionStore, removeSessionStore, isEmpty } from "@/utils";

//1. 定义要使用到的路由组件  （一定要使用文件的全名，得包含文件后缀名）
import activity from '@/views/activity.vue';
import game from '@/views/game.vue';
import earn from '@/views/earn.vue';
import frens from '@/views/frens.vue';
import airdrop from '@/views/airdrop.vue';
import mine from '@/views/mine.vue';
import frensRanking from '@/views/frensRanking.vue';
import swap from '@/views/swap.vue';
import provablyFair from '@/views/provablyFair.vue';

//2. 路由配置
const routes = [
  {
    path: '/',
    name: 'Activity',
    component: activity
  },
  {
    path: '/game',
    name: 'Game',
    component: game
  },
  {
    path: '/earn',
    name: 'Earn',
    component: earn
  },
  {
    path: '/frens',
    name: 'Frens',
    component: frens
  },
  {
    path: '/frensRanking',
    name: 'FrensRanking',
    component: frensRanking
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: mine
  },
  {
    path: '/swap',
    name: 'Swap',
    component: swap
  },
  {
    path: '/airdrop',
    name: 'Airdrop',
    component: airdrop
  },
  {
    path: '/provablyFair',
    name: 'ProvablyFair',
    component: provablyFair
  },

];

// 3. 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 切换页面重置滚动位置
router.afterEach(() => {
  window.scrollTo(0, 0);
});

router.onError((error) => {
  const pattern = /Loading chunk (\d)+ failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  if (isChunkLoadFailed) {
    window.location.reload();
    // router.replace(router.history.pending.fullPath);
  } else {
    console.log(error);
  }
});

router.beforeEach(async (to, from, next) => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const urlParam = params.get('tgWebAppStartParam');
  const urlParams = getSessionStore("urlParams");

  if (urlParam && urlParam != urlParams) {
    setSessionStore("urlParams", urlParam);
    if (urlParam.indexOf("frens") > -1) {
      setSessionStore('nextPath', "/frens");
    } else if (urlParam.indexOf("3base") > -1) {
      setSessionStore('recommend', "3base");
      const inviteArray = urlParam.split("_");
      if (inviteArray.length >= 2) {
        if (inviteArray[0] == "3base") {
          // 保存邀请码
          setSessionStore('inviteCode', inviteArray[1]);
        } else {
          // 保存邀请码
          setSessionStore('inviteCode', inviteArray[0]);
        }
      }
    } else {
      // 保存邀请码
      setSessionStore('inviteCode', urlParam);
    }
  }

  const userStore = useUserStore();
  if (userStore.isLogin) {
    const { Telegram } = (window as any)
    if (Telegram) {
      const { WebApp } = Telegram;
      WebApp.setHeaderColor("#1f212e")
    }

    validateToken({});

    // 领取礼物
    userStore.fetchReceiveGifts();
  } else {
    const { Telegram } = (window as any)
    let tg_certificate: any;
    if (Telegram) {
      const { WebApp } = Telegram;
      WebApp.setHeaderColor("#1f212e");
      tg_certificate = btoa(WebApp.initData);
      console.log(WebApp.version);
      console.log(tg_certificate);
    }

    if (isEmpty(tg_certificate)) {
      const { logoutApi } = useUserStore();
      logoutApi();
      next();
      return
    }


    const inviteCode = getSessionStore("inviteCode");
    const res = await telegramLogin({
      tgEncodeStr: tg_certificate,
      inviteCode: inviteCode
    });

    if (res.code == 200) {
      if (res.data.certificate) {
        setLocalStore("certificate", res.data.certificate);
      }

      // 保存登录信息
      userStore.setLogin(res.data);

      // 加载用户信息
      userStore.fetchUserInfo();

      // 领取礼物
      userStore.fetchReceiveGifts();
    }
  }

  // 如果有路由
  const nextPath = getSessionStore('nextPath');
  if (nextPath) {
    removeSessionStore('nextPath');
    next({ name: "Frens" });
  } else {
    next();
  }
});

// 4. 导出router
export default router;