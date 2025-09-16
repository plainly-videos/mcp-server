type Env = {
  PLAINLY_APP_URL: string;
  PLAINLY_API_URL: string;
  PLAINLY_API_KEY: string;
};

export default {
  PLAINLY_APP_URL:
    process.env.PLAINLY_APP_URL || "https://app.plainlyvideos.com",
  PLAINLY_API_URL:
    process.env.PLAINLY_API_URL || "https://api.plainlyvideos.com",
  PLAINLY_API_KEY: process.env.PLAINLY_API_KEY,
} as Env;
