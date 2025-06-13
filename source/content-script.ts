function isTemporaryChatURL(): boolean {
	const url = new URL(window.location.href)
	const params = url.searchParams
	return (
		params.has('temporary-chat') && params.get('temporary-chat') === 'true'
	)
}

function chatHasArticles(): boolean {
	const articles = document
		.getElementById('thread')!
		.querySelectorAll('article')
	return articles.length > 0
}

function shouldWarnBeforeClosure(): boolean {
	if (!isTemporaryChatURL()) {
		console.debug('Not a temporary chat URL')
		return false
	}

	if (!chatHasArticles()) {
		console.debug(
			'No articles found in the document. Assuming no data to save.',
		)
		return false
	}

	return true
}

function beforeUnloadCallback(e: BeforeUnloadEvent) {
	if (shouldWarnBeforeClosure()) {
		console.debug('Preventing closure of temporary chat.')
		e.preventDefault()
		e.returnValue = ''
	} else {
		console.debug('No need to prevent closure of temporary chat.')
	}
}

window.removeEventListener('beforeunload', beforeUnloadCallback)
console.debug('Initializing content script for tab guard.')
window.addEventListener('beforeunload', beforeUnloadCallback)
