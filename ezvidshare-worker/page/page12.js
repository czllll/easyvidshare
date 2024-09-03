const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const fileInput = document.getElementById('fileInput')
const url = document.getElementById('url')
const uploadArea = document.getElementById("fileUpload")
const fileDropAreaTitle = document.getElementById("fileDropAreaTitle")
const formData = new FormData();


// 点击上传
uploadArea.addEventListener('click', () => {
	fileInput.click();
});

// 拖拽上传
uploadArea.addEventListener('dragover', (event) => {
	event.preventDefault();
	uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
	uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (event) => {
	event.preventDefault();
	uploadArea.classList.remove('dragover');
	const file = event.dataTransfer.files[0];
	handleFiles(file);
});

function handleFiles(file){
	if (file) {
		const fileType = file.type;
		if (!fileType.startsWith('video/')) {
			alert('Please upload a valid video file.');
			fileInput.value = ''; // 清空文件选择

		}else {
			fileDropAreaTitle.textContent = file.name + `(${formatSize(file.size)})`;
			document.getElementById("uploadBtn").disabled = false
			document.getElementById("uploadBtn").style.cursor = "pointer"
			formData.append('file', file);

		}

	}
}

fileInput.addEventListener('change',async (e) =>{

	//获取文件
	const fileInput = document.getElementById('fileInput');
	const file = fileInput.files[0];

	handleFiles(file)


});

form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const fileInput = document.getElementById('fileInput');
	const file = fileInput.files[0];
	const xhr = new XMLHttpRequest();
	if(!formData){
		formData.append('file', file);
	}
	xhr.open('POST', '*/upload', true);

	let startTime;
	xhr.upload.addEventListener('loadstart', () => {
		startTime = new Date().getTime(); // 记录开始时间
	});

	// 监听上传进度
	xhr.upload.addEventListener('progress', (event) => {
		if (event.lengthComputable) {
			const percentComplete = (event.loaded / event.total) * 100;
			progress.style.width = percentComplete + '%';
			progress.textContent = Math.round(percentComplete) + '%';
		}
	});

	// 监听请求完成状态
	xhr.onload = () => {
		if (xhr.status === 200) {
			try {
				let data = JSON.parse(xhr.responseText)
				url.value = data.url
				handleUrlChange();
				const qrcodeUrl = ''
				document.getElementById("qrcode").innerHTML = "";
			}catch (e) {
				console.error("Fail to parse to Json", e)
			}
		} else {
			status.textContent = 'Upload failed';
		}
	};

	// 发送请求
	xhr.send(formData);
});


//生成二维码
function handleUrlChange(){
	url.style.cursor = "pointer";
	url.disabled = false
	document.getElementById('generateQR').style.display = 'block';
}
document.getElementById('generateQR').addEventListener('click', evt => {
	let shareUrl = url.value;
	console.log('URL to generate QR code:', shareUrl);
	if (shareUrl) {
		let modal = document.getElementById("myModal");
		modal.style.display = "block";
		new QRCode(document.getElementById('qrcode'), {
			text: shareUrl,
			width: 200,
			height: 200,
			colorDark : "#000000",
			colorLight : "#ffffff",
		});

		console.log('QR code generated successfully.');
	} else {
		console.error('URL is empty. QR code generation skipped.');
	}
});


function formatSize(size) {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let index = 0;
	while (size >= 1024 && index < units.length - 1) {
		size /= 1024;
		index++;
	}
	return `${size.toFixed(2)} ${units[index]}`;
}

function copyUrl(inputElement){
	navigator.clipboard.writeText(inputElement.value).then(function() {
		alert("Copied: " + inputElement.value);
	}).catch(function(error) {
		alert("Copy failed: " + error);
	});

}
function closeModal() {
	var modal = document.getElementById("myModal");
	modal.style.display = "none";
}


function refreshInput(){
	document.getElementById("uploadForm").reset();
	const inputs = document.querySelectorAll("input");
	fileDropAreaTitle.textContent = 'Drag Or Select your files here and click Upload';
	document.getElementById("uploadBtn").disabled = true
	inputs.forEach(input =>{
		input.value = '';
	});
	document.getElementById('generateQR').style.display = 'none';
	progress.style.width = "0"
	progress.textContent = ''
	url.disabled = true
	url.style.cursor = "";

}
