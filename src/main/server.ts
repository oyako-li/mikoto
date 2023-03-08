import express from 'express';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import path from 'path';
import pug from 'pug';
const router = express();
// router.set('view engine', 'ejs');
// router.set('view', path.join(__dirname, '../renderer'))
router.set("views", path.join(__dirname, "views"))
router.set("view engine", "pug")
router.use(express.json());
router.use(cookieParser());
router.use(express.static('dist'));
router.use(express.urlencoded({ extended: false }));

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  next(createError(404));
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

router.get('/', async (req, res) => { // <2>
  console.log('get /');
  res.sendFile(path.join(__dirname, 'index.html'))
});

// router.get('/list/', async (req, res) => {
//   const files = await glob(`${app.getPath('userData')}/log/*`);
//   console.log(files);
//   return res.json({ body:files});
// });

router.get('/log/:filename', async (req, res) => {
  const filename = req.params.filename;
  res.download(filename.replace(',','/'), (err) => {
    if (err) {
      console.log('Error downloading file:', err);
    } else {
      console.log('File downloaded successfully');
    }
  });
});

export default router;