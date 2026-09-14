const SELECTORS = {
    popup: "popup",
    popupTitle: "popupTitle",
    popupMessage: "popupMessage",
    loaderText: "loader-text"
};

ZOHO.embeddedApp.on("PageLoad", async (entity) => {
    const loader = document.getElementById("loader-overlay");
    if (loader) loader.classList.replace("hidden", "flex");

    console.log("RAW PageLoad Entity Object:", entity);

    try {
        let outstandingAmount = null;

        // Extract outstanding_receivable directly from the flyout context data object
        if (entity && entity.data && entity.data.outstanding_receivable !== undefined) {
            outstandingAmount = entity.data.outstanding_receivable;
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const paramValue = urlParams.get("outstanding_receivable");
            if (paramValue !== null) {
                outstandingAmount = paramValue;
            }
        }

        if (outstandingAmount === null) {
            throw new Error("Unable to identify Outstanding Receivable value from Flyout data.");
        }

        const valueElement = document.getElementById("receivables-value");
        valueElement.textContent = Number(outstandingAmount).toLocaleString('en-US', {
            style: 'currency',
            currency: 'AED'
        });

        if (loader) loader.classList.replace("flex", "hidden");

    } catch (err) {
        if (loader) loader.classList.replace("flex", "hidden");
        showPopup("Data Fetch Error", err.message, "restricted");
    }
});

ZOHO.embeddedApp.init();

function showPopup(titleText, message, type = "restricted") {
    const popup = document.getElementById(SELECTORS.popup);
    const iconDiv = document.getElementById("statusIcon");
    const title = document.getElementById(SELECTORS.popupTitle);
    const msg = document.getElementById(SELECTORS.popupMessage);
    
    popup.classList.remove("hidden");
    title.textContent = titleText;
    msg.innerHTML = message;
    
    if(type === "success") {
        popup.setAttribute("data-status", "success");
        iconDiv.className = "mx-auto flex items-center justify-center h-8 w-8 rounded-full mb-2 bg-green-50 text-green-500";
        iconDiv.innerHTML = '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';
    } else {
        popup.setAttribute("data-status", "error");
        iconDiv.className = "mx-auto flex items-center justify-center h-8 w-8 rounded-full mb-2 bg-amber-50 text-amber-500";
        iconDiv.innerHTML = '<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
    }
}