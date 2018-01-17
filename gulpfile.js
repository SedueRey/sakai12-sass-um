'use strict';

const pkg = require('./package.json');

// SCSS

var postcss      = require('gulp-postcss');
var gulp         = require('gulp');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var connect      = require('gulp-connect-php');
var clean        = require('gulp-clean');
var browserSync  = require('browser-sync').create();
var flog         = require('fancy-log');

// JS

const buffer       = require('gulp-buffer');
const uglify       = require('gulp-uglify');
const tap          = require('gulp-tap');
const browserify   = require('browserify');
const babel        = require('babelify');
const concat       = require('gulp-concat');
const exec         = require('child_process').exec;

// Static Server + watching scss/html files

gulp.task('serve', ['sass'], function() {

    browserSync.init({
        injectChanges: true,
        proxy: "http://localhost:8080/portal/"
    });

    gulp.watch( pkg.paths.src.scss + '**/*.scss', ['sass']);
    gulp.watch( pkg.paths.dist.base + '**/*.css' ).on('change', browserSync.reload);

});

var svgSprite = require("gulp-svg-sprites");
 
gulp.task('sprites', function () {
    return gulp.src( pkg.paths.src.svg + '/*.svg')
        .pipe(svgSprite({
            baseSize: 16,
            preview: false,
            cssFile: pkg.paths.src.scss + "modules/_icons.scss",
            svg: {
                sprite: pkg.paths.dist.svg + "svg.svg"
            }
        }))
        .pipe(gulp.dest( './' ));
});


gulp.task('sass', function () {
    flog("-> Compiling scss:");
    gulp.src( pkg.paths.src.scss + '**/*.scss' )
    .pipe(sass({sourcemap: true, outputStyle: 'compact', trace: false}).on('error', sass.logError ) )
    .pipe(postcss([ autoprefixer({ browsers: ['last 4 versions'] }) ]))
    .pipe( gulp.dest(pkg.paths.dist.css) )
    .pipe(browserSync.stream());
});

gulp.task('watch', function () {
  //gulp.watch( pkg.paths.src.scss + '/**/*.*' , ['clean']);
  //gulp.watch( pkg.paths.src.js + '/**/*.*' , ['clean']);
  //gulp.watch( pkg.paths.src.scss + '/**/*.*' , ['directories']);
  //gulp.watch( pkg.paths.src.js + '/**/*.*' , ['directories']);
  gulp.watch( pkg.paths.src.scss + '/**/*.*' , ['sass', 'js']);
  gulp.watch( pkg.paths.src.js + '/**/*.*' , ['sass', 'js']);
  //gulp.watch( pkg.paths.src.scss + '/**/*.*' , ['publish']);
  //gulp.watch( pkg.paths.src.js + '/**/*.*' , ['publish']);
  //gulp.watch( pkg.paths.dist.base + '/**/*.php'  , ['clean']);
  //gulp.watch( pkg.paths.dist.base + '/**/*.php'  , ['directories']);
  //gulp.watch( pkg.paths.dist.base + '/**/*.php'  , ['sass', 'js']);
  //gulp.watch( pkg.paths.dist.base + '/**/*.php'  , ['publish']);
});

gulp.task('clean', function(){
    flog("-> limpiando directorio:");
    gulp.src( pkg.paths.publish.base , {read: false}).pipe(clean( {force: true} ));
});

gulp.task('js', () => {
  return gulp.src( pkg.paths.src.js+ '**/*.js', { read: false })
    .pipe(tap((file) => {
      file.contents = browserify(file.path, {
        debug: true
      }).transform(babel, {
        presets: [ 'es2015' ]
      }).bundle();
    }))
    .pipe(buffer())
    //.pipe(sourcemaps.init({ loadMaps: true }))
    //.pipe(uglify())
    //.pipe(sourcemaps.write('./'))
    //.pipe(concat( pkg.nameclean + '.js' ))
    .pipe(gulp.dest( pkg.paths.dist.js ));
});

gulp.task('directories', function (cb) {
  flog("-> Esperando a clean ...");
  setTimeout( () => {
    flog("-> ... fin de espera. Creando directorio");
    exec('mkdir ..\\..\\lowgolf\\wp-content\\themes\\', function (e) { 
      cb(e); 
    });  
  }, 1500 );
});

gulp.task('publish', function (cb) {
  flog("-> Esperando a directories ...");
  setTimeout( () => {
    flog("-> ... fin de espera. Publicando assets");
    exec('cp -rf ../lowgolf-theme ../../lowgolf/wp-content/themes/lowgolf-theme', function (e) { 
      cb(e); 
    });
    }, 2500 );
})

gulp.task('default', ['sass:watch', 'serve'] );