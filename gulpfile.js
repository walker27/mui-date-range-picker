const gulp = require('gulp'),
    path = require('path'),
    ts = require('gulp-typescript'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    tsProject = ts.createProject('tsconfig.json');

const srcDir = 'src',
    distDir = 'dist';

gulp.task('compile-ts', function() {
    return tsProject.src()
        .pipe(ts(tsProject)).js
        .pipe(gulp.dest(distDir));
});

gulp.task('compile-scss', function() {
    return sass(srcDir+'/scss/mui.daterangepicker.scss')
        .pipe(autoprefixer('iOS 8','Android 4.3'))
        .pipe(gulp.dest(distDir))
});

gulp.task('watch-ts', function() {
    gulp.watch([`${srcDir}/*.ts`, `!${srcDir}/*.d.ts`], ['compile-ts']);
});

gulp.task('default', function(){
    gulp.watch([`${srcDir}/ts/*.ts`, `!${srcDir}/ts/*.d.ts`], ['compile-ts']);
    gulp.watch([`${srcDir}/scss/*.scss`], ['compile-scss']);
})