const fs = require("fs");
const path = require("path");

const { createCanvas, Image } = require('canvas');

let fn_processImage = async (ctx) => {
    const info = {};
    info.url = ctx.request.body.photoUrl || './images/demo.jpg';
    info.text = ctx.request.body.text !== undefined ? decodeURI(ctx.request.body.text) : new Date().toLocaleString();

    console.log(info);
    const imgPath = path.join(__dirname, '../images');
    // 如果目录不存在则创建
    if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath);

    let response = {};
    let _code = 0;
    let _message = ``;
    let { base64, error } = await getBase64(info);
    if (error === undefined) {
        var base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
        var dataBuffer = new Buffer(base64Data, 'base64');
        let m = new Date().getTime();
        let fileName = `./images/image_${m}.png`;
        let result = await new Promise(function (resolve, reject) {
            fs.writeFile(fileName, dataBuffer, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve('成功保存图片文件');
                }
            });
        });
        console.log(result);
        _message = `成功`;
        response.data = `/images/image_${m}.png`;
    } else {
        _code = 1;
        _message = `失败`;
        console.log(error);
    }

    response.code = _code;
    response.message = _message;

    ctx.response.body = response;
}

let getBase64 = (info) => {
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.onload = () => {
            console.log(`开始处理图片...`);
            const canvas = createCanvas(image.width, image.height);
            let ctx = canvas.getContext("2d");
            let w = Math.ceil(image.width / 100);
            let h = Math.ceil(image.height / 100);
            //加载图片
            ctx.drawImage(image, 0, 0);
            //加浅色图层
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(0, 0, image.width, image.height);
            //加水印
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "18px serif";
            // ctxword.textAlign = "center";
            ctx.rotate(-Math.PI / 4);
            let text = info.text || "1234567890";
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    let p = i % 2 === 0 ? 50 : 0;
                    ctx.fillText(text, -image.width * 2 / 3 + 200 * i, p + 150 * j);
                }
            }
            resolve({
                base64: canvas.toDataURL('image/jpeg', 1)
            });
        };
        image.onerror = (e) => {
            resolve({
                error: e
            });
        };
        image.src = info.url;
    });
}

module.exports = {
    "POST /canvas/processImage": fn_processImage,
}