declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN_DEV: string;
      BOT_ID_DEV: string;

      BOT_TOKEN: string;
      BOT_ID: string;

      BOT_LOGS_ID: string;
      GUILD_ID: string;

      WEBHOOK_LOG_ID: string;
      WEBHOOK_LOG_TOKEN: string;

      CHANNEL_MOD: string;
      CHANNEL_LOGS: string;
      CHANNEL_EMOTE: string;
      CHANNEL_BOT: string;
      CHANNEL_ROLES: string;
      CHANNEL_GENERAL: string;
      CHANNEL_F1: string;
      CHANNEL_NOPIXEL: string;

      MESSAGE_F1_DRIVERS: string;
      MESSAGE_F1_CONSTRUCTORS: string;

      ROLE_MOD: string;
      ROLE_MUTE: string;
      ROLE_REGULAR: string;

      USER_MITCH: string;
      USER_ANDLIN: string;

      OPENAI_TOKEN: string;
      ANDLIN_TOKEN: string;
      ANDLIN_PING_API: string;
      ANDLIN_ADDRESS_API: string;
      ANDLIN_TRANSLATE_API: string;

      ADDRESS_API: string;

      TWITTER_API_TOKEN: string;

      CLOUD_CONVERT_TOKEN: string;

      SMMRY_API: string;

      WEATHER_API: string;

      TIME_API: string;

      ANIMAL_PIC_FERRET_API: string;
      ANIMAL_PIC_API: string;
      ANIMAL_FACT_API: string;

      URBAN_API: string;
      DICTIONARY_API: string;

      IMDB_SEARCH_API: string;
      IMDB_TRAILER_API: string;
      IMDB_INFO_API: string;
      IMDB_INFO_ALT_API: string;

      CURRENCY_API: string;

      F1_SEASON_API: string;
      F1_DRIVERS_API: string;
      F1_CONSTRUCTORS_API: string;

      TWITCH_CLIENT_ID: string;
      TWITCH_AUTH_API: string;

      NOPIXEL_API: string;
      IGNITE_API: string;
    }
  }
}

export { };
