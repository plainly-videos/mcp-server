type Env = {
  // auth
  PLAINLY_API_URL: string;
  PLAINLY_API_KEY: string;
};

export default {
  // auth
  PLAINLY_API_URL:
    process.env.PLAINLY_API_URL || "https://api.plainlyvideos.com",
  PLAINLY_API_KEY: process.env.PLAINLY_API_KEY,
} as Env;
