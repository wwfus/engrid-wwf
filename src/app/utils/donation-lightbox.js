import "./confetti";
export class DonationLightbox {
  constructor() {
    console.log("DonationLightbox: constructor");
    window.dataLayer = window.dataLayer || [];
    this.defaultOptions = {
      image: "",
      logo: "",
      title: "",
      paragraph: "",
      footer: "",
      bg_color: "#254d68",
      txt_color: "#FFFFFF",
      form_color: "#418fde",
      url: null,
      cookie_hours: 24,
    };
    this.donationinfo = {};
    this.options = { ...this.defaultOptions };
    this.init();
  }
  setOptions(options) {
    this.options = Object.assign(this.options, options);
  }
  loadOptions(element = null) {
    if (typeof window.DonationLightboxOptions !== "undefined") {
      this.setOptions(
        Object.assign(this.defaultOptions, window.DonationLightboxOptions)
      );
    } else {
      this.setOptions(this.defaultOptions);
    }
    if (!element) {
      return;
    }
    // Get Data Attributes
    let data = element.dataset;
    console.log("DonationLightbox: loadOptions: data: ", data);
    // Set Options
    if ("image" in data) {
      this.options.image = data.image;
    }
    if ("logo" in data) {
      this.options.logo = data.logo;
    }
    if ("title" in data) {
      this.options.title = data.title;
    }
    if ("paragraph" in data) {
      this.options.paragraph = data.paragraph;
    }
    if ("footer" in data) {
      this.options.footer = data.footer;
    }
    if ("bg_color" in data) {
      this.options.bg_color = data.bg_color;
    }
    if ("txt_color" in data) {
      this.options.txt_color = data.txt_color;
    }
    if ("form_color" in data) {
      this.options.form_color = data.form_color;
    }
  }
  init() {
    console.log("DonationLightbox: init");
    document.querySelectorAll("[data-donation-lightbox]").forEach((e) => {
      e.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          // Get clicked element
          let element = event.target;
          console.log("DonationLightbox: init: clicked element: " + element);
          this.build(event);
        },
        false
      );
    });
    window.addEventListener("message", this.receiveMessage.bind(this), false);
    // This is for disable mobile view
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    if (
      typeof window.DonationLightboxOptions !== "undefined" &&
      window.DonationLightboxOptions.hasOwnProperty("url") &&
      !this.getCookie() &&
      viewportWidth > 899
    ) {
      this.build(window.DonationLightboxOptions.url);
    }
  }
  build(event) {
    console.log("DonationLightbox: build", typeof event);
    let href = null;
    if (typeof event === "object") {
      // Get clicked element
      let element = event.target;
      this.loadOptions(element);
      href = new URL(element.href);
    } else {
      href = new URL(event);
      this.loadOptions();
    }
    // Delete overlay if exists
    if (this.overlay) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlayID = "foursite-" + Math.random().toString(36).substring(7);
    href.searchParams.append("color", this.options.form_color);
    const markup = `
            <div class="foursiteDonationLightbox-container">
                ${
                  this.options.logo
                    ? `<img class="dl-mobile-logo" src="${this.options.logo}" alt="${this.options.title}">`
                    : ""
                }
                <div class="dl-content">
                  <div class="left" style="background-color: ${
                    this.options.bg_color
                  }; color: ${this.options.txt_color}">
                    ${
                      this.options.logo
                        ? `<img class="dl-logo" src="${this.options.logo}" alt="${this.options.title}">`
                        : ""
                    }
                    <img class="dl-hero" src="${this.options.image}" alt="${
      this.options.title
    }" />
                    <div class="dl-container">
                      <h1 class="dl-title" style="color: ${
                        this.options.txt_color
                      }">${this.options.title}</h1>
                      <p class="dl-paragraph" style="color: ${
                        this.options.txt_color
                      }">${this.options.paragraph}</p>
                    </div>
                  </div>
                  <div class="right">
                  <a href="#" class="dl-button-close"></a>
                  <div class="dl-loading" style="background-color: ${
                    this.options.form_color
                  }">
                    <div class="spinner">
                      <div class="double-bounce1"></div>
                      <div class="double-bounce2"></div>
                    </div>
                  </div>
                    <iframe loading='lazy' id='dl-iframe' width='100%' scrolling='no' class='dl-iframe' src='${href}' frameborder='0' allowfullscreen></iframe>
                  </div>
                </div>
                <div class="dl-footer">
                  <p>${this.options.footer}</p>                    
                </div>
            </div>
            `;
    let overlay = document.createElement("div");
    overlay.id = this.overlayID;
    overlay.classList.add("is-hidden");
    overlay.classList.add("foursiteDonationLightbox");
    overlay.innerHTML = markup;
    const closeButton = overlay.querySelector(".dl-button-close");
    closeButton.addEventListener("click", this.close.bind(this));
    overlay.addEventListener("click", (e) => {
      if (e.target.id == this.overlayID) {
        this.close(e);
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        closeButton.click();
      }
    });
    this.overlay = overlay;
    document.body.appendChild(overlay);
    this.open();
  }
  open() {
    window.dataLayer.push({ event: "donation_lightbox_display" });
    this.overlay.classList.remove("is-hidden");
    document.body.classList.add("has-DonationLightbox");
  }

  close(e) {
    window.dataLayer.push({ event: "donation_lightbox_closed" });
    e.preventDefault();
    this.overlay.classList.add("is-hidden");
    document.body.classList.remove("has-DonationLightbox");
    if (this.options.url) {
      this.setCookie(this.options.cookie_hours);
    }
  }
  // Receive a message from the child iframe
  receiveMessage(event) {
    console.log("DonationLightbox: receiveMessage: event: ", event);
    const message = event.data;
    if (message.key === "status") {
      this.status(message.value, event);
    }
    if (message.key === "error") {
      this.error(message.value, event);
    }
    if (message.key === "class") {
      document
        .querySelector(".foursiteDonationLightbox")
        .classList.add(message.value);
    }
    if (message.key === "donationinfo") {
      this.donationinfo = JSON.parse(message.value);
      console.log(
        "DonationLightbox: receiveMessage: donationinfo: ",
        this.donationinfo
      );
    }
  }
  status(status, event) {
    if (status === "loading") {
      document.querySelector(".dl-loading").classList.remove("is-loaded");
    }
    if (status === "loaded") {
      document.querySelector(".dl-loading").classList.add("is-loaded");
    }
    if (status === "submitted") {
      this.donationinfo.frequency =
        this.donationinfo.frequency == "no" ? "" : this.donationinfo.frequency;
      let iFrameUrl = new URL(document.getElementById("dl-iframe").src);
      for (const key in this.donationinfo) {
        iFrameUrl.searchParams.append(key, this.donationinfo[key]);
      }
      document.getElementById("dl-iframe").src = iFrameUrl
        .toString()
        .replace("/donate/1", "/donate/2");
    }
    if (status === "close") {
      this.close(event);
    }
    if (status === "celebrate") {
      this.celebrate();
    }
  }
  error(error, event) {
    this.shake();
    // console.error(error);
    const container = document.querySelector(
      ".foursiteDonationLightbox .right"
    );
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.innerHTML = `<p>${error}</p><a class="close" href="#">Close</a>`;
    errorMessage.querySelector(".close").addEventListener("click", (e) => {
      e.preventDefault();
      errorMessage.classList.remove("dl-is-visible");
      // One second after close animation ends, remove the error message
      setTimeout(() => {
        errorMessage.remove();
      }, 1000);
    });
    container.appendChild(errorMessage);
    // 300ms after error message is added, show the error message
    setTimeout(() => {
      errorMessage.classList.add("dl-is-visible");
      // Five seconds after error message is shown, remove the error message
      setTimeout(() => {
        errorMessage.querySelector(".close").click();
      }, 5000);
    }, 300);
  }
  celebrate() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 100000,
      useWorker: false,
    };

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  }
  shake() {
    const element = document.querySelector(".dl-content");
    if (element) {
      element.classList.add("shake");
      // Remove class after 1 second
      setTimeout(() => {
        element.classList.remove("shake");
      }, 1000);
    }
  }
  setCookie(hours = 24, path = "/") {
    const expires = new Date(Date.now() + hours * 36e5).toUTCString();
    document.cookie =
      "HideDonationLightbox" +
      "=" +
      encodeURIComponent(true) +
      "; expires=" +
      expires +
      "; path=" +
      path;
  }

  getCookie() {
    return document.cookie.split("; ").reduce((r, v) => {
      const parts = v.split("=");
      return parts[0] === "HideDonationLightbox"
        ? decodeURIComponent(parts[1])
        : r;
    }, "");
  }

  deleteCookie(path = "/") {
    setCookie("HideDonationLightbox", "", -1, path);
  }
}
