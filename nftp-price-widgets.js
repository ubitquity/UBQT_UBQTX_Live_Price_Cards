/**
 * NFTP Price Widgets
 * A self-contained JavaScript module to display live UBQTX and UBQT token prices.
 * Fetches data from Alcor Exchange API and updates every 30 seconds.
 *
 * Instructions:
 * 1. Place <div id="nftp-price-widgets"></div> in your HTML where you want the widgets to appear.
 * 2. Include this script at the bottom of your HTML body.
 */
(function() {
    // --- Configuration & State ---
    const WIDGET_CONTAINER_ID = 'nftp-price-widgets';
    const API_UBQTX = 'https://proton.alcor.exchange/api/v2/tokens/ubqtx-tokencreate';
    const API_UBQT = 'https://proton.alcor.exchange/api/v2/tokens/ubqt-ubitquityllc';
    const REFRESH_INTERVAL_MS = 30000; // 30 seconds

    // --- SVG Icons ---
    const ICONS = {
        dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
        x: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
    };

    // --- Main Initializer ---
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById(WIDGET_CONTAINER_ID);
        if (!container) {
            console.error(`[NFTP Price Widget] Error: Container element with id #${WIDGET_CONTAINER_ID} not found.`);
            return;
        }
        
        injectStyles();
        renderWidgets(container);
    });

    // --- Style Injection ---
    function injectStyles() {
        const styles = `
            /* Font Import */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

            /* Keyframes for Animation */
            @keyframes nftp-fade-in-up {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            /* Main Container */
            #nftp-price-widgets {
                font-family: 'Inter', sans-serif;
                color: #e5e7eb;
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            /* Card Styling */
            .nftp-card {
                position: relative;
                background-color: rgba(17, 24, 39, 0.75);
                border: 1px solid rgba(138, 43, 226, 0.5);
                border-radius: 1rem;
                width: fit-content;
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: nftp-fade-in-up 0.5s ease-out forwards;
                padding: 0.75rem;
                min-width: 180px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }

            .nftp-card-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: #d1d5db;
                padding-right: 1.5rem; /* Space for close button */
            }

            .nftp-card-header svg {
                color: #39ff14;
            }

            .nftp-card-content {
                margin-top: 0.5rem;
            }

            .nftp-price {
                font-size: 1.25rem;
                font-weight: 700;
                color: #ffffff;
            }

            .nftp-timestamp {
                font-size: 0.75rem;
                color: #9ca3af;
                margin-top: 0.25rem;
            }

            .nftp-error {
                color: #f87171;
                font-size: 0.875rem;
            }
            
            .nftp-close-btn {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                cursor: pointer;
                color: #6b7280;
                background: none;
                border: none;
                padding: 0.25rem;
                line-height: 1;
                transition: color 0.2s ease-in-out;
            }
            .nftp-close-btn:hover {
                color: #ffffff;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    // --- Widget Rendering ---
    function renderWidgets(container) {
        // Create UBQTX Widget
        const ubqtxWidget = createWidget('ubqtx', 'UBQTX Live Price');
        container.appendChild(ubqtxWidget);
        updatePrice(ubqtxWidget, API_UBQTX);
        setInterval(() => updatePrice(ubqtxWidget, API_UBQTX), REFRESH_INTERVAL_MS);
        
        // Create UBQT Widget
        const ubqtWidget = createWidget('ubqt', 'UBQT Live Price');
        container.appendChild(ubqtWidget);
        updatePrice(ubqtWidget, API_UBQT);
        setInterval(() => updatePrice(ubqtWidget, API_UBQT), REFRESH_INTERVAL_MS);
    }

    function createWidget(id, title) {
        const card = document.createElement('div');
        card.className = 'nftp-card';
        card.id = `nftp-widget-${id}`;
        card.innerHTML = `
            <button class="nftp-close-btn" title="Close Widget">${ICONS.x}</button>
            <div class="nftp-card-header">
                ${ICONS.dollar}
                <span>${title}</span>
            </div>
            <div class="nftp-card-content">
                <div class="nftp-price" id="nftp-price-${id}">Loading...</div>
                <div class="nftp-timestamp" id="nftp-timestamp-${id}"></div>
            </div>
        `;
        // Add close functionality
        card.querySelector('.nftp-close-btn').addEventListener('click', () => {
            card.style.display = 'none';
        });
        return card;
    }

    // --- Data Fetching and Updating ---
    async function updatePrice(widgetElement, apiUrl) {
        const id = widgetElement.id.split('-')[2];
        const priceEl = document.getElementById(`nftp-price-${id}`);
        const timestampEl = document.getElementById(`nftp-timestamp-${id}`);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response failed');
            
            const data = await response.json();
            const price = parseFloat(data.usd_price) || 0;
            
            priceEl.textContent = `$${price.toFixed(4)}`;
            timestampEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;

        } catch (error) {
            console.error(`[NFTP Price Widget] Failed to fetch price for ${id}:`, error);
            priceEl.innerHTML = `<span class="nftp-error">Data unavailable</span>`;
            timestampEl.textContent = '';
        }
    }

})();
