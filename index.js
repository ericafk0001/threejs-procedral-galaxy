document.addEventListener("DOMContentLoaded", (event) => {
  const box = document.getElementById("controls-div");
  let hidden = 69;

  document.addEventListener("keydown", (event) => {
    if (event.key === "m" || event.key === "M") {
      if (hidden === 69) {
        box.style.display = "none";
        hidden = 70;
      } else {
        box.style.display = "flex";
        hidden = 69;
      }
    }
  });
});
