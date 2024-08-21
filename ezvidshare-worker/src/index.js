
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

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

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


async function handleRequest(request) {
    if (request.method === 'OPTIONS') {
        return handleOptions(request)
    }
    
	const url = new URL(request.url)

	if (url.pathname.startsWith('/upload')) {
		return await handleUpload(request)
	} else if (url.pathname.startsWith('/share')) {
		return await handleShare(request)
	}
	return new Response('Not Found', { status: 404 })
}

async function handleShare(request) {
	const url = new URL(request.url)
	const objectName = url.searchParams.get('file')

	if (!objectName) {
		return new Response('Bad Request', { status: 400 })
	}

	const expiration = Math.floor(Date.now() / 1000) + 3600  // 1 hour expiration
	const signedUrl = await VIDEO_BUCKET.getSignedUrl(objectName, {
		expires: expiration,
	})

	return addCorsHeaders(new Response(signedUrl, { status: 200 }))
}
