/**
 * Reference to the MutationObserver that observes the chat for new `article`
 * elements.
 */
let articleObserver: MutationObserver | null = null

/**
 * Flag to indicate if the content script is already listening for events.
 */
let alreadyListening = false

/**
 * Checks if the current URL is a temporary chat URL by looking at the query
 * parameters.
 */
function isTemporaryChatURL(): boolean {
	const url = new URL(window.location.href)
	const params = url.searchParams
	return (
		params.has('temporary-chat') && params.get('temporary-chat') === 'true'
	)
}

/**
 * Checks if the chat has any `article` elements in the `#thread` element.
 */
function chatHasArticles(): boolean {
	const articles = document
		.getElementById('thread')!
		.querySelectorAll('article')
	return articles.length > 0
}

/**
 * Checks if the current URL is a temporary chat URL and if there are articles
 * present in the chat. If both conditions are met, it returns `true`,
 * indicating that a warning should be shown before closing the chat.
 */
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

/**
 * Callback to be executed before the window is unloaded.
 * @param e - `BeforeUnloadEvent`
 */
function beforeUnloadCallback(e: BeforeUnloadEvent) {
	if (shouldWarnBeforeClosure()) {
		console.debug('Preventing closure of temporary chat.')
		e.preventDefault()
		e.returnValue = ''
	} else {
		console.debug('No need to prevent closure of temporary chat.')
	}
}

/**
 * Returns an array of elements that should be hidden when a temporary chat is
 * active.
 */
function getElementsToHide(): HTMLElement[] {
	const elements = [
		document.getElementById('open-sidebar-button'),
		...document.querySelectorAll(
			'[data-testid="model-switcher-dropdown-button"]',
		),
		...document.querySelectorAll('[data-testid="open-sidebar-button"]'),
		...document.querySelectorAll('a[href="/"]'),
		document.getElementById('page-header'),
		document.getElementById('stage-slideover-sidebar'),
	]

	return elements.filter((el): el is HTMLElement => el !== null)
}

/**
 * Sets the `hidden` property of the provided elements to `true`.
 *
 * This function returns a cleanup function that restores the visibility
 * of the elements by setting their `hidden` property to `false`.
 *
 * @param elements - An array of HTML elements to hide.
 */
function hideElements(elements: HTMLElement[]): () => void {
	console.debug('Hiding elements.')
	for (const element of elements) {
		element.hidden = true
	}
	return () => {
		console.debug('Restoring visibility of hidden elements.')
		for (const element of elements) {
			element.hidden = false
		}
	}
}

const CONVERSATION_EXISTS = 'conversation-exists'

/**
 * Observes the chat for new `article` elements. It will trigger the
 * `CONVERSATION_EXISTS` event when an article is found, and then disconnect
 * itself.
 *
 * It will trigger the `CONVERSATION_EXISTS` event if articles are already
 * present. In that case, it will not start observing.
 */
function observeUntilArticle() {
	if (chatHasArticles()) {
		window.dispatchEvent(new Event(CONVERSATION_EXISTS))
		console.debug('Articles found, not starting observer.')
		return null
	}
	const observer = new MutationObserver((mutations, observer) => {
		for (const mutation of mutations) {
			if (mutation.type === 'childList') {
				if (chatHasArticles()) {
					window.dispatchEvent(new Event(CONVERSATION_EXISTS))
					console.debug('Articles found, stopping observer.')
					observer.disconnect()
				}
			}
		}
	})
	observer.observe(document.getElementById('thread')!, {
		childList: true,
		subtree: true,
	})
	console.debug('Article observer initialized.')

	return observer
}

/**
 * Callback to be executed when `CONVERSATION_EXISTS` event is triggered.
 */
function conversationExistsCallback() {
	hideElements(getElementsToHide())
}

/**
 * Callback to be executed when the window is resized.
 * It will dispatch the `CONVERSATION_EXISTS` event if articles are present.
 */
function onResizeCallback() {
	if (chatHasArticles()) {
		window.dispatchEvent(new Event(CONVERSATION_EXISTS))
	}
}

/**
 * Callback to handle runtime messages.
 * @param message
 */
function handleMessage(message: {action: string}) {
	if (message.action === 'url-changed') {
		const isTemporary = isTemporaryChatURL()
		if (isTemporary) {
			if (alreadyListening) {
				console.debug('Already listening for events, skipping setup.')
			} else {
				console.debug('Temporary chat URL detected, setting up listeners.')
				alreadyListening = true
				window.addEventListener('beforeunload', beforeUnloadCallback)
				window.addEventListener(
					CONVERSATION_EXISTS,
					conversationExistsCallback,
				)
				window.addEventListener('resize', onResizeCallback)
				articleObserver = observeUntilArticle()
			}
		} else {
			console.debug('Not a temporary chat URL, cleaning up listeners.')
			alreadyListening = false
			window.removeEventListener('beforeunload', beforeUnloadCallback)
			window.removeEventListener(
				CONVERSATION_EXISTS,
				conversationExistsCallback,
			)
			window.removeEventListener('resize', onResizeCallback)
			if (articleObserver) {
				console.debug('Disconnecting article observer.')
				articleObserver.disconnect()
				articleObserver = null
			}
		}
	}
}

function init() {
	console.debug('Initializing content script for tab guard.')
	chrome.runtime.onMessage.removeListener(handleMessage)
	chrome.runtime.onMessage.addListener(handleMessage)
	// Ensures the content script handles the current page correctly even if no
	// message is sent after injection.
	handleMessage({action: 'url-changed'})
}

init()
