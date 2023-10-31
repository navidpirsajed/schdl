function upload() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const chunkSize = 1024 * 1024; // 1MB
    let offset = 0;

    const reader = new FileReader();
    reader.onload = function() {
        const buffer = reader.result;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.setRequestHeader('X-Content-Offset', offset);
        xhr.setRequestHeader('X-Content-Length', buffer.byteLength);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                offset += buffer.byteLength;
                if (offset < file.size) {
                    readSlice(offset);
                } else {
                    console.log('Upload complete!');
                }
                // handle the response from the server
                const blob = new Blob([xhr.response], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.width = '100%';
                iframe.height = '100%';
                document.body.appendChild(iframe);
                URL.revokeObjectURL(url);
            }
        };
        xhr.responseType = 'arraybuffer';
        xhr.send(new Uint8Array(buffer));
    };

    function readSlice(offset) {
        const slice = file.slice(offset, offset + chunkSize);
        reader.readAsArrayBuffer(slice);
    }

    readSlice(offset);
}
console.log('Hello from app.js');