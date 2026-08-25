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
        let entity_id = null;

        // Extract recordId directly from the flyout context data object
        if (entity && entity.data && entity.data.recordId) {
            entity_id = entity.data.recordId;
        } 
        else if (entity) {
            if (Array.isArray(entity.EntityId) && entity.EntityId.length > 0) {
                entity_id = entity.EntityId[0];
            } else if (entity.recordId) {
                entity_id = entity.recordId;
            }
        }

        if (!entity_id) {
            const urlParams = new URLSearchParams(window.location.search);
            entity_id = urlParams.get("recordId") || urlParams.get("id") || urlParams.get("entityId");
        }

        if (!entity_id) {
            throw new Error("Unable to identify Record ID from Flyout data.");
        }

        // Fetch Current User
        ZOHO.CRM.CONFIG.getCurrentUser().then(function(data){
            console.log("Current User Data Raw:", data);
        });

        const record_response = await ZOHO.CRM.API.getRecord({ 
            Entity: "Quotes", 
            approved: "both", 
            RecordID: entity_id 
        });

        if (!record_response || !record_response.data) {
            throw new Error("Quote record not found.");
        }
        
        const record_data = record_response.data[0];
        const outstandingAmount = record_data.Outstanding_Receivables || 0;

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