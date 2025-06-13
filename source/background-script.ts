chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _) => {
	if (changeInfo.status == 'complete') {
		console.debug("Tab updated and loaded, sending 'url-changed' message.")
		try {
			await chrome.tabs.sendMessage(tabId, {action: 'url-changed'})
		} catch (error) {
			console.warn('Content script not available or failed:', error)
		}
	}
})
