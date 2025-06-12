function shouldWarnBeforeClosure(): boolean {
	const url = new URL(window.location.href)
	const params = url.searchParams
	return (
		params.has('temporary-chat') && params.get('temporary-chat') === 'true'
	)
}

if (shouldWarnBeforeClosure()) {
	console.debug('Temporary chat detected, setting up unload warning...')
	window.addEventListener('beforeunload', (e) => {
		e.preventDefault()
		e.returnValue = ''
	})
} else {
	console.debug('No temporary chat detected, no warning will be shown.')
}
