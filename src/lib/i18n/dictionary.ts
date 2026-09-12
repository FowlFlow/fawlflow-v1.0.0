import type { Dict, Locale } from "./types";
import { commonEn, commonSi } from "./dictionaries/common";
import { navEn, navSi } from "./dictionaries/nav";
import { authEn, authSi } from "./dictionaries/auth";
import { homeEn, homeSi } from "./dictionaries/home";
import { feedEn, feedSi } from "./dictionaries/feed";
import { eggsEn, eggsSi } from "./dictionaries/eggs";
import { contactsEn, contactsSi } from "./dictionaries/contacts";
import { settingsEn, settingsSi } from "./dictionaries/settings";

export const dictionaries: Record<Locale, Dict> = {
  en: {
    common: commonEn,
    nav: navEn,
    auth: authEn,
    home: homeEn,
    feed: feedEn,
    eggs: eggsEn,
    contacts: contactsEn,
    settings: settingsEn,
  },
  si: {
    common: commonSi,
    nav: navSi,
    auth: authSi,
    home: homeSi,
    feed: feedSi,
    eggs: eggsSi,
    contacts: contactsSi,
    settings: settingsSi,
  },
};
