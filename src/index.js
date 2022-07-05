import DonationMultistep from "./app/app";
import "./scss/main.scss";
//run();
window.addEventListener("load", function () {
  window.DonationMultistep = DonationMultistep;
  let donationMultistep = new DonationMultistep();
  // Set default options
  if (typeof window.DonationMultistepOptions !== "undefined") {
    donationMultistep.setOptions(window.DonationMultistepOptions);
  }
});
