import type { Dict } from "../types";

// "Contacts" module: buyers/suppliers list + add/edit form.
// CRUD verbs (Add/Edit/Save/Update) are kept in English inside otherwise
// Sinhala sentences, matching the app-wide convention (see home.ts). Reuse
// common.* for bare words (name, buyer, supplier, saving…) instead of
// redeclaring them here.
export const contactsEn: Dict = {
  title: "Contacts",
  editTitle: "Edit Contact",
  deactivateAria: "Deactivate contact",
  addNew: "Add Contact",
  empty: "No contacts yet. Add buyers and suppliers here.",
  noPhone: "No phone number",
  phone: "Phone",
  address: "Address",
  role: "Role",
  roleHint:
    "You don't have to set this now — it gets set automatically the first time you buy from or sell to this contact.",
  submit: "Save Contact",
  errors: {
    nameRequired: "Name is required",
    checkForm: "Please check the form.",
  },
  flash: {
    added: "Contact added.",
    updated: "Contact updated.",
  },
};

export const contactsSi: Dict = {
  title: "සම්බන්ධතා",
  editTitle: "සම්බන්ධතාව Edit කරන්න",
  deactivateAria: "සම්බන්ධතාව අක්‍රිය කරන්න",
  addNew: "සම්බන්ධතාවයක් Add කරන්න",
  empty: "තවම සම්බන්ධතා නැත. ගැණුම්කරුවන් සහ සැපයුම්කරුවන් මෙහි Add කරන්න.",
  noPhone: "දුරකථන අංකයක් නැත",
  phone: "දුරකථන අංකය",
  address: "ලිපිනය",
  role: "වර්ගය",
  roleHint:
    "මෙය දැන් සැකසිය යුතු නැත — ඔබ මෙම සම්බන්ධතාවයෙන් මුලින්ම මිලදී ගන්නා විට හෝ විකුණන විට එය ස්වයංක්‍රීයව සකසනු ලැබේ.",
  submit: "සම්බන්ධතාව Save කරන්න",
  errors: {
    nameRequired: "නම අවශ්‍යයි",
    checkForm: "කරුණාකර පෝරමය පරීක්ෂා කරන්න.",
  },
  flash: {
    added: "සම්බන්ධතාව Add කරන ලදී.",
    updated: "සම්බන්ධතාව Update කරන ලදී.",
  },
};
