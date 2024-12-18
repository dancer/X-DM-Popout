let popoutWindow = null;

function waitForDMSection() {
    console.log('Starting to observe for DM section...');
    
    if (injectButton()) return;

    const observer = new MutationObserver((mutations, obs) => {
        if (injectButton()) {
            console.log('Button injected via observer');
            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
}

function handlePopout() {
    console.log('Popout button clicked');
    
    const messagesUrl = 'https://twitter.com/messages';
    
    const width = 600;
    const height = 755;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
        messagesUrl,
        'TwitterMessages',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    function applyPopupStyles() {
        const hideElementsStyles = `
            /* Hide all navigation elements */
            nav[role="navigation"],
            [data-testid="BottomBar-React"],
            [data-testid="primaryColumn"] > div:first-child,
            [data-testid="sidebarColumn"],
            header[role="banner"],
            [data-testid="DM_conversation_header"] > div:first-child,
            [data-testid="placementTracking"],
            [data-testid="DMDrawer"] [role="progressbar"],
            [data-testid="DMDrawer"] [role="separator"] {
                display: none !important;
            }

            /* Keep new message button visible */
            [data-testid="NewDM_Button"],
            [data-testid="DM_newConversation_button"] {
                display: flex !important;
            }

            /* Adjust layout without nav elements */
            [data-testid="primaryColumn"] {
                margin: 0 !important;
                max-width: none !important;
                padding: 0 !important;
                width: 100% !important;
            }

            /* Remove extra padding from message container */
            [data-testid="DMDrawer"],
            [data-testid="DM_conversation_container"],
            [data-testid="DM_conversation"],
            [data-testid="DM_ScrollerContainer"],
            [data-testid="DM_conversation_list"],
            [data-testid="DM_conversation_body"],
            [data-testid="DMInbox"] {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: none !important;
            }

            /* Remove any extra container padding */
            [data-testid="cellInnerDiv"],
            [data-testid="messageEntry"],
            [data-testid="messageEntry"] > div,
            [data-testid="messageEntry"] > div > div {
                padding-right: 0 !important;
                margin-right: 0 !important;
            }

            /* Adjust message input box */
            [data-testid="DMComposerTextInput"] {
                margin: 8px !important;
                width: calc(100% - 16px) !important;
            }

            /* Fix conversation width */
            [data-testid="DM_conversation_container"] {
                width: 100% !important;
                max-width: none !important;
            }

            /* Make content responsive */
            #react-root {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            main {
                width: 100% !important;
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }

            /* Remove any remaining right padding */
            div[style*="padding-right"],
            div[style*="margin-right"] {
                padding-right: 0 !important;
                margin-right: 0 !important;
            }

            /* Back to Messages button */
            .back-to-messages {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 10000 !important;
                background: #000000 !important;
                color: #FFFFFF !important;
                border: 2px solid #FFFFFF !important;
                padding: 8px 16px !important;
                cursor: pointer !important;
                display: none !important;
                box-shadow: 2px 2px 0 #FFFFFF !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
                font-size: 14px !important;
            }

            .back-to-messages:hover {
                background: #1A1A1A !important;
            }

            .back-to-messages:active {
                transform: translate(-50%, -50%) translate(2px, 2px) !important;
                box-shadow: none !important;
            }

            /* Only show back button when completely away from messages */
            body:not([data-at-messages]) .back-to-messages {
                display: flex !important;
            }
        `;

        let styleElement = popup.document.getElementById('dm-popup-styles');
        if (!styleElement) {
            styleElement = popup.document.createElement('style');
            styleElement.id = 'dm-popup-styles';
            popup.document.head.appendChild(styleElement);
        }
        styleElement.textContent = hideElementsStyles;

        let backButton = popup.document.querySelector('.back-to-messages');
        if (!backButton) {
            backButton = popup.document.createElement('button');
            backButton.className = 'back-to-messages';
            backButton.textContent = 'Back to Messages';
            backButton.addEventListener('click', () => {
                popup.location.href = '/messages';
            });
            popup.document.body.appendChild(backButton);
        }

        const checkUrlAndUpdateButton = () => {
            if (popup.location.pathname.startsWith('/messages')) {
                popup.document.body.setAttribute('data-at-messages', 'true');
                backButton.style.display = 'none';
            } else {
                popup.document.body.removeAttribute('data-at-messages');
                backButton.style.display = 'flex';
            }
        };

        const observer = new MutationObserver(() => {
            checkUrlAndUpdateButton();
        });

        observer.observe(popup.document.body, {
            childList: true,
            subtree: true
        });

        popup.addEventListener('popstate', checkUrlAndUpdateButton);

        checkUrlAndUpdateButton();

        popup.document.title = 'Messages';

        popup.sessionStorage.setItem('isTwitterDMPopup', 'true');
    }

    popup.onload = applyPopupStyles;
}

if (window.sessionStorage.getItem('isTwitterDMPopup') === 'true') {
    const hideElementsStyles = `
        /* Hide all navigation elements */
        nav[role="navigation"],
        [data-testid="BottomBar-React"],
        [data-testid="primaryColumn"] > div:first-child,
        [data-testid="sidebarColumn"],
        header[role="banner"],
        [data-testid="DM_conversation_header"] > div:first-child,
        [data-testid="placementTracking"],
        [data-testid="DMDrawer"] [role="progressbar"],
        [data-testid="DMDrawer"] [role="separator"] {
            display: none !important;
        }

        /* Keep new message button visible */
        [data-testid="NewDM_Button"],
        [data-testid="DM_newConversation_button"] {
            display: flex !important;
        }

        /* Adjust layout without nav elements */
        [data-testid="primaryColumn"] {
            margin: 0 !important;
            max-width: none !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* Remove extra padding from message container */
        [data-testid="DMDrawer"],
        [data-testid="DM_conversation_container"],
        [data-testid="DM_conversation"],
        [data-testid="DM_ScrollerContainer"],
        [data-testid="DM_conversation_list"],
        [data-testid="DM_conversation_body"],
        [data-testid="DMInbox"] {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
        }

        /* Remove any extra container padding */
        [data-testid="cellInnerDiv"],
        [data-testid="messageEntry"],
        [data-testid="messageEntry"] > div,
        [data-testid="messageEntry"] > div > div {
            padding-right: 0 !important;
            margin-right: 0 !important;
        }

        /* Adjust message input box */
        [data-testid="DMComposerTextInput"] {
            margin: 8px !important;
            width: calc(100% - 16px) !important;
        }

        /* Fix conversation width */
        [data-testid="DM_conversation_container"] {
            width: 100% !important;
            max-width: none !important;
        }

        /* Make content responsive */
        #react-root {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        main {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        /* Remove any remaining right padding */
        div[style*="padding-right"],
        div[style*="margin-right"] {
            padding-right: 0 !important;
            margin-right: 0 !important;
        }

        /* Back to Messages button */
        .back-to-messages {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 10000 !important;
            background: #000000 !important;
            color: #FFFFFF !important;
            border: 2px solid #FFFFFF !important;
            padding: 8px 16px !important;
            cursor: pointer !important;
            display: none !important;
            box-shadow: 2px 2px 0 #FFFFFF !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
            font-size: 14px !important;
        }

        .back-to-messages:hover {
            background: #1A1A1A !important;
        }

        .back-to-messages:active {
            transform: translate(-50%, -50%) translate(2px, 2px) !important;
            box-shadow: none !important;
        }

        /* Only show back button when completely away from messages */
        body:not([data-at-messages]) .back-to-messages {
            display: flex !important;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'dm-popup-styles';
    styleElement.textContent = hideElementsStyles;
    document.head.appendChild(styleElement);

    let backButton = document.querySelector('.back-to-messages');
    if (!backButton) {
        backButton = document.createElement('button');
        backButton.className = 'back-to-messages';
        backButton.textContent = 'Back to Messages';
        backButton.addEventListener('click', () => {
            window.location.href = '/messages';
        });
        document.body.appendChild(backButton);
    }

    const checkUrlAndUpdateButton = () => {
        if (window.location.pathname.startsWith('/messages')) {
            document.body.setAttribute('data-at-messages', 'true');
            backButton.style.display = 'none';
        } else {
            document.body.removeAttribute('data-at-messages');
            backButton.style.display = 'flex';
        }
    };

    const observer = new MutationObserver(() => {
        checkUrlAndUpdateButton();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    checkUrlAndUpdateButton();

    document.title = 'Messages';
}

function findMessageInput() {
    const selectors = [
        '[data-testid="DM_Header_Settings"]',
        '[aria-label="Settings"]',
        '[data-testid="DMSettingsButton"]'
    ];

    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log('Found settings button via selector:', selector);
            return element.closest('[role="group"]') || 
                   element.closest('[data-testid="DM_Header"]') ||
                   element.parentElement;
        }
    }

    return null;
}

function injectButton() {
    const headerActions = findMessageInput();
    if (!headerActions) {
        console.log('Header actions area not found');
        return false;
    }

    if (headerActions.querySelector('.dm-popout-btn')) {
        console.log('Button already exists');
        return true;
    }

    console.log('Injecting button into header actions:', headerActions);

    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'dm-popout-btn-wrapper';
    
    const popoutButton = document.createElement('button');
    popoutButton.className = 'dm-popout-btn';
    popoutButton.innerHTML = `
        <svg viewBox="0 0 32 32" width="20" height="20">
            <path fill="currentColor" d="M15.694 13.541l2.666 2.665 5.016-5.017 2.59 2.59 0.004-7.734-7.785-0.046 2.526 2.525-5.017 5.017zM25.926 16.945l-1.92-1.947 0.035 9.007-16.015 0.009 0.016-15.973 8.958-0.040-2-2h-7c-1.104 0-2 0.896-2 2v16c0 1.104 0.896 2 2 2h16c1.104 0 2-0.896 2-2l-0.074-7.056z"/>
        </svg>
    `;
    popoutButton.title = "Pop out messages in new window";
    
    popoutButton.addEventListener('click', handlePopout);
    buttonWrapper.appendChild(popoutButton);

    const settingsButton = headerActions.querySelector('[data-testid="DM_Header_Settings"], [aria-label="Settings"]');
    if (settingsButton) {
        headerActions.insertBefore(buttonWrapper, settingsButton);
    } else {
        headerActions.appendChild(buttonWrapper);
    }
    
    console.log('Button injected successfully');
    return true;
}

function initialize() {
    console.log('Initializing...');

    if (window.location.pathname.includes('/messages')) {
        console.log('On messages page, starting injection');
        waitForDMSection();
    }

    const observer = new MutationObserver(() => {
        if (window.location.pathname.includes('/messages') && !document.querySelector('.dm-popout-btn')) {
            console.log('Navigated to messages page');
            waitForDMSection();
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 