from abc import ABC, abstractmethod
import oss2
import os
from dotenv import load_dotenv

class FileUploader(ABC):
    @abstractmethod
    def upload_file(self, bucket, target_file_path, object_path):
        pass

class OSSFileUploader(FileUploader):
    def upload_file(self, bucket, target_file_path, object_path):
        with open(target_file_path, 'rb') as fileobj:
            res = bucket.put_object(object_path, fileobj)
            if res.status != 200:
                raise Exception('Upload %s error, status:%s' % (target_file_path, res.status))
        return bucket.sign_url('GET', object_path, 3600)  # Return a signed URL valid for 1 hour

def create_bucket():
    load_dotenv()
    auth = oss2.Auth(os.getenv('OSS_ACCESS_KEY_ID'), os.getenv('OSS_ACCESS_KEY_SECRET'))
    bucket = oss2.Bucket(auth, 'https://oss-cn-hangzhou.aliyuncs.com', 'easyvidshare')
    return bucket
