# NodeCat - A Modern NodeJS IDE

NodeCat 是一个现代化的 Node.js 集成开发环境，旨在提供高效、便捷的代码编写和管理体验。

## 特性

- **代码高亮**：支持多种语言的语法高亮，包括 JavaScript、TypeScript、Vue、HTML、CSS 等。
- **多文件编辑**：轻松管理多个文件和标签页，提高工作效率。

## 构建方法

### 环境要求

- Node.js 和 npm（推荐使用版本 22 或更高）

### 设置镜像

默认Electron从github下载工具文件，由于网络原因，可能会失败。可以设置镜像来解决这个问题。

通过以下指令开始编辑`.npmrc`：

```bash
npm config edit
```

在`.npmrc`里添加以下内容：

```
// .npmrc
electron_mirror=https://cdn.npmmirror.com/binaries/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 安装依赖

```bash
npm install
```

### 构建安装程序

```bash
npm run build
```

### 运行开发服务器

```bash
npm run dev
```

## 贡献

欢迎任何形式的贡献！请提交 Pull Request 或创建 Issue 来参与项目。

## 鸣谢

- [electron](https://www.electronjs.org/)
- [vue](https://vuejs.org/)
- [tailwindcss](https://tailwindcss.com/)

以及其他开源项目的贡献者！

## 许可证

[MIT License](LICENSE)
