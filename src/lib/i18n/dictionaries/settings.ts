import type { Dict } from "../types";

// "Settings" module: change password, recovery code, and the Egg Turns
// sub-section. CRUD verbs (Add/Edit/Save/Update) stay in English inside
// otherwise Sinhala sentences, matching the app-wide convention (see
// home.ts). Reuse common.* for bare words instead of redeclaring them here
// — the top-level "Settings" page title reuses common.settings.
export const settingsEn: Dict = {
  eggTurns: {
    title: "Egg Turns",
    editTitle: "Edit Egg Turn",
    addTitle: "Add Egg Turn",
    addNew: "Add Turn",
    empty: "No egg turns yet.",
    manage: "Manage Egg Turns",
    description:
      "The named times of day you collect eggs (e.g. Morning, Evening) — shown as columns on the Log Eggs screen.",
    order: "Order",
    orderDisplay: "Order: {order}",
    form: {
      name: "Turn Name",
      namePlaceholder: "e.g. Morning",
      orderHint: "Lower numbers show first on the Log Eggs screen.",
      submit: "Save Turn",
    },
    errors: {
      nameRequired: "Name is required",
      checkForm: "Please check the form.",
      duplicateName: "A turn with this name already exists.",
    },
    flash: {
      added: "Turn added.",
      updated: "Turn updated.",
    },
  },
  changePassword: {
    title: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    toastSuccess: "Password changed.",
    errors: {
      currentRequired: "Enter your current password",
      tooShort: "New password must be at least 8 characters",
      mismatch: "New passwords don't match",
      checkForm: "Please check the form.",
      currentIncorrect: "Current password is incorrect.",
    },
  },
  recoveryCode: {
    title: "Recovery Code",
    description:
      'Used on the "Forgot Password" screen if you ever get locked out. Generating a new one immediately invalidates the old one.',
    newCodeLabel:
      "New recovery code (save this now, it won't be shown again):",
    submit: "Generate New Recovery Code",
    generating: "Generating…",
    toastGenerated: "New recovery code generated.",
  },
  errors: {
    notSignedIn: "Not signed in.",
    userNotFound: "User not found.",
  },
};

export const settingsSi: Dict = {
  eggTurns: {
    title: "බිත්තර වාර",
    editTitle: "බිත්තර වාරය Edit කරන්න",
    addTitle: "බිත්තර වාරයක් Add කරන්න",
    addNew: "වාරයක් Add කරන්න",
    empty: "තවම බිත්තර වාර නැත.",
    manage: "බිත්තර වාර කළමනාකරණය කරන්න",
    description:
      "ඔබ බිත්තර එකතු කරන දිනයේ නම් කළ වේලාවන් (උදා: උදෑසන, සවස) — 'බිත්තර සටහන් කරන්න' තිරයේ තීරු ලෙස පෙන්වයි.",
    order: "අනුපිළිවෙල",
    orderDisplay: "අනුපිළිවෙල: {order}",
    form: {
      name: "වාරයේ නම",
      namePlaceholder: "උදා: උදෑසන",
      orderHint: "අඩු අංක 'බිත්තර සටහන් කරන්න' තිරයේ මුලින්ම පෙන්වයි.",
      submit: "වාරය Save කරන්න",
    },
    errors: {
      nameRequired: "නම අවශ්‍යයි",
      checkForm: "කරුණාකර පෝරමය පරීක්ෂා කරන්න.",
      duplicateName: "මෙම නම සහිත වාරයක් දැනටමත් ඇත.",
    },
    flash: {
      added: "වාරය Add කරන ලදී.",
      updated: "වාරය Update කරන ලදී.",
    },
  },
  changePassword: {
    title: "මුරපදය වෙනස් කරන්න",
    currentPassword: "වත්මන් මුරපදය",
    newPassword: "නව මුරපදය",
    confirmPassword: "නව මුරපදය Confirm කරන්න",
    toastSuccess: "මුරපදය වෙනස් කරන ලදී.",
    errors: {
      currentRequired: "ඔබේ වත්මන් මුරපදය ඇතුළත් කරන්න",
      tooShort: "නව මුරපදය අවම වශයෙන් අක්ෂර 8ක් තිබිය යුතුය",
      mismatch: "නව මුරපද දෙක නොගැලපේ",
      checkForm: "කරුණාකර පෝරමය පරීක්ෂා කරන්න.",
      currentIncorrect: "වත්මන් මුරපදය වැරදිය.",
    },
  },
  recoveryCode: {
    title: "ප්‍රතිසාධන කේතය",
    description:
      "ඔබ කිසි විටෙක ගිණුමෙන් අවහිර වුවහොත් 'මුරපදය අමතකද?' තිරයේදී මෙය භාවිත වේ. නව කේතයක් උත්පාදනය කිරීම වහාම පැරණි කේතය අවලංගු කරයි.",
    newCodeLabel:
      "නව ප්‍රතිසාධන කේතය (මෙය දැන්ම සුරකින්න, එය නැවත පෙන්වන්නේ නැත):",
    submit: "නව ප්‍රතිසාධන කේතයක් උත්පාදනය කරන්න",
    generating: "උත්පාදනය කරමින්…",
    toastGenerated: "නව ප්‍රතිසාධන කේතය උත්පාදනය කරන ලදී.",
  },
  errors: {
    notSignedIn: "ඔබ පිවිසී නොමැත.",
    userNotFound: "පරිශීලකයා හමු නොවීය.",
  },
};
