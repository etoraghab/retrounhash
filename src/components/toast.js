export function toast(icon, text = "") {
  var event = new CustomEvent("toast", {
    detail: {
      text: text,
      icon: icon,
    },
  });

  // Dispatch/Trigger/Fire the event
  document.dispatchEvent(event);
}
