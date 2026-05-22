# 会馆证件生成器（ID Card Generator）

一个基于 **React + Vite + Ant Design** 的证件卡生成工具：填写人物信息、选择能力、上传照片/底图，并在右侧 Canvas 实时渲染证件效果，支持导出 PNG。Github Pages 版：https://id.zscommunity.top

## 功能

- 证件信息填写：名字、种族、性别、职业、隶属会馆
- 出生日期：自定义日期选择器（支持公元前 / 大年份）
- 出生日期显示方式四选一（默认阳历）：
  - 阳历
  - 农历
  - 八字（四柱，支持可选出生时间）
  - 年龄
- 能力：支持多条能力记录（御灵系支持“金木水火土”二级属性）
- 证件照片上传/移除
- 底图 URL 或本地上传、并可移除
- 证件编号自动生成：`会馆代号-随机5位数字`（例如 `CN-45273`）
- Canvas 实时预览 + 一键下载 PNG

## 技术栈

- React
- Vite
- Ant Design
- dayjs
- lunar-javascript（1900~2100 精确农历/干支）

此外，项目内还包含一套基于 **儒略日（JD）** 的干支/农历推算逻辑，用于扩展到更宽的年份范围（按实际代码逻辑为准）。

## 环境要求

- Node.js：要求 **Node 20+**（Vite 8 需要）
- npm：随 Node 安装即可

检查版本：

```bash
node -v
npm -v
```

## 安装依赖 & 构建项目

```bash
cd 项目目录
npm install
npm run build
```


# 使用方法

## 1. `Clone` 仓库

```bash
git clone https://github.com/ZhongShengZhiMen-Technical-Support-Team/IDCard-Generator
```

## 2. 安装依赖 & 构建项目

```bash
npm i
# 或 yarn
npm run build
```

## 3. 启动

```bash
npm start
```
