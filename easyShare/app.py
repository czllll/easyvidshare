from flask import Flask, request, jsonify, render_template_string, url_for
from flask_cors import CORS
import os
from uploader import OSSFileUploader, create_bucket

app = Flask(__name__)
CORS(app)
uploader = OSSFileUploader()
bucket = create_bucket()

UPLOAD_FOLDER = './uploads'


@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file part'})

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No selected file'})

        # 检查并创建目标目录
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        target_file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(target_file_path)

        object_path = file.filename  # 设置文件在OSS中的路径
        file_url = uploader.upload_file(bucket, target_file_path, object_path)

        # 返回一个可以播放视频的URL
        play_url = url_for('play_video', filename=object_path, _external=True)
        return jsonify({'success': True, 'url': play_url})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})


@app.route('/play/<filename>', methods=['GET'])
def play_video(filename):
    try:
        file_url = bucket.sign_url('GET', filename, 3600)  # 获取有效期为1小时的签名URL
        return render_template_string('''
        <!DOCTYPE html>
        <html>
        <head>
            <title>Video Player</title>
        </head>
        <body>
            <h1>Video Player</h1>
            <video width="800" controls>
                <source src="{{ file_url }}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </body>
        </html>
        ''', file_url=file_url)
    except Exception as e:
        return f'Error: {str(e)}'


if __name__ == '__main__':
    app.run(debug=True)
