const form = document.getElementById('uploadForm');
const status = document.getElementById('status');
const progress = document.getElementById('progress');
const fileSizeDisplay = document.getElementById('fileSize');
const uploadSpeedDisplay = document.getElementById('uploadSpeed');
form.addEventListener('submit', async (e) => {
	e.preventDefault();

	const fileInput = document.getElementById('fileInput');
	const file = fileInput.files[0];
	const formData = new FormData();
	formData.append('file', file);

	//文件大小
	fileSizeDisplay.textContent = formatSize(file.size);



	const xhr = new XMLHttpRequest();
	xhr.open('POST', '/upload', true);

	let startTime;
	xhr.upload.addEventListener('loadstart', () => {
		startTime = new Date().getTime(); // 记录开始时间
	});

	// 监听上传进度
	xhr.upload.addEventListener('progress', (event) => {
		if (event.lengthComputable) {
			const percentComplete = (event.loaded / event.total) * 100;
			progress.style.width = percentComplete + '%'; // 更新进度条
			progress.textContent = Math.round(percentComplete) + '%'; // 可选：显示百分比
			// 计算上传速度
			const elapsedTime = (new Date().getTime() - startTime) / 1000; // 以秒为单位
			const speed = (event.loaded / 1024 / elapsedTime).toFixed(2); // KB/s
			uploadSpeedDisplay.textContent = `Upload Speed: ${speed} KB/s`;
		}
	});

	// 监听请求完成状态
	xhr.onload = () => {
		if (xhr.status === 200) {
			status.textContent = `Uploaded: ${xhr.responseText}`;
		} else {
			status.textContent = 'Upload failed';
		}
	};

	// 发送请求
	xhr.send(formData);
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
