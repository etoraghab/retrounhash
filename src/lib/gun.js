import GUN from "gun";
import "gun/sea";
import "gun/axe";
import { writable } from "svelte/store";

export const db = GUN({
  peers: ["https://gun-ams1.cl0vr.co/gun", "http://localhost:8765/gun"],
  localStorage: false,
});

// Gun User
export const user = db.user().recall({ sessionStorage: true });
export const username = writable()
export const keys = writable({
  pub: ""
})
db.on("auth", () => {
  user.get("alias").once((name) => {
    username.set(name)
  })
  keys.set(user._.sea)
})