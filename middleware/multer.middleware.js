const sharp = require('sharp');
const multer = require('multer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    return cb(new AppError('Only images formats are allowed!', 400), false);
  }
};

const storage = function(path, slug) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `public/img/${path}`);
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split('/').pop();
      const img = `${slug}-${req.user._id}-${Date.now()}.${ext}`;
      cb(null, img);
    }
  });
};

const upload = function(stg) {
  return multer({
    storage: stg,
    fileFilter: multerFilter,
    limits: { fileSize: 5000 * 1024 }
  });
};

//User Storage
// const userStorage = storage('users', 'user');
// const userUpload = upload(userStorage);

const userMemoryStorage = multer.memoryStorage();
const userUpload = upload(userMemoryStorage);
const uploadUserPhoto = userUpload.single('photo');

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

//Tour Storage
const tourMemoryStorage = multer.memoryStorage();
const tourUpload = upload(tourMemoryStorage);

// mix with upload.single, and upload.array
const uploadTourImages = tourUpload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files || !req.files.imageCover || !req.files.images) return next();

  //1) Cover Image -->
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) Images -->
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
});

module.exports = {
  uploadUserPhoto,
  resizeUserPhoto,
  uploadTourImages,
  resizeTourImages
};
