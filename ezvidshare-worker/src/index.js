//接受请求
addEventListener('fetch', event => {
	//service worker FetchEvent的实例方法respondWith
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	//处理跨域请求
	if (request.method === 'OPTIONS') {
		return handleOptions(request)
	}
	const url = new URL(request.url)

	if (url.pathname.startsWith('/upload')) {
		return await handleUpload(request)
	}
	return new Response('Not Found', { status: 404 })
}


async function handleOptions(request) {
    let headers = {
        'Access-Control-Allow-Origin': 'https://ezvidshare.dirtsai.tech',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
    return new Response(null, { headers })
}


async function handleUpload(request) {
	//判断文本类型
	const contentType = request.headers.get('content-type') || ''
	if (!contentType.includes('multipart/form-data')) {
		return new Response('Bad Request', { status: 400 })
	}

	const formData = await request.formData()
	const file = formData.get('file')

	if (!file || !(file instanceof File)) {
		return new Response('Bad Request', { status: 400 })
	}
	// R2 bucket binding
	const bucket = VIDEO_BUCKET
	const objectName = generateRandomString(5)
	await bucket.put(objectName, file.stream())

	//url生成
	const shareUrl = `https://*/${objectName}`
	return new Response(
		JSON.stringify({ url: shareUrl }),
		{
			status: 200, // status: HTTP 状态码
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': 'https://*',
			}
		}
	);

}

function generateRandomString(length) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
}





