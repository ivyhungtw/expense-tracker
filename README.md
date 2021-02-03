# 老爸私房錢

此專案提供使用者瀏覽、新增、修改、分類及刪除支出

## 功能列表

- 瀏覽所有支出
- 顯示所有支出的總金額
- 依照類別篩選支出
- 新增一筆支出
- 修改一筆支出
- 刪除一筆支出

## 專案畫面

![Home page](/public/photos/index.png)
![New page](/public/photos/new.png)

## 安裝與執行步驟

#### 下載專案

```
git clone https://github.com/ivyhungtw/expense-tracker.git
```

#### 移動至專案資料夾

```
cd expense-tracker
```

#### 安裝套件

```
npm install
```

#### 載入 seed data

```
npm run seed
```

#### 使用 nodemon 啟動伺服器

```
npm run dev
```

啟動後請至 [http://localhost:3000](http://localhost:3000) 開始使用

## 環境建置

- Node.js v14.15.1 -執行環境
- Express v4.17.1 -框架
- Express-handlebars v5.2.0 -模板引擎
- mongoDB Community Serve v4.2.12 -資料庫
- mongoose v5.11.14 -ODM
- body-parser v1.19.0
- method-override v3.0.0
