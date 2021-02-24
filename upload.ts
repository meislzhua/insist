let OSS = require('ali-oss');
let fs = require('fs');
let path = require('path');

let client = new OSS({
  region: 'oss-accelerate',
  accessKeyId: 'LTAI4FyQWa1kXqV7eKX1gyfL',
  accessKeySecret: 'xgaPjagoIOY14GUSfRNxztnM6gY9VK',
  bucket: "insist",
  secure: true
});

async function upload({dir, target = [], tasks = []}: { dir: string, target?: string[], tasks?: Promise<any>[] }) {
  let filenames = await fs.promises.readdir(dir)
  for (let filename of filenames) {
    let filePath = path.resolve(dir, filename);
    let stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) await upload({dir: filePath, target: [...target, filename], tasks})
    else if (stat.isFile()) {
      tasks.push(client.put([...target, filename].join("/"), filePath))
    }
  }
  await Promise.all(tasks)
}

(async () => {
  while (true) {
    let result = await client.list({"max-keys": 1000});
    result = result.objects.map((v: any) => v.name);
    await client.deleteMulti(result);
    if (result.length !== 1000) break;
  }
  await upload({dir: path.resolve(__dirname, "dist")})
  console.log("上传成功")
})()
