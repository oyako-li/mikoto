import express from 'express';
import { createEngine } from './createEngine';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import path from 'path';

const router = express();
// const isTsNodeDev = Object.keys(require.cache).some(path => path.includes('/ts-node-dev/'));
// const ext = isTsNodeDev ? 'tsx' : 'js';
// console.log(__dirname);
// router.set('views', path.join(__dirname, '../src/renderer'));
// router.set('view engine', ext);
// router.engine(ext, createEngine());
router.use(express.json());
router.use(cookieParser());
router.use(express.static('dist'));
router.use(express.urlencoded({ extended: false }));

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  next();
});
// error handler
router.use(function(err:any, req:any, res:any, next:any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default router;