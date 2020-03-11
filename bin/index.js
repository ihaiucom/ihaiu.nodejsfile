#!/usr/bin/env node

'use strict'
var path = require('path');
var fs = require('fs');
var program = require('commander');



//获取文件的后后缀名
function getSuffix(url) 
{
    var lastIndex = url.lastIndexOf('.');
    if (lastIndex == -1) {
        console.log('[error] path do not inclue a file name:', url);
        return;
    }

    return url.substring(lastIndex);
}

//获取绝对路径
function getAbsolutePath(url) 
{
    if (!path.isAbsolute(url)) {
        url = path.join(process.cwd(), url);
    }
    return path.normalize(url)
}

// 是否是文件夹
function isFile(url)
{
    if(fs.existsSync(url))
    {
        var stat = fs.lstatSync(url);
        return stat.isFile();
    }
    return false;
}

// 是否是文件夹
function isDirectory(url)
{
    if(fs.existsSync(url))
    {
        var stat = fs.lstatSync(url);
        return stat.isDirectory();
    }
    return false;
}

// 获取父级路径
function getDirPath(url)
{
    if (!path.isAbsolute(url)) 
    {
        url = getAbsolutePath(url);
    }
    return path.dirname(url)
}

// 检查父级目录是否存在，不存在就创建
function checkDirPath(url)
{
    var dirPath = getDirPath(url);
    if(!fs.existsSync(dirPath))
    {
        // console.log("mkdir", dirPath);
        fs.mkdirSync(dirPath, {recursive: true});
    }
}

// 创建目录
function mkdir(srcPath)
{
    if(!fs.existsSync(srcPath))
    {
        // console.log("mkdir", srcPath);
        fs.mkdirSync(srcPath, {recursive: true});
    }
}

// 拷贝文件
function copy(srcPath, destPath, isOver=true, isIgnoreHide = true)
{
    srcPath = getAbsolutePath(srcPath);
    destPath = getAbsolutePath(destPath);
    if(srcPath == destPath)
    {
        console.warn("拷贝路径一样", srcPath);
        return;
    }

    if(!fs.existsSync(srcPath))
    {
        console.warn("文件不存在:", srcPath);
        return;
    }


    var stat = fs.lstatSync(srcPath);
    if(stat.isFile())
    {
        copyFile(srcPath, destPath, isOver);
    }
    else
    {
        var paths = fs.readdirSync(srcPath); //同步读取当前目录
        for(var i = 0, len = paths.length; i < len; i ++)
        {
            var name = paths[i];
            if(isIgnoreHide)
            {
                if(name.startsWith("."))
                {
                    continue;
                }
            }
            var itemSrc = path.join(srcPath, name);
            var itemDest = path.join(destPath, name);
            var stat = fs.lstatSync(itemSrc);
            if(stat.isFile())
            {

                // console.log("file itemSrc", itemSrc, "    ", itemDest);
                copyFile(itemSrc, itemDest, isOver);
            }
            else if(stat.isDirectory())
            {
                if(itemDest.startsWith(itemSrc))
                {
                    console.warn("拷贝路径嵌套死循环", itemSrc, "   ", itemDest);
                    continue;
                }
                copy(itemSrc, itemDest, isOver, isIgnoreHide);

            }

        }

    }

}

function copyFile(srcPath, destPath, isOver)
{
    if(isOver)
    {
        if(fs.existsSync(destPath))
        {
            fs.unlinkSync(destPath);
        }
        
        checkDirPath(destPath);
        fs.copyFileSync(srcPath, destPath);
    }
    else if(!fs.existsSync(destPath))
    {
        checkDirPath(destPath);
        fs.copyFileSync(srcPath, destPath);
    }
    // let  readable=fs.createReadStream(srcPath);//创建读取流
    // let  writable=fs.createWriteStream(destPath);//创建写入流
    // readable.pipe(writable);
}

// 删除文件或者目录
function deleteFileOrDir(srcPath)
{
    
    if(!fs.existsSync(srcPath))
    {
        console.warn("文件不存在:", srcPath);
        return;
    }


    var stat = fs.lstatSync(srcPath);
    if(stat.isFile())
    {
        fs.unlinkSync(srcPath);
    }
    else if(stat.isDirectory())
    {
        var paths = fs.readdirSync(srcPath); //同步读取当前目录
        for(var i = 0, len = paths.length; i < len; i ++)
        {
            var name = paths[i];
            var itemSrc = path.join(srcPath, name);
            var stat = fs.lstatSync(itemSrc);
            if(stat.isFile())
            {
                fs.unlinkSync(itemSrc);
            }
            else if(stat.isDirectory())
            {
                deleteFileOrDir(itemSrc);
            }
        }
        fs.rmdirSync(srcPath);
    }
}

// 写入文件
function write(srcPath, body,  flag="w", encoding="utf8")
{
    checkDirPath(srcPath);
    fs.writeFileSync(srcPath, body, {flag: flag, encoding:encoding});
}

// 读取文件
function read(srcPath, encoding="utf8", flag="a", )
{
    if(!fs.existsSync(srcPath))
    {
        return "";
    }
    return fs.readFileSync(srcPath,  { encoding: encoding, flag: flag })
}

// 重命名
function rename(srcPath, destPath, isOver = true)
{
    if(!fs.existsSync(srcPath))
    {
        console.error("文件不存在 srcPath:", srcPath);
        return;
    }
    
    if(!isOver)
    {
        if(fs.existsSync(destPath))
        {
            console.error("目标文件已经存在 destPath:", destPath);
            return;
        }
    }
    
    checkDirPath(destPath);
    fs.renameSync(srcPath, destPath);
}

// 命令类型
var CmdType = 
{
    "none": "",
    "copy": "copy",
    "delete": "delete",
    "mkdir": "mkdir",
    "write": "write",
    "read": "read",
    "rename": "rename"
};




// 程序参数
program.version('1.0.8');

program
    .option('-C, --cmd <lang>', '命令名称: copy、delete、 mkdir、write、 read、 rename')
    .option('-s, --srcpath <path>', '路径')
    .option('-d, --destpath [path]', '拷贝文件目标路径')
    .option('-o, --over [boolean]', '是否覆盖')
    .option('-i, --ignorehide', '是否忽略隐藏文件')
    .option('-b, --body [lang]', '写入文件的内容')
    .option('-f, --flag [lang]', '写入文件的flag, w, http://nodejs.cn/api/fs.html#fs_file_system_flags')
    .option('-e, --encoding  [lang]', '默认值: utf8');
     

program.parse(process.argv);




// console.log(process.argv);
// console.log(program.opts());


// 获取参数
var cmdType = CmdType.none;
var srcPath = "";
var destPath = "";
var body = "";
var flag = "w";
var encoding = "utf8";
var over = true;
var ignorehide = true;

if(program.cmd)
{
    cmdType = program.cmd.toLowerCase();
}

if(program.over)
{
    if(program.over == 0 || program.over == false || program.over == "0" || program.over.toLowerCase() == "false")
    {
        over = false;
    }
}

if(program.ignorehide)
{
    
    if(program.ignorehide == 0 || program.ignorehide == false || program.ignorehide == "0" || program.ignorehide.toLowerCase() == "false")
    {
        ignorehide = true;
    }
}

if (program.srcpath) 
{
    srcPath = getAbsolutePath(program.srcpath);
}

if (program.destpath) 
{
    destPath = getAbsolutePath(program.destpath);
}

if (program.body) 
{
    body = program.body;
}


if (program.flag) 
{
    flag = program.flag;
}

if (program.encoding) 
{
    encoding = program.encoding;
}

switch(cmdType)
{
    case CmdType.copy:
        
        if (srcPath.length == 0) 
        {
            console.error("[error] srcpath ", srcPath);
            console.error("-C copy -s srcpath -d destpath [--over] [--ignorehide]");
            printHelp();
            return;
        }

        if (destPath.length == 0) 
        {
            console.error("[error] destPath ", destPath);
            console.error("-C copy -s srcpath -d destpath [--over] [--ignorehide]");
            printHelp();
            return;
        }
        copy(srcPath, destPath, over, ignorehide);
        break;
        
    case CmdType.delete:
        if (srcPath.length == 0) 
        {
            console.error("-C delete -s srcpath");
            printHelp();
            return;
        }
        deleteFileOrDir(srcPath);
        break;
        
    case CmdType.mkdir:
        if (srcPath.length == 0) 
        {
            console.error("-C mkdir -s srcpath");
            printHelp();
            return;
        }
        mkdir(srcPath);
        break;
        
    case CmdType.write:
        if (srcPath.length == 0) 
        {
            console.error("-C write -s srcpath -b 'hello world'  [-f w] [-e utf8]");
            printHelp();
            return;
        }
        
        if (program.flag) 
        {
            flag = program.flag;
        }
        else
        {
            flag = "w";
        }

        write(srcPath, body, flag, encoding);
        break;
    case CmdType.read:
        if (srcPath.length == 0) 
        {
            console.error("-C read -s srcpath  [-f r] [-e utf8]");
            printHelp();
            return;
        }
        
        if (program.flag) 
        {
            flag = program.flag;
        }
        else
        {
            flag = "r";
        }
        var content = read(srcPath, encoding, flag);
        console.log(content);
        return content;
        break;
    case CmdType.rename:
        if (srcPath.length == 0) 
        {
            console.error("[error] srcPath ", srcPath);
            console.error("-C rename -s srcpath -d destpath");
            printHelp();
            return;
        }

        if (destPath.length == 0) 
        {
            console.error("[error] destPath ", destPath);
            console.error("-C rename -s srcpath -d destpath");
            printHelp();
            return;
        }
        
        rename(srcPath, destPath, over);
        return content;
        break;
    default:
        printHelp();
        break;
}

function printHelp()
{
    console.log('zffile -C copy -s ./ -t ./aa/bb/cc      ');
    console.log('zffile -C mkdir -s ./aa/bb/cc/dd    ');
    console.log('zffile -C delete -s ./aa/bb/cc/dd    ');
    console.log('zffile -C write -s ./aaa/bb/a.txt -b "Hello World中午2" -f w  -e utf8');
    console.log("zffile -C read -s ./aaa/bb/a.txt ");
    console.log("zffile -C rename -s ./aa/cc/a.txt -d ./aa/cc/b.txt -o true");
    program.help();
}
