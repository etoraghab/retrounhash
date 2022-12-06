export function toast(icon, text = "") {
  var event = new CustomEvent("toast", {
    detail: {
      text: text,
      icon: icon,
    },
  });
  document.dispatchEvent(event);
}
