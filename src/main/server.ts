import express from 'express';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import path from 'path';
import fs from 'fs';
// import pug from '../../dist/views/list.pug';
const app = express();

app.use(express.static('dist'));
// console.log(path.join(__dirname, '../../dist/log'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// catch 404 and forward to error handler
app.get("/log/", (req, res) => {
  console.log(path.join(__dirname, './templates/index.html'), __dirname + '/views');
  res.status(200).sendFile(path.join(__dirname, './templates/index.html'));
});

app.get('/list', (req, res) => {
  const files = fs.readdirSync('./dist/log/');
  res.render('list', { files });
});

app.get('/log/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = __dirname + '/dist/' + filename;
  res.download(filePath, (err) => {
    if (err) {
      console.log('Error downloading file:', err);
    } else {
      console.log('File downloaded successfully');
    }
  });
});

app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err:any, req:any, res:any, next:any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;