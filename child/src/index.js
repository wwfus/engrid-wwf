import DonationLightboxForm from "./app/app";
import "./scss/main.scss";
//run();
window.addEventListener("load", function () {
  window.DonationLightboxForm = DonationLightboxForm;
  new DonationLightboxForm();
});
