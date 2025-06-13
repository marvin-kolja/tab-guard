function shouldWarnBeforeClosure(): boolean {
	const url = new URL(window.location.href)
	const params = url.searchParams
	const urlIsTemporaryChat =
		params.has('temporary-chat') && params.get('temporary-chat') === 'true'

	if (!urlIsTemporaryChat) {
		console.debug('Not a temporary chat URL')
		return false
	}

	const documentHasArticles =
		document.body.querySelectorAll('article').length > 0

	if (!documentHasArticles) {
		console.debug(
			'No articles found in the document. Assuming no data to save.',
		)
		return false
	}

	return true
}

function beforeUnloadCallback(e: BeforeUnloadEvent) {
	if (shouldWarnBeforeClosure()) {
		console.debug('Registering beforeunload listener for temporary chat.')
		e.preventDefault()
		e.returnValue = ''
	} else {
		console.debug('No temporary chat detected, no listener registered.')
	}
}

window.removeEventListener('beforeunload', beforeUnloadCallback)
console.debug('Initializing content script for tab guard.')
window.addEventListener('beforeunload', beforeUnloadCallback)
