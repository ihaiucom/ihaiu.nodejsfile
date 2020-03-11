
# ihaiu.nodejsfile
nodejs 文件操作


* 拷贝文件或目录

```
node index.js -C copy -s ./ -t ./aa/bb/cc     

``` 

* 创建文件夹

```
node index.js -C mkdir -s ./aa/bb/cc/dd   
``` 

* 删除文件或者目录

```
node index.js -C delete -s ./aa/bb/cc/dd
```


* 文件写入

```
node index.js -C write -s ./aaa/bb/a.txt -b "Hello World中午2" -f w  -e utf8
```

* 文件读取

```
node index.js -C read -s ./aaa/bb/a.txt
```



* 文件重命名或者移动文件

```
node index.js -C rename -s ./aa/cc/a.txt -d ./aa/cc/b.txt -o true
```


```
Usage: index [options]

Options:
  -V, --version           output the version number
  -C, --cmd <lang>        命令名称: copy、delete、 mkdir、write、 read、 rename
  -s, --srcpath <path>    路径
  -d, --destpath [path]   拷贝文件目标路径
  -o, --over [boolean]    是否覆盖
  -i, --ignorehide        是否忽略隐藏文件
  -b, --body [lang]       写入文件的内容
  -f, --flag [lang]       写入文件的flag, w, http://nodejs.cn/api/fs.html#fs_file_system_flags
  -e, --encoding  [lang]  默认值: utf8
  -h, --help              output usage information



```















# 学习开发npm笔记
### 创建npm项目
* github创建一个项目clone到本地
* 执行 npm init 命令配置一些paackage.json
```
npm init
```
* 创建一个index.js文件
* 执行 npm login 登录
* 执行 npm publish 推送

### 安装依赖

安装 fs，path等依赖

```
cnpm install @types/node --save-dev
```

安装 命令行依赖
```
cnpm install commander --save
```

### 创建TypeScript项目
* tsc -init
* 修改package.js

```
"main": "bin/index.js",
```

### 编译TypeScript项目

```
tsc
```

### 测试

```
node bin/index.js
```