function matchUrl(url: string): boolean {
	const gptUrlRegex = /^https:\/\/chatgpt\.com\/*.*/
	return gptUrlRegex.test(url)
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (!tab.url || !matchUrl(tab.url)) {
		console.debug(`Tab ${tabId} does not match URL regex, skipping...`)
		return
	}

	if (changeInfo.status == 'complete') {
		console.debug("Tab updated and loaded, sending 'url-changed' message.")
		await chrome.tabs.sendMessage(tabId, 'url-changed')
	}
})
