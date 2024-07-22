const config = {
  dev: {
    api: "http://222.214.219.202:4501/",
  },
  test: {
    api: "https://test2.xlab.red:4501/",
  },
  prod: {
    api: "https://api.tonrollercoaster.com/",
  },
};

export default {
  ENV: import.meta.env.NODE_ENV,
  ...config[import.meta.env.VITE_SERVER_CONFIG as keyof typeof config],
};