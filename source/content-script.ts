function shouldWarnBeforeClosure(): boolean {
	const url = new URL(window.location.href)
	const params = url.searchParams
	return (
		params.has('temporary-chat') && params.get('temporary-chat') === 'true'
	)
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
