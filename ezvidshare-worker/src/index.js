async function handleOptions(request) {
    let headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    return new Response(null, { headers })
}

function addCorsHeaders(response) {
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', '*')
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
    })
}

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	if (request.method === 'OPTIONS') {
		return handleOptions(request)
	}

	const url = new URL(request.url)

	if (url.pathname.startsWith('/upload')) {
		return await handleUpload(request)
	}
	return new Response('Not Found', { status: 404 })
}

async function handleUpload(request) {
	const contentType = request.headers.get('content-type') || ''
	if (!contentType.includes('multipart/form-data')) {
		return new Response('Bad Request', { status: 400 })
	}

	const formData = await request.formData()
	const file = formData.get('file')

	if (!file || !(file instanceof File)) {
		return new Response('Bad Request', { status: 400 })
	}

	const bucket = VIDEO_BUCKET  // R2 bucket binding
	const objectName = `${Date.now()}-${file.name}`
	await bucket.put(objectName, file.stream())

	return addCorsHeaders(new Response(`File uploaded: ${objectName}`, { status: 200 }))
}




