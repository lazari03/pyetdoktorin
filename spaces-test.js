const AWS = require('aws-sdk');
const fs = require('fs');

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO801HVB6L92Y8VUDV4Y',
  secretAccessKey: 'iZ//4qcS4HkApxvxqGdkVZu0+q1HSHHegrjLT9liM8I',
  region: 'fra1',
  signatureVersion: 'v4',
});

// Upload to the 'img' folder
s3.getSignedUrl('putObject', {
  Bucket: 'portokalle-storage',
  Key: 'img/doc-img/test.txt',
  Expires: 60,
  ContentType: 'text/plain',
  ACL: 'public-read',
}, (err, url) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Signed URL:', url);
    // Optionally, upload a file using the signed URL
    fs.writeFileSync('test.txt', 'Hello from DigitalOcean Spaces!');
    const execSync = require('child_process').execSync;
    try {
      execSync(`curl -X PUT -T test.txt -H "Content-Type: text/plain" "${url}"`, { stdio: 'inherit' });
      console.log('Upload succeeded!');
    } catch (e) {
      console.error('Upload failed:', e);
    }
    fs.unlinkSync('test.txt');
  }
});
