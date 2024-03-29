import GUN from "gun";
import "gun/sea";
import "gun/axe";
import "gun/lib/radix";
import "gun/lib/radisk";
import "gun/lib/store";
import "gun/lib/rindexed";

import { writable } from "svelte/store";

export const db = GUN({
  peers: [
    "https://gun-ams1.cl0vr.co/gun",
    // "https://gun-manhattan.herokuapp.com/gun"
  ],
  localStorage: false,
});

export const user = db.user().recall({ sessionStorage: true });
export const username = writable();
export const keys = writable({
  pub: "",
  epub: "",
  epriv: "",
  priv: "",
});
db.on("auth", () => {
  localStorage.setItem("keys", JSON.stringify(user._.sea));
  user.get("alias").once((name) => {
    username.set(name);
  });
  keys.set(user._.sea);
});
