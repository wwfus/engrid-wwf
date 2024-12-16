class DonationMultistep {
  constructor() {
    this.iframe = document.getElementById("dm-iframe");
    if (!this.iframe) {
      if (this.isDebug())
        console.log("DonationMultistep: constructor: iframe not found");
      return;
    }
    console.log("DonationMultistep: constructor");
    window.dataLayer = window.dataLayer || [];
    this.defaultOptions = {
      name: "4Site Multi-Step iFrame",
      form_color: "#f26722",
      src: "",
      height: "",
      border_radius: "0",
      loading_color: "#E5E6E8",
      bounce_color: "#16233f",
      append_url_params: "false",
    };
    this.donationinfo = {};
    this.options = { ...this.defaultOptions };
    this.scrollToQueue = [];
    this.otherEventQueue = [];
    this.isProcessingQueue = false;
    this.firstFrameHeight = 1;
    this.firstFrameHeightProcessed = 1;
    this.init();
  }
  loadOptions() {
    // Get Data Attributes
    let data = this.iframe.dataset;
    // Set Options
    if ("name" in data) this.options.name = data.name;
    if ("form_color" in data) this.options.form_color = data.form_color;
    if ("src" in data) this.options.src = data.src;
    if ("height" in data) this.options.height = data.height;
    if ("border_radius" in data)
      this.options.border_radius = data.border_radius;
    if ("loading_color" in data)
      this.options.loading_color = data.loading_color;
    if ("bounce_color" in data) this.options.bounce_color = data.bounce_color;
    if ("append_url_params" in data)
      this.options.append_url_params = data.append_url_params;
    if (this.isDebug())
      console.log("DonationMultistep: loadOptions: options: ", this.options);
  }
  init() {
    console.log("DonationMultistep: init");
    window.addEventListener("message", this.receiveMessage.bind(this), false);
    this.loadOptions();
    this.build();
  }
  build() {
    this.status("loading");
    if (this.isDebug()) console.log("DonationMultistep: build");

    const src = new URL(this.options.src);

    this.containerID = "foursite-" + Math.random().toString(36).substring(7);

    src.searchParams.append("color", this.options.form_color);

    if (this.options.height) {
      src.searchParams.append("height", this.options.height);
    }

    if (this.options.append_url_params.toLowerCase() === "true") {
      const urlParams = new URLSearchParams(window.location.search);
      for (const [key, value] of urlParams) {
        src.searchParams.append(key, value);
      }
    }

    const container = document.createElement("div");
    container.classList.add("foursiteDonationMultistep-container");
    container.id = this.containerID;

    const height = this.options.height ?? "400px";

    const markup = `
        <div class="dm-content" style="border-radius: ${this.options.border_radius}">
            <iframe style='height: ${height}; min-height: ${height};' allow='payment' loading='lazy' id='dm-iframe' width='100%' scrolling='no' class='dm-iframe' src='${src}' frameborder='0' allowfullscreen></iframe>
        </div>
            `;
    container.innerHTML = markup;

    this.container = container;
    this.iframe.parentNode.insertBefore(this.container, this.iframe);
    this.iframe.remove();
    this.iframe = document.getElementById("dm-iframe");
    this.iframe.addEventListener("load", () => {
      const action = "Viewed";
      const category = "Multistep iFrame";
      const label = this.options.name;
      this.sendGAEvent(category, action, label);
      this.status("loaded");
    });
  }

  // Receive a message from the child iframe
  receiveMessage(event) {
    
    const message = event.data;
    
    // Push the event into the appropriate queue
    if (message && message["scrollTo"] !== undefined) {
console.log("DonationMultistep: receiveMessage: event: ", event.data);
      this.scrollToQueue.push(message);
    } else if (message && (message["frameHeight"] !== undefined || message["scroll"] !== undefined ))  {
      console.log("DonationMultistep: receiveMessage: event: ", event.data);
      if (this.firstFrameHeight < 4) {
console.log('firstFrameHeight');
         this.otherEventQueue.push(message);
         this.firstFrameHeight += 1;
     } else { setTimeout(() =>  this.otherEventQueue.push(message), 200); }
    }

    // Process the queue
    if (this.firstFrameHeightProcessed < 4) {
console.log('firstFrameHeightProcessed');
       this.processQueue();
       this.firstFrameHeightProcessed += 1;
    } else {
       setTimeout(() => this.processQueue(), 200);
    }

    // if (message && message["scrollTo"] !== undefined) {
    //   const scrollToPosition =
    //     message.scrollTo +
    //     window.scrollY +
    //     this.iframe.getBoundingClientRect().top;
    //   window.scrollTo({
    //     top: scrollToPosition,
    //     left: 0,
    //     behavior: "smooth",
    //   });
    //   console.log("iFrame Event - Scrolling Window to " + scrollToPosition);
    // } else if (message && message["frameHeight"] !== undefined) {
    //   this.iframe.style.height = message.frameHeight + "px";
    // } else if (
    //   message &&
    //   message["scroll"] !== undefined &&
    //   !this.isInViewport(this.iframe)
    // ) {
    //   // Scroll to the top of the iframe smoothly
    //   this.iframe.scrollIntoView({
    //     behavior: "smooth",
    //     block: "start",
    //   });
    // }
  }

  processQueue() {
    if (this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    // Process scrollTo events first
    while (this.scrollToQueue.length > 0) {
      console.log('processing scrollTo Queue');
      const message = this.scrollToQueue.shift();
      const scrollToPosition =
        message.scrollTo +
        window.scrollY +
        this.iframe.getBoundingClientRect().top;
      window.scrollTo({
        top: scrollToPosition,
        left: 0,
        behavior: "smooth",
      });
      console.log("iFrame Event - Scrolling Window to " + scrollToPosition);
    }

    // Process other events
    while (this.otherEventQueue.length > 0) {
 console.log('processing otherEventQueue');
      const message = this.otherEventQueue.shift();
      if (message && message["frameHeight"] !== undefined) {
        this.iframe.style.height = message.frameHeight + "px";
      } else if (
        message &&
        message["scroll"] !== undefined &&
        !this.isInViewport(this.iframe)
      ) {
        // Scroll to the top of the iframe smoothly
        this.iframe.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }

    this.isProcessingQueue = false;
  }

  status(status, event) {
    switch (status) {
      case "loading":
        // default iframe-container is hidden
        // show spinny
        // add timeout of 5 seconds - if timeout: show button
        document.querySelector(".dm-loading").classList.remove("is-loaded");
        break;
      case "loaded":
        // show iframe-container
        // hide spinny
        // hide button just in case
        document.querySelector(".dm-loading").classList.add("is-loaded");
        break;
      case "submitted":
        this.donationinfo.frequency =
          this.donationinfo.frequency == "no"
            ? ""
            : this.donationinfo.frequency;
        let iFrameUrl = new URL(document.getElementById("dm-iframe").src);
        for (const key in this.donationinfo) {
          iFrameUrl.searchParams.append(key, this.donationinfo[key]);
        }
        document.getElementById("dm-iframe").src = iFrameUrl
          .toString()
          .replace("/donate/1", "/donate/2");
        break;
    }
  }
  error(error, event) {
    this.shake();
    // console.error(error);
    const container = this.container.querySelector(".dm-content");
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.style.borderRadius = this.options.border_radius;
    errorMessage.innerHTML = `<p>${error}</p><a class="close" href="#">Close</a>`;
    errorMessage.querySelector(".close").addEventListener("click", (e) => {
      e.preventDefault();
      errorMessage.classList.remove("dm-is-visible");
      // One second after close animation ends, remove the error message
      setTimeout(() => {
        errorMessage.remove();
      }, 1000);
    });
    container.appendChild(errorMessage);
    // 300ms after error message is added, show the error message
    setTimeout(() => {
      errorMessage.classList.add("dm-is-visible");
      // Five seconds after error message is shown, remove the error message
      setTimeout(() => {
        errorMessage.querySelector(".close").click();
      }, 5000);
    }, 300);
  }
  shake() {
    this.container.classList.add("shake");
    // Remove class after 1 second
    setTimeout(() => {
      this.container.classList.remove("shake");
    }, 1000);
  }
  sendGAEvent(category, action, label) {
    if ("sendEvent" in window) {
      window.sendEvent(category, action, label, null);
    } else {
      window.dataLayer.push({
        event: "event",
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
      });
    }
  }
  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      // rect.bottom <=
      //   (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  isDebug() {
    const regex = new RegExp("[\\?&]debug=([^&#]*)");
    const results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}
var multistep_embed = new DonationMultistep();
