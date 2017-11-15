'use strict';
 
var gulp                = require('gulp');
var sass                = require('gulp-sass');
var browser             = require('browser-sync').create();
var sourcemaps          = require('gulp-sourcemaps');
var postcss             = require('gulp-postcss');
var autoprefixer        = require('autoprefixer');
var iconfont            = require("gulp-iconfont");
var svgstore            = require('gulp-svgstore');
var svgmin              = require('gulp-svgmin');
var consolidate         = require("gulp-consolidate");
var rename              = require('gulp-rename');
var inject              = require('gulp-inject');
//Таска для создание одной большой svg

var svgWatch            = './assets/icons/*.svg';
var svgIconsSource      = './index.html';
var svgIconsDestination = './';

gulp.task('svgstore', function () {

    var svgs = gulp
        .src(svgWatch)  
        .pipe(rename({prefix: 'svg-'}))
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }));


    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src(svgIconsSource)
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest(svgIconsDestination));
});

//Конец таски для создание одной большой svg

//Таска sass
gulp.task('sass', function () {
  return gulp.src('assets/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      output_style: 'compressed',
      includePaths: ['node_modules/foundation-sites/scss', 'node_modules/normalize-scss/sass']
    }).on('error', sass.logError))
    .pipe(postcss([ autoprefixer({ browsers: ['last 3 version'] }) ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browser.stream({match: '**/*.css'}));
});

//Конец таски sass

//Таска для создание иконочных шрифтов

gulp.task("build:icons", function() {
    return gulp.src(["./assets/icons/*.svg"]) //path to svg icons
      .pipe(iconfont({
        fontName: "myicons",
        formats: ["ttf", "eot", "woff", "svg"],
        centerHorizontally: true,
        fixedWidth: true,
        normalize: true,
        fontHeight: 500
      }))
      .on("glyphs", (glyphs) => {

        gulp.src("./assets/icons/util/*.scss") // Template for scss files
            .pipe(consolidate("lodash", {
                glyphs: glyphs,
                fontName: "myicons",
                fontPath: "../assets/fonts/"
            }))
            .pipe(gulp.dest("./assets/scss/icons/")); // generated scss files with classes
      })
      .pipe(gulp.dest("./dist/assets/fonts/")); //icon font destination
});

//Конец таски для создание иконочных шрифтов

// Starts a BrowerSync instance
gulp.task('serve', ['sass'], function(){
  browser.init({
        server: {
            baseDir: "./"
        }
    });
});

// Runs all of the above tasks and then waits for files to change
gulp.task('default', ['serve'], function() {
  gulp.watch(['assets/scss/**/*.scss'], ['sass']);
  gulp.watch('./**/*.html').on('change', browser.reload);
});
